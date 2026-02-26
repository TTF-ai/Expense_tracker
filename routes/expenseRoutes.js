const express = require("express");
const router = express.Router();
const Expense = require("../Module/Expense");
const auth = require("../middleware/auth");

// All expense routes are protected
router.use(auth);

// GET /api/expenses/stats — category-wise and monthly stats
router.get("/stats", async (req, res) => {
    try {
        const userId = req.user.id;

        // Total expenses
        const allExpenses = await Expense.find({ userId });
        const totalAmount = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // This month's expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthExpenses = allExpenses.filter((exp) => new Date(exp.date) >= startOfMonth);
        const monthTotal = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Category breakdown
        const categoryBreakdown = {};
        allExpenses.forEach((exp) => {
            categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
        });

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            const monthName = monthStart.toLocaleString("default", { month: "short" });
            const total = allExpenses
                .filter((exp) => {
                    const d = new Date(exp.date);
                    return d >= monthStart && d <= monthEnd;
                })
                .reduce((sum, exp) => sum + exp.amount, 0);
            monthlyTrend.push({ month: monthName, total });
        }

        res.json({
            totalExpenses: allExpenses.length,
            totalAmount,
            monthTotal,
            monthExpenseCount: monthExpenses.length,
            categoryBreakdown,
            monthlyTrend,
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// GET /api/expenses — get all expenses for logged-in user
router.get("/", async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        console.error("Get expenses error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/expenses — create new expense
router.post("/", async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        if (!title || amount === undefined || !category) {
            return res.status(400).json({ message: "Title, amount, and category are required." });
        }

        if (amount < 0) {
            return res.status(400).json({ message: "Amount cannot be negative." });
        }

        const expense = await Expense.create({
            userId: req.user.id,
            title,
            amount,
            category,
            description: description || "",
            date: date || Date.now(),
        });

        res.status(201).json({ message: "Expense added successfully!", expense });
    } catch (error) {
        console.error("Create expense error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// PUT /api/expenses/:id — update expense
router.put("/:id", async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found." });
        }

        if (expense.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this expense." });
        }

        const { title, amount, category, description, date } = req.body;

        expense.title = title || expense.title;
        expense.amount = amount !== undefined ? amount : expense.amount;
        expense.category = category || expense.category;
        expense.description = description !== undefined ? description : expense.description;
        expense.date = date || expense.date;

        const updated = await expense.save();
        res.json({ message: "Expense updated successfully!", expense: updated });
    } catch (error) {
        console.error("Update expense error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// DELETE /api/expenses/:id — delete expense
router.delete("/:id", async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found." });
        }

        if (expense.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this expense." });
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted successfully!" });
    } catch (error) {
        console.error("Delete expense error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
