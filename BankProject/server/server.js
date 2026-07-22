require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const chatRoutes = require('./routes/chatRoute');

const { globalErrorHandler } = require('./middleware/errorWrapper'); 

const app = express();

app.use(express.json()); //MIDDLEWARE
app.use(helmet()); 
app.use(cookieParser()); //to nove the cookies inside the middleware to access tokens


const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET;


 app.use(cors({
     origin: 'http://localhost:5173', 
     methods: ['GET', 'POST', 'PUT', 'DELETE'], 
     credentials: true 
 }));

// const generalLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000, 
//     max: 100, 
//     message: {
//         error: "Too Many Requests",
//         message: "Too Many Requests in short time."
//     },
//     standardHeaders: true, 
//     legacyHeaders: false, 
// });

// app.use(generalLimiter);


//only add it somehow to the user login option not in the entire server
// const authLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000, 
//     max: 5, 
//     message: {
//         error: "Too Many Login Attempts",
//         message:"Too Many failed Attempts."
//     },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

//Main Router start endpoint
app.get('/', (req, res) => {
    res.send('Server is up!');
});

const authRoutes = require('./routes/authRoute');
const transactionRoutes = require('./routes/transactionRoute');
const dashboardRoutes = require('./routes/dashboardRoute');
const healthRoute =require('./routes/healthRoute');

app.use('/api/transactions/', transactionRoutes);
app.use('/api/auth/', /*authLimiter,*/ authRoutes);
app.use('/api/dashboard/', dashboardRoutes);
app.use('/api/health', healthRoute);
app.use('/api/chat', chatRoutes);


app.use(globalErrorHandler);

//Server listener
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});