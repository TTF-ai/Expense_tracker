import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth, api } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import ExpenseModal from '../components/ExpenseModal';
import {
    FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiCalendar,
    FiTrendingUp, FiPieChart, FiUser, FiMail, FiPhone, FiClock
} from 'react-icons/fi';

const CATEGORY_COLORS = {
    Food: '#ef5350', Transport: '#42a5f5', Shopping: '#ab47bc',
    Entertainment: '#ffa726', Bills: '#26a69a', Health: '#66bb6a',
    Education: '#5c6bc0', Other: '#78909c',
};

const CATEGORY_ICONS = {
    Food: '🍔', Transport: '🚗', Shopping: '🛍️',
    Entertainment: '🎬', Bills: '📄', Health: '💊',
    Education: '📚', Other: '📦',
};

const Dashboard = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editExpense, setEditExpense] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [expRes, statRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/expenses/stats'),
            ]);
            setExpenses(expRes.data);
            setStats(statRes.data);
        } catch (err) {
            toast.error('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddExpense = async (data) => {
        try {
            const res = await api.post('/expenses', data);
            toast.success(res.data.message);
            setShowModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add expense.');
        }
    };

    const handleEditExpense = async (data) => {
        try {
            const res = await api.put(`/expenses/${editExpense._id}`, data);
            toast.success(res.data.message);
            setShowModal(false);
            setEditExpense(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update expense.');
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            const res = await api.delete(`/expenses/${id}`);
            toast.success(res.data.message);
            fetchData();
        } catch (err) {
            toast.error('Failed to delete expense.');
        }
    };

    const openEditModal = (expense) => {
        setEditExpense(expense);
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditExpense(null);
        setShowModal(true);
    };

    const filteredExpenses = filterCategory === 'All'
        ? expenses
        : expenses.filter((e) => e.category === filterCategory);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTimestamp = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* User Profile Section */}
            <div className="dashboard-header">
                <div className="user-profile-card">
                    <div className="user-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                        <h2>{user?.name}</h2>
                        <div className="user-meta">
                            <span><FiMail /> {user?.email}</span>
                            <span><FiPhone /> {user?.mobile}</span>
                            <span><FiClock /> Joined {formatDate(user?.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary btn-add" onClick={openAddModal}>
                    <FiPlus /> Add Expense
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <StatsCard
                    icon={<FiDollarSign size={24} />}
                    label="Total Spent"
                    value={`₹${(stats?.totalAmount || 0).toLocaleString('en-IN')}`}
                    color="linear-gradient(135deg, #1976d2, #42a5f5)"
                    subtext={`${stats?.totalExpenses || 0} transactions`}
                />
                <StatsCard
                    icon={<FiCalendar size={24} />}
                    label="This Month"
                    value={`₹${(stats?.monthTotal || 0).toLocaleString('en-IN')}`}
                    color="linear-gradient(135deg, #00897b, #26a69a)"
                    subtext={`${stats?.monthExpenseCount || 0} transactions`}
                />
                <StatsCard
                    icon={<FiTrendingUp size={24} />}
                    label="Daily Average"
                    value={`₹${stats?.totalExpenses ? Math.round(stats.totalAmount / Math.max(stats.totalExpenses, 1)).toLocaleString('en-IN') : '0'}`}
                    color="linear-gradient(135deg, #f57c00, #ffb74d)"
                    subtext="per transaction"
                />
                <StatsCard
                    icon={<FiPieChart size={24} />}
                    label="Categories Used"
                    value={stats?.categoryBreakdown ? Object.keys(stats.categoryBreakdown).length : 0}
                    color="linear-gradient(135deg, #7b1fa2, #ba68c8)"
                    subtext="unique categories"
                />
            </div>

            {/* Category Breakdown */}
            {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
                <div className="category-breakdown-section">
                    <h3><FiPieChart /> Category Breakdown</h3>
                    <div className="category-bars">
                        {Object.entries(stats.categoryBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cat, amount]) => {
                                const percentage = ((amount / stats.totalAmount) * 100).toFixed(1);
                                return (
                                    <div className="category-bar-item" key={cat}>
                                        <div className="category-bar-header">
                                            <span className="category-label">
                                                {CATEGORY_ICONS[cat] || '📦'} {cat}
                                            </span>
                                            <span className="category-value">₹{amount.toLocaleString('en-IN')} ({percentage}%)</span>
                                        </div>
                                        <div className="category-bar-track">
                                            <div
                                                className="category-bar-fill"
                                                style={{
                                                    width: `${percentage}%`,
                                                    background: CATEGORY_COLORS[cat] || '#78909c',
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Monthly Trend */}
            {stats?.monthlyTrend && (
                <div className="monthly-trend-section">
                    <h3><FiTrendingUp /> Monthly Trend (Last 6 Months)</h3>
                    <div className="trend-chart">
                        {stats.monthlyTrend.map((m, i) => {
                            const maxVal = Math.max(...stats.monthlyTrend.map((t) => t.total), 1);
                            const height = (m.total / maxVal) * 100;
                            return (
                                <div className="trend-bar-wrapper" key={i}>
                                    <div className="trend-value">₹{m.total.toLocaleString('en-IN')}</div>
                                    <div className="trend-bar" style={{ height: `${Math.max(height, 4)}%` }}></div>
                                    <div className="trend-label">{m.month}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Expense Table */}
            <div className="expense-table-section">
                <div className="table-header">
                    <h3><FiUser /> All Expenses</h3>
                    <div className="filter-group">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            {['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredExpenses.length === 0 ? (
                    <div className="empty-state">
                        <p>💸 No expenses found. Click "Add Expense" to start tracking!</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="expense-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Amount</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Created At</th>
                                    <th>Updated At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>
                                            <div className="expense-title-cell">
                                                <strong>{expense.title}</strong>
                                                {expense.description && <small>{expense.description}</small>}
                                            </div>
                                        </td>
                                        <td className="amount-cell">₹{expense.amount.toLocaleString('en-IN')}</td>
                                        <td>
                                            <span className="category-badge" style={{ background: CATEGORY_COLORS[expense.category] || '#78909c' }}>
                                                {CATEGORY_ICONS[expense.category]} {expense.category}
                                            </span>
                                        </td>
                                        <td>{formatDate(expense.date)}</td>
                                        <td className="timestamp-cell">{formatTimestamp(expense.createdAt)}</td>
                                        <td className="timestamp-cell">{formatTimestamp(expense.updatedAt)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon btn-edit" onClick={() => openEditModal(expense)} title="Edit">
                                                    <FiEdit2 />
                                                </button>
                                                <button className="btn-icon btn-delete" onClick={() => handleDeleteExpense(expense._id)} title="Delete">
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Expense Modal */}
            <ExpenseModal
                show={showModal}
                onClose={() => { setShowModal(false); setEditExpense(null); }}
                onSubmit={editExpense ? handleEditExpense : handleAddExpense}
                editData={editExpense}
            />
        </div>
    );
};

export default Dashboard;
