// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }));
  
app.use(morgan('dev'));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/attendance", require("./src/routes/attendance"));


// Temporary test route
app.get('/', (req, res) => {
  res.send('Backend working 🚀');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {
    console.log('MongoDB connected ✔️');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));
