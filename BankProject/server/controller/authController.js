const UserModel = require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../model/accountModel');

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
        if (userExists) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserModel.createUser({
            email, 
            password: hashedPassword, 
            phone
        });

        const newAccount = await Account.create(newUser.id);

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

module.exports = {
    register,
    getUsers,
    login
};