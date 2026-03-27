import React from 'react';
import axios from 'axios';

const EsewaButton = ({ amount, jobId }) => {
  const handlePayment = async () => {
    try {
      const token = localStorage.getItem('token'); // Adjust based on your auth logic
      
      // Call your backend to get the signature
      const response = await axios.post(
        'http://localhost:5000/api/payment/initiate',
        { amount, jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, signature, merchantCode } = response.data;

      // eSewa requires a Form POST request. We create a temporary form and submit it.
      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

      const fields = {
        amount: amount,
        tax_amount: "0",
        total_amount: amount,
        transaction_uuid: orderId,
        product_code: merchantCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: "http://localhost:5173/payment-success", // Where user goes after paying
        failure_url: "http://localhost:5173/payment-failure",
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
      };

      for (const key in fields) {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', key);
        input.setAttribute('value', fields[key]);
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment initiation failed", error);
      alert("Failed to start payment process.");
    }
  };

  return (
    <button 
      onClick={handlePayment}
      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
    >
      Pay with eSewa
    </button>
  );
};

export default EsewaButton;