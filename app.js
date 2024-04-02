const express = require("express");
const cors = require("cors");
const path = require('path');
const dotenv = require('dotenv');
const morgan = require("morgan");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');

dotenv.config(); 
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});


app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'app', 'index.html');
  res.sendFile(filePath);
});

app.post('/api/send-email', (req, res) => {
  const { email, subject, text } = req.body;
  if (!email || (Array.isArray(email) && email.length === 0) || (typeof email === 'string' && email.trim().length === 0)) {
    return res.status(400).json({ error: 'Invalid or missing recipient email addresses.' });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    subject: subject,
    text: text
  };

  mailOptions.bcc = Array.isArray(email) ? email.join(', ') : email;

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: error.toString() });
    }
    res.status(200).json({ message: 'Email sent', response: info.response });
  });
});

app.listen(PORT, () => {
  console.log(`[+] Server running on port ${PORT}`);
});