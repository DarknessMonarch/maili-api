const express = require("express");
const cors = require("cors");
const path = require('path');
const dotenv = require('dotenv');
const morgan = require("morgan");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const fs = require('fs');

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

  const templatePath = path.join(__dirname, '/app/template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  if (Array.isArray(email)) {
    const promises = email.map(recipient => {
      const client = recipient.split('@')[0];
      const personalizedTemplate = htmlTemplate.replace('{{client}}', client).replace('{{content}}', text);
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: recipient,
        subject,
        html: personalizedTemplate
      };

      return transporter.sendMail(mailOptions);
    });

    Promise.all(promises)
      .then(results => {
        res.status(200).json({ message: 'Emails sent', responses: results.map(result => result.response) });
      })
      .catch(error => {
        res.status(500).json({ error: error.toString() });
      });
  } else {
    const client = email.split('@')[0];
    const personalizedTemplate = htmlTemplate.replace('{{client}}', client).replace('{{content}}', text);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: personalizedTemplate
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: error.toString() });
      }
      res.status(200).json({ message: 'Email sent', response: info.response });
    });
  }
});

app.listen(PORT, () => {
  console.log(`[+] Server running on port ${PORT}`);
});