import { Download, Calendar, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Earnings = () => {
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ totalEarned: 0, thisMonth: 0, pending: 0, lastPayout: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('Please login first');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:5000/api/jobs/my-applications', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const paid = [];
                const pending = [];

                response.data.forEach((app) => {
                    const record = {
                        id: app._id,
                        jobTitle: app.jobTitle,
                        client: app.client,
                        amount: app.budget,
                        status: app.jobStatus === 'PAID' ? 'Paid' : 'Pending',
                        date: app.appliedAt,
                        paymentId: app._id
                    };

                    if (app.jobStatus === 'PAID') paid.push(record);
                    if (app.jobStatus === 'COMPLETED') pending.push(record);
                });

                const allTx = [...paid, ...pending];
                setTransactions(allTx);

                const totalEarned = paid.reduce((sum, tx) => sum + (tx.amount || 0), 0);

                const now = new Date();
                const thisMonth = paid
                    .filter((tx) => {
                        if (!tx.date) return false;
                        const d = new Date(tx.date);
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    })
                    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

                const pendingAmt = pending.reduce((sum, tx) => sum + (tx.amount || 0), 0);

                const lastPayout = paid.length
                    ? paid
                        .filter((tx) => tx.date)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
                    : null;

                setSummary({ totalEarned, thisMonth, pending: pendingAmt, lastPayout });
            } catch (error) {
                console.error('Error loading earnings:', error);
                toast.error('Failed to load earnings');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // === Format Date ===
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric' 
        });
    };

    // === Format Amount ===
    const formatAmount = (amount) => {
        return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading earnings...</div>;
    }

    return (
        <div>
            {/* === Page Header === */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>Earnings</h1>
                    <p>Track your income and payment history.</p>
                </div>
                <button className="btn-export">
                    <Download />
                    Export Report
                </button>
            </div>

            {/* === Earnings Summary Cards === */}
            <div className="payment-summary">
                {/* Total Earned */}
                <div className="summary-card summary-green">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <TrendingUp size={20} style={{ color: '#059669' }} />
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>Total Earned</p>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', color: '#059669' }}>
                        {formatAmount(summary.totalEarned)}
                    </h3>
                </div>

                {/* This Month */}
                <div className="summary-card summary-gray">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Calendar size={20} style={{ color: '#6B7280' }} />
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>This Month</p>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
                        {formatAmount(summary.thisMonth)}
                    </h3>
                </div>

                {/* Pending Payments */}
                <div className="summary-card summary-yellow">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#D97706" strokeWidth="2">
                            <text x="4" y="18" fontSize="16" fontWeight="bold" fill="#D97706" stroke="none">₨</text>
                        </svg>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>Pending</p>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', color: '#D97706' }}>
                        {formatAmount(summary.pending)}
                    </h3>
                </div>

                {/* Last Payout */}
                <div className="summary-card">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                        Last Payout
                    </p>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        {summary.lastPayout ? formatDate(summary.lastPayout) : 'No payouts yet'}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                        {summary.lastPayout ? 'Next payout coming soon' : 'Complete jobs to receive payouts'}
                    </p>
                </div>
            </div>

            {/* === Transaction History Table === */}
            <div className="table-card">
                <div className="table-card-header">
                    <h2>Transaction History</h2>
                </div>
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Job Title</th>
                                <th>Client</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#6B7280' }}>
                                        No payments yet. Complete jobs and wait for client payment.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn) => (
                                <tr key={txn.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                        {txn.paymentId}
                                    </td>
                                    <td className="table-cell-bold">{txn.jobTitle}</td>
                                    <td>{txn.client}</td>
                                    <td className="table-cell-bold">{formatAmount(txn.amount)}</td>
                                    <td>
                                        <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem', color: '#9CA3AF' }} />
                                        {formatDate(txn.date)}
                                    </td>
                                    <td>
                                        <span className={`badge ${
                                            txn.status === 'Paid' ? 'badge-green' : 'badge-yellow'
                                        }`}>
                                            {txn.status}
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

export default Earnings;
