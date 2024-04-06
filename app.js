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
  timeout: 60000, // Increase the timeout to 60 seconds
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'app', 'index.html');
  res.sendFile(filePath);
});

app.post('/api/send-email', async (req, res) => {
  const { email, subject, text } = req.body;

  if (!email || (Array.isArray(email) && email.length === 0) || (typeof email === 'string' && email.trim().length === 0)) {
    return res.status(400).json({ error: 'Invalid or missing recipient email addresses.' });
  }

  const templatePath = path.join(__dirname, '/app/template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
  const batchSize = 50;

  try {
    if (Array.isArray(email)) {
      const successfulEmails = [];
      for (let i = 0; i < email.length; i += batchSize) {
        const batchEmails = email.slice(i, i + batchSize);
        const promises = batchEmails.map(recipient => {
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
        const results = await Promise.all(promises);
        successfulEmails.push(...results.filter(result => result.accepted.length > 0).map(result => result.accepted[0]));
      }
      console.log('Successfully sent emails to:', successfulEmails);
      res.status(200).json({ message: 'Emails sent', successfulEmails });
    } else {
      const client = email.split('@')[0];
      const personalizedTemplate = htmlTemplate.replace('{{client}}', client).replace('{{content}}', text);
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject,
        html: personalizedTemplate
      };
      const result = await transporter.sendMail(mailOptions);
      console.log('Successfully sent email to:', result.accepted[0]);
      res.status(200).json({ message: 'Email sent', successfulEmail: result.accepted[0] });
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`[+] Server running on port ${PORT}`);
});