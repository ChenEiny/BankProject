const UserModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../model/accountModel');
const nodemailer = require('nodemailer');//for verification purposes


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

async function register(req, res) 
{

    const { email, password, phone } = req.body;

    if (!email || !password || !phone) 
    {
        return res.status(400).json({ error: "Missing required fields: email, password, and phone are all required" });
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //regex Email Format
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }

    const phoneRegex = /^\+?[0-9]{9,15}$/; //regex phone format
    if (!phoneRegex.test(phone)) 
        {
        return res.status(400).json({ error: "Invalid phone number format" });
    }

    if (password.length < 6) 
        {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    try 
    {
        const userExists = await UserModel.findByEmail(email);
        if (userExists) 
        {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.createUser({
            email, 
            password: hashedPassword, 
            phone
        });

        const newAccount = await Account.create(newUser.id);

        // Generate a verification token that expires in 15 minutes
        //--------------------------------------------------------------
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
        //-----------------------------------------------------------------------------

        return res.status(201).json({
            message: "Success Signup",
            user: { 
                id: newUser.id, 
                email: newUser.email,
                phone: newUser.phone
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getUsers(req, res) 
{
    try 
    {
        const users = await UserModel.getAllUsers();
        return res.status(200).json(users);
    } catch (error) 
    {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function login(req, res) 
{
    if (!req.body) 
    {
        return res.status(400).json({ 
            message: "Request body is missing. Make sure Content-Type is set to application/json." 
        });
    }

    const { email, password } = req.body;

    if (!email || !password) 
        {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await UserModel.findByEmail(email);
        if (!user) 
        {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) 
        {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const payload = 
        {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }     
        );

        return res.status(200).json({
            message: "Succesfull Login",
            token: token, 
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) 
    {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function verifyEmail(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('<h1>Verification token is missing.</h1>');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updatedUser = await UserModel.verifyUser(decoded.userId);

        if (!updatedUser) {
            return res.status(404).send('<h1>User not found.</h1>');
        }

        const sessionToken = jwt.sign(
            { 
                id: updatedUser.id,       
                userId: updatedUser.id   
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' } 
        );

        res.cookie('token', sessionToken, 
        {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 3600000 
        });

        return res.redirect('/api/dashboard/');

    } catch (error) 
    {
        console.error('Verification error:', error);
        return res.status(400).send('<h1>Verification link is invalid or has expired.</h1>');
    }

}
    async function logout(req, res) 
    {
    try 
    {
        res.clearCookie('token', {
            httpOnly: true,
        });

        return res.status(200).json({ 
            message: "Successful Logout. Token cleared." 
        });
        
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    register,
    getUsers,
    login,
    verifyEmail,
    logout
};