import { Download, Calendar } from 'lucide-react';

// static payment data
const payments = [
    { id: 1, job: 'Fix Kitchen Plumbing', worker: 'Ramesh Kumar', amount: '₹3,500', status: 'Paid', date: 'Feb 28, 2026', paymentId: 'PAY001' },
    { id: 2, job: 'Electrical Wiring - 2BHK', worker: 'Suresh Patil', amount: '₹8,000', status: 'Paid', date: 'Feb 20, 2026', paymentId: 'PAY002' },
    { id: 3, job: 'Home Deep Cleaning', worker: 'Anita Sharma', amount: '₹2,000', status: 'Paid', date: 'Feb 15, 2026', paymentId: 'PAY003' },
    { id: 4, job: 'Paint Living Room', worker: 'Manoj Verma', amount: '₹5,500', status: 'Pending', date: 'Mar 5, 2026', paymentId: 'PAY004' },
    { id: 5, job: 'Carpenter for Wardrobe', worker: 'Vikram Singh', amount: '₹5,500', status: 'Pending', date: 'Mar 6, 2026', paymentId: 'PAY005' },
];

const PaymentHistory = () => {
    // calculate totals
    const totalPaid = payments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + parseInt(p.amount.replace(/[₹,]/g, '')), 0);
    const totalPending = payments
        .filter(p => p.status === 'Pending')
        .reduce((sum, p) => sum + parseInt(p.amount.replace(/[₹,]/g, '')), 0);

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
                    <h3 className="summary-green">₹{totalPaid.toLocaleString()}</h3>
                </div>
                <div className="summary-card">
                    <p>Pending Payments</p>
                    <h3 className="summary-yellow">₹{totalPending.toLocaleString()}</h3>
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
                            {payments.map((payment) => (
                                <tr key={payment.id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#6B7280' }}>{payment.paymentId}</td>
                                    <td className="table-cell-bold">{payment.job}</td>
                                    <td>{payment.worker}</td>
                                    <td className="table-cell-bold">{payment.amount}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar style={{ width: '16px', height: '16px' }} />
                                            {payment.date}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
