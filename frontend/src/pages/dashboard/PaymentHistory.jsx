import { Download, Calendar } from 'lucide-react';

import toast from "react-hot-toast";

const handlePayment = async () => {
  const loading = toast.loading("Processing payment...");

  try {

    toast.dismiss(loading);
    toast.success("Payment successful ");

  } catch (error) {
    toast.dismiss(loading);
    toast.error("Payment failed ");
  }
};

// static payment data
const payments = [
    { id: 1, job: 'Fix Kitchen Plumbing', worker: 'Ramesh Kumar', amount: '₹3,500', status: 'Paid', date: 'Feb 28, 2026', paymentId: 'PAY001' },
    { id: 2, job: 'Electrical Wiring - 2BHK', worker: 'Suresh Patil', amount: '₹8,000', status: 'Paid', date: 'Feb 20, 2026', paymentId: 'PAY002' },
    { id: 3, job: 'Home Deep Cleaning', worker: 'Anita Sharma', amount: '₹2,000', status: 'Paid', date: 'Feb 15, 2026', paymentId: 'PAY003' },
    { id: 4, job: 'Paint Living Room', worker: 'Manoj Verma', amount: '₹5,500', status: 'Pending', date: 'Mar 5, 2026', paymentId: 'PAY004' },
    { id: 5, job: 'Carpenter for Wardrobe', worker: 'Vikram Singh', amount: '₹5,500', status: 'Pending', date: 'Mar 6, 2026', paymentId: 'PAY005' },
];

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';


const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login first');
                    setLoading(false);
                    return;
                }

                // Hirer jobs; paid when job.status === 'PAID'
                const response = await axios.get('http://localhost:5000/api/jobs/my-jobs', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const rows = response.data.map((job) => {
                    const approvedApplicant = job.applicants?.find((a) => a.status === 'Approved');
                    return {
                        id: job._id,
                        job: job.title,
                        worker: approvedApplicant ? approvedApplicant.userId || 'Approved Freelancer' : '—',
                        amount: job.budget,
                        status: job.status === 'PAID' ? 'Paid' : job.status === 'COMPLETED' ? 'Pending' : 'Pending',
                        date: job.updatedAt || job.createdAt,
                        paymentId: job._id
                    };
                }).filter((row) => row.status === 'Paid' || row.status === 'Pending');

                setPayments(rows);
            } catch (error) {
                console.error('Error loading payments:', error);
                toast.error('Failed to load payments');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const totalPaid = payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPending = payments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const formatAmount = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div>
            {/* page header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>Payment History</h1>
                    <p>Track all your payments and transactions.</p>
                </div>
                <button className="btn-export">
                    <Download />
                    Export CSV
                </button>
            </div>

            {/* summary cards */}
            <div className="payment-summary">
                <div className="summary-card">
                    <p>Total Paid</p>
                    <h3 className="summary-green">{formatAmount(totalPaid)}</h3>
                </div>
                <div className="summary-card">
                    <p>Pending Payments</p>
                    <h3 className="summary-yellow">{formatAmount(totalPending)}</h3>
                </div>
                <div className="summary-card">
                    <p>Total Transactions</p>
                    <h3 className="summary-gray">{payments.length}</h3>
                </div>
            </div>

            {/* payments table */}
            <div className="table-card">
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Job Name</th>
                                <th>Worker Name</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>Loading payments...</td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#6B7280' }}>
                                        No payments yet. Completed jobs will appear here after payment.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#6B7280' }}>{payment.paymentId}</td>
                                        <td className="table-cell-bold">{payment.job}</td>
                                        <td>{payment.worker}</td>
                                        <td className="table-cell-bold">{formatAmount(payment.amount)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar style={{ width: '16px', height: '16px' }} />
                                                {formatDate(payment.date)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                payment.status === 'Paid' 
                                                    ? 'badge-green' 
                                                    : 'badge-yellow'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
