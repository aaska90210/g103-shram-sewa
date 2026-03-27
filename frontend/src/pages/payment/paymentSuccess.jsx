import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const data = searchParams.get('data'); // Get the encoded string from URL
      
      if (!data) {
        setStatus("No payment data found.");
        setLoading(false);
        return;
      }

      try {
        // Send the encoded data to your backend verify route
        const response = await axios.get('http://localhost:5000/api/payment/verify', {
          params: { data }
        });

        if (response.status === 200) {
          setStatus("Payment Successful! Your payment was verified.");
          // Redirect hirer back to manage jobs where payment status is visible
          setTimeout(() => navigate('/hirer/manage-jobs'), 2500);
          return;
        }
        setStatus("Payment verification failed. Please contact support.");
      } catch (err) {
        const apiMessage = err.response?.data?.message;
        setStatus(apiMessage ? `Payment verification failed: ${apiMessage}` : "Payment verification failed. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-xl text-center">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        ) : (
          <>
            <h1 className={`text-2xl font-bold ${status?.includes('Successful') ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </h1>
            <p className="mt-4 text-gray-600">Redirecting you back to the portal...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;