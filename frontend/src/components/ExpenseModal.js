import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Other'];

const ExpenseModal = ({ show, onClose, onSubmit, editData }) => {
    const [form, setForm] = useState(
        editData || { title: '', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] }
    );

    React.useEffect(() => {
        if (editData) {
            setForm({
                ...editData,
                date: editData.date ? new Date(editData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            });
        } else {
            setForm({ title: '', amount: '', category: 'Food', description: '', date: new Date().toISOString().split('T')[0] });
        }
    }, [editData, show]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...form, amount: parseFloat(form.amount) });
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editData ? 'Edit Expense' : 'Add New Expense'}</h2>
                    <button className="modal-close" onClick={onClose}><FiX /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Grocery Shopping" required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount (₹)</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={form.category} onChange={handleChange}>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" name="date" value={form.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description (optional)</label>
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add notes..." rows="3" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                        {editData ? 'Update Expense' : 'Add Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;
