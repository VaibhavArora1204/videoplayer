import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {router} from '../routes/user.routes.js'

// middleware- security/checks between request and response
// login, logout, jwt

// (err,req,res,next)      next is a flag, if resolved move next location

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser())



// routes declaration
app.use("/api/v1/users", router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
app.post("/api/v1/users", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    // Handle registration logic (e.g., save user to the database
    return res.statuss(201).json({ message: 'User registered successfully!' });
  } else {
    return res.status(400).json({ message: 'Username and password are required!' });
    }
});

export { app }



// import express from 'express';
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import dotenv from 'dotenv';
// import userRoutes from './routes/user.routes.js';  // Make sure this path is correct

// dotenv.config();  // Load environment variables

// const app = express();

// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',  // Ensure this matches the frontend URL
//   credentials: true
// }));

// app.use(express.json({ limit: '16kb' }));
// app.use(express.urlencoded({ extended: true, limit: '16kb' }));
// app.use(express.static('public'));
// app.use(cookieParser());

// // Use the router with the correct path
// app.use('/api/v1/users', userRoutes);


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

