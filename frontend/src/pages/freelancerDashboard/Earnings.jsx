import { Download, Calendar, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const Earnings = () => {
    // === Earnings Summary Data ===
    const earningsSummary = {
        totalEarned: 56500,
        thisMonth: 15000,
        pending: 13500,
        lastPayout: '2026-03-01'
    };

    // === Transaction History ===
    const [transactions] = useState([
        { 
            id: 1, 
            jobTitle: 'Fix Kitchen Plumbing', 
            client: 'Ramesh Kumar', 
            amount: 3500, 
            status: 'Paid', 
            date: '2026-02-28',
            paymentId: 'PAY00123'
        },
        { 
            id: 2, 
            jobTitle: 'Electrical Wiring - 2BHK', 
            client: 'Anita Sharma', 
            amount: 8000, 
            status: 'Pending', 
            date: '2026-03-06',
            paymentId: 'PAY00124'
        },
        { 
            id: 3, 
            jobTitle: 'Home Deep Cleaning', 
            client: 'Vikram Singh', 
            amount: 2000, 
            status: 'Paid', 
            date: '2026-02-25',
            paymentId: 'PAY00125'
        },
        { 
            id: 4, 
            jobTitle: 'Paint Living Room', 
            client: 'Suresh Patil', 
            amount: 5500, 
            status: 'Pending', 
            date: '2026-03-05',
            paymentId: 'PAY00126'
        },
    ]);

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
                        {formatAmount(earningsSummary.totalEarned)}
                    </h3>
                </div>

                {/* This Month */}
                <div className="summary-card summary-gray">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Calendar size={20} style={{ color: '#6B7280' }} />
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>This Month</p>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>
                        {formatAmount(earningsSummary.thisMonth)}
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
                        {formatAmount(earningsSummary.pending)}
                    </h3>
                </div>

                {/* Last Payout */}
                <div className="summary-card">
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                        Last Payout
                    </p>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        {formatDate(earningsSummary.lastPayout)}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#9CA3AF' }}>
                        Next payout in 5 days
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
                            {transactions.map((txn) => (
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Earnings;
