const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
        category: {
            type: String,
            required: true,
            enum: ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Health", "Education", "Other"],
            default: "Other",
        },
        description: { type: String, default: "", trim: true },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
