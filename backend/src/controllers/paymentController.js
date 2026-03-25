import crypto from 'crypto';
import Transaction from '../models/Transaction.js';
import Job from '../models/Job.js';

export const initiateEsewaPayment = async (req, res) => {
  try {
    const { amount, jobId } = req.body;
    
    // Generate a unique ID for this transaction
    const orderId = `JOB-${jobId}-${Date.now()}`;

    // 1. Create the signature string required by eSewa
    // Format: total_amount,transaction_uuid,product_code
    const signatureString = `total_amount=${amount},transaction_uuid=${orderId},product_code=${process.env.ESEWA_MERCHANT_CODE}`;
    
    // 2. Hash it using your Secret Key
    const hash = crypto
      .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
      .update(signatureString)
      .digest('base64');

    // 3. Save pending transaction to DB
    await Transaction.create({
      orderId,
      amount,
      jobId,
      hirerId: req.user._id, // From authMiddleware
      signature: hash
    });

    // 4. Send data to frontend to populate the eSewa form
    res.status(200).json({
      amount,
      orderId,
      signature: hash,
      merchantCode: process.env.ESEWA_MERCHANT_CODE
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEsewaPayment = async (req, res) => {
  try {
    // eSewa can redirect with data in query (GET) or body (POST)
    const rawData = req.query.data || req.body?.data;

    if (!rawData) {
      return res.status(400).json({ message: 'Missing payment data' });
    }

    // 1. Decode the Base64 data string from eSewa (safe for URL encoding)
    const decodedString = Buffer.from(decodeURIComponent(rawData), 'base64').toString('utf-8');
    const decodedData = JSON.parse(decodedString);

    /* 
       decodedData looks like:
       {
         "status": "COMPLETE",
         "signature": "...",
         "transaction_uuid": "JOB-123-...",
         "total_amount": "100.0",
         ...
       }
    */

    // 2. Security Check: Re-calculate signature to verify it came from eSewa
    // Format: status,total_amount,transaction_uuid,product_code,signed_field_names
    const signedFieldNames = decodedData.signed_field_names || 'total_amount,transaction_uuid,product_code';
    const message = `status=${decodedData.status},total_amount=${decodedData.total_amount},transaction_uuid=${decodedData.transaction_uuid},product_code=${decodedData.product_code},signed_field_names=${signedFieldNames}`;

    const secretKey = process.env.ESEWA_SECRET_KEY;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64');

    if (expectedSignature !== decodedData.signature) {
      return res.status(400).json({ message: "Invalid Signature. Payment verification failed." });
    }

    // 3. Update the Transaction in your Database
    const transaction = await Transaction.findOneAndUpdate(
      { orderId: decodedData.transaction_uuid },
      { 
        status: decodedData.status === 'COMPLETE' ? 'COMPLETED' : 'FAILED',
        esewa_ref_id: decodedData.transaction_code // This is eSewa's unique reference ID
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (decodedData.status === 'COMPLETE' && transaction.jobId) {
      const job = await Job.findById(transaction.jobId);

      if (job) {
        if (job.status === 'COMPLETED') {
          job.status = 'PAID';
          await job.save();
        }
      }
    }

    res.status(200).json({ 
      message: "Payment verified successfully", 
      transaction 
    });

  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Internal Server Error during verification" });
  }
};
