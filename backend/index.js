// packages
import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

// Utiles

import connectDB from "./config/db.js"

dotenv.config();
const port = process.env.PORT || 3000;

connectDB();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send("Hello");
})




app.listen(port, (req, res) => {
    console.log(`Server is listening on port ${port}`);

})
