const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Module/UserSchema");
const sendOTPEmail = require("../utils/sendEmail");
const auth = require("../middleware/auth");

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, mobile } = req.body;

        if (!name || !email || !password || !mobile) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: "Email is already registered." });
        }

        // If user exists but not verified, update their info
        const hashedPassword = await bcrypt.hash(password, 12);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        let user;
        if (existingUser && !existingUser.isVerified) {
            existingUser.name = name;
            existingUser.password = hashedPassword;
            existingUser.mobile = mobile;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            user = await existingUser.save();
        } else {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                mobile,
                otp,
                otpExpiry,
            });
        }

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.status(201).json({
            message: "Registration successful! OTP sent to your email.",
            email: user.email,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: "OTP has expired. Please register again." });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ message: "Email verified successfully! You can now login." });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please register." });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: "Email not verified. Please verify your email first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password." });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// GET /api/auth/me — get current user (protected)
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -otp -otpExpiry");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(user);
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
