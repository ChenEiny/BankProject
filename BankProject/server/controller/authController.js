// controller/authController.js
const UserModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../model/accountModel');
const transporter = require('../config/mailer');
const { AppError } = require('../middleware/errorWrapper.js');
const logger = require('../config/logger').child({ module: 'authController' });
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

async function register(req) 
{
    const { email, password, phone } = req.body;

    if (!email || !password || !phone) 
        
    {
        throw new AppError("Missing required fields: email, password, and phone are all required", 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) 
    {
        throw new AppError("Invalid email format", 400);
    }

    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(phone)) 
    {
        throw new AppError("Invalid phone number format", 400);
    }

    if (password.length < 6) 
    {
        throw new AppError("Password must be at least 6 characters long", 400);
    }

    const userExists = await UserModel.findByEmail(email);
    if (userExists) 
    {
        throw new AppError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.createUser({ email, password: hashedPassword, phone });
    await Account.create(newUser.id);

    const verificationToken = jwt.sign(
        { userId: newUser.id }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
    );

    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"Safe Bank" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your Bank Account',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 500px; margin: auto;">
                <h2 style="color: #4c4caf;">Welcome to Safe Bank!</h2>
                <p>Thank you for signing up. Please click the button below to verify your email and complete your registration:</p>
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Account</a>
                </div>
                <p style="color: #ff0000; font-size: 12px; text-align: center;">This link will expire in 15 minutes.</p>
            </div>
        `            
    };

    await transporter.sendMail(mailOptions);

    logger.info("User registered", {
        userId: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
    });

    return {
        _customStatus: 201,
        message: "Success Signup",
        user: { id: newUser.id, email: newUser.email, phone: newUser.phone }
    };
}

async function getUsers() 
{
    const users = await UserModel.getAllUsers();
    return users;
}

async function login(req, res) 
{
    if (!req.body || Object.keys(req.body).length === 0) 
    {
        throw new AppError("Request body is missing. Make sure Content-Type is set to application/json.", 400);
    }

    const { email, password } = req.body;

    if (!email || !password) 
    {
        throw new AppError("Email and password are required", 400);
    }

    const user = await UserModel.findByEmail(email);
    if (!user)
    {
        logger.warn("Login failed", { email, reason: "no account with this email" });
        throw new AppError("Invalid email or password", 401);
    }

    if (!user.is_verified)
    {
        logger.warn("Login failed", { email, reason: "email not verified" });
        throw new AppError("Please verify your email before logging in.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
    {
        logger.warn("Login failed", { email, reason: "incorrect password" });
        throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000
    });

    logger.info("User login success", {
        userId: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        message: "Successful Login",
        user: { id: user.id, email: user.email, role: user.role }
    };
}
async function verifyEmail(req, res) 
{
    const { token } = req.query;

    if (!token) 
    {
        throw new AppError('<h1>Verification token is missing.</h1>', 400);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updatedUser = await UserModel.verifyUser(decoded.userId);

        if (!updatedUser) 
        {
            throw new AppError('<h1>User not found.</h1>', 404);
        }

        const sessionToken = jwt.sign(
            { id: updatedUser.id, userId: updatedUser.id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' } 
        );

        res.cookie('token', sessionToken,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000
        });

        logger.info("Email verified", {
            userId: updatedUser.id,
            email: updatedUser.email,
        });

        res.redirect(`${clientUrl}/dashboard`);
    } catch (error)
    {
        logger.warn("Email verification failed", { error: error.message });
        throw new AppError('<h1>Verification link is invalid or has expired.</h1>', 400);
    }
}

async function logout(req, res)
{
    logger.info("User logout", {
        userId: req.user?.id,
        email: req.user?.email,
    });

    res.clearCookie('token', { httpOnly: true });
    return { message: "Successful Logout. Token cleared." };
}

module.exports = {
    register,
    getUsers,
    login,
    verifyEmail,
    logout
};