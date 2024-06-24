import express from 'express';
import sql from 'mssql'; 
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; 
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3001;
const validStatuses = ['APPROVED', 'REJECTED'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '/uploads');
      if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Setup email transporters
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// MSSQL database connection configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 30000, 
    requestTimeout: 30000,  
  }
};

// Create a connection pool
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config:', err);
  });


async function fetchData() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM school_admissions.applications');
    console.log(result.recordset);
  } catch (err) {
    console.log('SQL error', err);
  }
}


// Function to create a pool and connect
async function createDbPool() {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (error) {
    console.error('Database connection failed: ', error);
    throw error;
  }
}

async function fetchUserEmailsByType(userType) {
  const query = 'SELECT email FROM school_admissions.users WHERE user_type = @userType';
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('userType', sql.NVarChar, userType).query(query);
    return result.recordset.map(user => user.email);
  } catch (error) {
    console.error('Error fetching user emails:', error);
    return [];
  }
}

async function sendTemplatedEmailToEmail(eventTrigger, email, data, includeAttachment = false) {
  const query = 'SELECT subject, body FROM school_admissions.email_templates WHERE event_trigger = @eventTrigger';
try {
  const pool = await poolPromise;
  const result = await pool.request().input('eventTrigger', sql.NVarChar, eventTrigger).query(query);
  if (result.recordset.length === 0) {
    throw new Error('Email template not found');
  }

  const { subject, body } = result.recordset[0];
  let interpolatedSubject = subject;
  let interpolatedBody = body;

  Object.keys(data).forEach(key => {
    const value = data[key];
    const replacement = value && typeof value === 'string' ? value.replace(/<[^>]*>/g, "") : value; 
    interpolatedSubject = interpolatedSubject.replace(`{${key}}`, replacement);
    interpolatedBody = interpolatedBody.replace(
      'This admit card will be invalid if your application is rejected by the finance team at Sir Ganga Ram Hospital.',
      '<span style="color: red;"><strong>This admit card will be invalid if your application is rejected by the finance team at Sir Ganga Ram Hospital.</strong></span>'
    );
    interpolatedBody = interpolatedBody.replace(
      'In Case, You have received the Admit Card for the Nursing Exam, Kindly Ignore it',
      '<span style="color: red;"><strong>In Case, You have received the Admit Card for the Nursing Exam, Kindly Ignore it</strong></span>'
    );

    if (key === 'Date' || key === 'Time') {
      interpolatedBody = interpolatedBody.replace(`{${key}}`, `<strong>${data[key]}</strong>`); 
    } else {
      interpolatedBody = interpolatedBody.replace(`{${key}}`, data[key]);
    }
  });

  interpolatedBody = interpolatedBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: interpolatedSubject,
    html: `<html><body>${interpolatedBody}</body></html>`,
  };

  if (includeAttachment && data.ADMIT_CARD_ATTACHMENT) {
    mailOptions.attachments = [{
      filename: pdfFilename,
      path: data.ADMIT_CARD_ATTACHMENT  
    }];
  }

  await transporter.sendMail(mailOptions);
  console.log('Email sent successfully');
} catch (error) {
  console.error('Error during sending email:', error);
}
}

async function sendTemplatedEmailToRole(eventTrigger, userType, data) {
  const emails = await fetchUserEmailsByType(userType);
  if (emails.length === 0) {
    console.error(`No users found for type ${userType}`);
    return;
  }

  const sql = 'SELECT subject, body FROM school_admissions.email_templates WHERE event_trigger = @eventTrigger AND user_type = @userType';
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('eventTrigger', sql.NVarChar, eventTrigger).input('userType', sql.NVarChar, userType).query(sql);
    if (result.recordset.length === 0) {
      throw new Error('Email template not found');
    }

    const { subject, body } = result.recordset[0];
    emails.forEach(email => {
      let interpolatedSubject = subject;
      let interpolatedBody = body;

      Object.keys(data).forEach(key => {
        interpolatedSubject = interpolatedSubject.replace(`{${key}}`, data[key].replace(/<[^>]*>/g, ""));
        interpolatedBody = interpolatedBody.replace(`{${key}}`, data[key]);
      });

      interpolatedBody = interpolatedBody.replace(/(?:\r\n|\r|\n)/g, '<br>');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: interpolatedSubject,
        html: `<html><body>${interpolatedBody}</body></html>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Failed to send templated email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    });
  } catch (error) {
    console.error('Failed to send templated email:', error);
  }
}

async function generateAndSendAdmitCard(studentId, studentData) {
  const sqlGetStudent = 'SELECT * FROM school_admissions.applications WHERE id = @studentId';
  try {
   const pool = await poolPromise;
    const result = await pool.request().input('studentId', sql.Int, studentId).query(sqlGetStudent);
    if (result.recordset.length === 0) {
      throw new Error('Student not found');
    }

    const student = result.recordset[0];
    const studentPhotoPath = path.join(__dirname, 'uploads', student.studentPhoto);
    const pdfDirectory = path.join(__dirname, 'uploads', 'SON-24-25'); 
    const pdfFilename = `${student.student_id.slice(-3)}.pdf`; 
    const pdfPath = path.join(pdfDirectory, pdfFilename);

    fs.mkdirSync(pdfDirectory, { recursive: true });

    const nurseEmails = await fetchUserEmailsByType('nursing');
    if (nurseEmails.length === 0) {
      throw new Error('Nurse email not found');
    }
    const nurseEmail = nurseEmails[0];

    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    const headerText = "Admit Card";
    const headerTextWidth = boldFont.widthOfTextAtSize(headerText, 24);
    page.drawText(headerText, {
      x: (width - headerTextWidth) / 2,
      y: height - 100,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0)
    });

    const logoBytes = fs.readFileSync(path.join(__dirname, 'logoimage.png')); // Adjust the path to your logo
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const scaleX = 0.3; // Scale factor for the logo size
    const scaleY = 0.3; // Scale factor for the logo size
    page.drawImage(logoImage, {
      x: (width - logoImage.width * scaleX) / 2, // Center the logo
      y: height - 70, 
      width: logoImage.width * scaleX,
      height: logoImage.height * scaleY,
    });

    if (!student.studentPhoto) {
      page.drawRectangle({
          x: page.getWidth() - 150,
          y: page.getHeight() - 250,
          width: 100,
          height: 100,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1
      });
    } else {
      const studentPhotoBytes = fs.readFileSync(studentPhotoPath);
      const studentPhotoImage = await pdfDoc.embedJpg(studentPhotoBytes);
      page.drawImage(studentPhotoImage, {
          x: page.getWidth() - 150,
          y: page.getHeight() - 250,
          width: 100,
          height: 100
      });
      page.drawRectangle({
          x: page.getWidth() - 150,
          y: page.getHeight() - 250,
          width: 100,
          height: 100,
          borderColor: rgb(0, 0, 0),
          borderWidth: 2
      });
    }

    let detailsStartY = height - 150; // Starting Y position for student details
    const detailsTextSize = 12;
    const leftColumnX = 50; // Start position for the X coordinate

    const drawDetails = (text, yPosition, font = timesRomanFont, color = rgb(0, 0, 0)) => {
      page.drawText(text, {
          x: leftColumnX,
          y: yPosition,
          size: detailsTextSize,
          font: font,
          color: color
        });
    };
    
    drawDetails(`Roll No: SON/24-25/${String(studentId).padStart(5, '0')}`, detailsStartY, boldFont, rgb(1, 0, 0)); // This makes the text red
    detailsStartY -= 10;
    drawDetails(`Student Name: ${student.firstName.toUpperCase()} ${student.lastName.toUpperCase()}`, detailsStartY -= 15, boldFont);
    detailsStartY -= 10;
    drawDetails(`Father's Name: ${student.fathersFirstName.toUpperCase()} ${student.fathersLastName.toUpperCase()}`, detailsStartY -= 15, boldFont);

    detailsStartY -= 30;

    drawDetails(`Entry Examination Details:`, detailsStartY -= 30, boldFont);
    detailsStartY -= 20;
    drawDetails(`Entrance Test Date : June 29, 2024`, detailsStartY -= 15);
    detailsStartY -= 10;
    drawDetails(`Venue : School of Nursing, Sir Ganga Ram Hospital`, detailsStartY -= 15);
    detailsStartY -= 10;
    drawDetails(`Time : 2 PM to 4 PM`, detailsStartY -= 15);

    detailsStartY -= 10;

    drawDetails(`Instructions:`, detailsStartY -= 30, boldFont);

    detailsStartY -= 20;
    
    const wrapText = (text, lineWidth, font, fontSize, indent) => {
      text = replaceTabs(text);
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      let isFirstLine = true;
    
      words.forEach(word => {
        let wordWidth = font.widthOfTextAtSize(word, fontSize);
        let lineLength = font.widthOfTextAtSize(currentLine.trim(), fontSize);
    
        if (lineLength + wordWidth < lineWidth) {
          currentLine += `${word} `;
        } else {
          lines.push(currentLine.trim());
          currentLine = `${word} `;
          isFirstLine = false; 
        }
      });
    
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
    
      return lines;
    };
    
    const replaceTabs = (text) => text.replace(/\t/g, ' ');
    
    const boldInstructions = new Set([0, 5]); 
    const boldPhrases = {
      4: ["later than 15 minutes", "45 minutes before exam time"], 
    };
    
    const instructions = [
      `1. Print this page containing Roll Number as it is mandatory to gain entry to the Examination Hall.`,
      `2. This Roll Number should be retained till the entrance test result is announced and admission is finalized.`,
      `3. The candidate awaiting result can appear, but selection to GNM course is subject to the conditions/information printed in prospectus/bulletin of information.`,
      `4. Kindly do not carry Mobile Phones/Purses/Magazines/Paper Slips/Calculators into the Examination Hall.`,
      `5. Candidates should be present at Examination Hall 45 minutes before exam time. No candidates will be allowed in the Examination Hall later than 15 minutes from the time of the commencement of examination. Verification of the candidate with Roll Number will be done at the Examination Venue before entering the Examination Hall.`,
      `6. Carry 1 latest passport size photograph. The admit card is mandatory to gain entry to the Examination Hall.`
    ];
    
    const lineHeight = 18; 
    const instructionMarginTop = 10;
    const bottomMargin = 30; 
    const rightColumnX = width - 60; 
    let instructionsY = detailsStartY - instructionMarginTop;
    const indentWidth = 4; 
    
    instructions.forEach((instruction, instructionIndex) => {
      instruction = replaceTabs(instruction); // Clean up the instruction text
      const wrappedLines = wrapText(instruction, rightColumnX - leftColumnX, timesRomanFont, detailsTextSize);

      wrappedLines.forEach((line, lineIndex) => {
        if (instructionsY < bottomMargin) {
          console.error('Not enough space on the page for more instructions');
          return; 
        }

        const xPosition = leftColumnX;
        let isInstructionBold = boldInstructions.has(instructionIndex);

        if (isInstructionBold) {
          page.drawText(line, {
            x: xPosition,
            y: instructionsY,
            size: detailsTextSize,
            font: boldFont,
            color: rgb(0, 0, 0)
          });
        } else if (boldPhrases[instructionIndex]) {
          const parts = line.split(new RegExp(`(${boldPhrases[instructionIndex].join('|')})`, 'g'));
          let currentX = xPosition;

          parts.forEach(part => {
            const isPartBold = boldPhrases[instructionIndex].includes(part);
            const textWidth = (isPartBold ? boldFont : timesRomanFont).widthOfTextAtSize(part, detailsTextSize);

            page.drawText(part, {
              x: currentX,
              y: instructionsY,
              size: detailsTextSize,
              font: isPartBold ? boldFont : timesRomanFont,
              color: rgb(0, 0, 0)
            });

            currentX += textWidth;
          });
        } else {
          page.drawText(line, {
            x: xPosition,
            y: instructionsY,
            size: detailsTextSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0)
          });
        }

        instructionsY -= lineHeight;
      });

      instructionsY -= instructionMarginTop;
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(pdfPath, pdfBytes);

    const mailOptions = {
      from: nurseEmail,  
      to: studentData.email,
      subject: 'Admit Card Issued',
      text: 'Your admit card has been issued. Please find attached.',
      attachments: [{
        filename: pdfFilename,
        path: pdfPath
      }]
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Failed to send admit card email:', error);
          reject(error);
        } else {
          console.log('Admit card email sent:', info.response);
          resolve(info);
        }
      });
    });
  } catch (error) {
    console.error('Failed to generate or send the admit card:', error);
    throw error;
  }
}

const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'jobinjolly04@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const financeTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

financeTransporter.verify(function(error, success) {
  if (error) {
    console.log('Finance Mailer Error:', error);
  } else {
    console.log('Finance Mailer is ready to send messages');
  }
});

const sendFinanceEmail = (to, subject, text, callback) => {
  const mailOptions = {
    from: 'jobinjolly04@gmail.com', 
    to: to,
    subject: subject,
    text: text
  };

  financeTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending finance email:', error);
      callback(error, null);
    } else {
      console.log('Finance email sent:', info.response);
      callback(null, info.response);
    }
  });
};

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Admin registration route
app.post('/register', async (req, res) => {
  console.log('Register endpoint hit');
  const { name, username, email, password, userType } = req.body;

  if (!name || !username || !email || !password || !userType) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO school_admissions.users (name, username, email, password, user_type) VALUES (@name, @username, @password, @userType)';
    const pool = await poolPromise;
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('username', sql.NVarChar, username)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('userType', sql.NVarChar, userType)
      .query(sql);

    res.send({ status: 'success', message: 'Registration successful', userId: result.recordset.insertId });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ status: 'error', message: 'Database error during registration.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT id, name, username, email, password, user_type, isActive FROM school_admissions.users WHERE username = @username';

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('username', sql.NVarChar, username).query(sql);
    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      if (!user.isActive) {
        return res.status(403).json({ status: 'error', message: 'User is inactive. Contact admin.' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json({
          status: 'success',
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            userType: user.user_type,
          }
        });
      } else {
        res.status(401).json({ status: 'error', message: 'Invalid credentials' });
      }
    } else {
      res.status(404).json({ status: 'error', message: 'User not found' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ status: 'error', message: 'Database error during login.' });
  }
});

app.put('/update-admin/:id', async (req, res) => {
  const { id } = req.params;
  const { username, name, email, password, userType, userTypeId } = req.body;

  let updateQuery = 'UPDATE school_admissions.users SET username = @username, name = @name, email = @userType, user_type_id = @userTypeId';
  const updateParams = { username, name, email, userType, userTypeId };

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateQuery += ', password = @password';
    updateParams.password = hashedPassword;
  }

  updateQuery += ' WHERE id = @id';
  updateParams.id = id;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('username', sql.NVarChar, username)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('userType', sql.NVarChar, userType)
      .input('userTypeId', sql.Int, userTypeId)
      .input('password', sql.NVarChar, updateParams.password)
      .input('id', sql.Int, id)
      .query(updateQuery);

    res.send({ status: 'success', message: 'Admin updated successfully' });
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ status: 'error', message: 'Database error during admin update.' });
  }
});

app.put('/change-password/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'UPDATE school_admissions.users SET password = @password WHERE id = @id';
    const pool = await poolPromise;
    await pool.request()
      .input('password', sql.NVarChar, hashedPassword)
      .input('id', sql.Int, id)
      .query(sql);
    res.send({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ status: 'error', message: 'Database error during password change.' });
  }
});

app.post('/nurse-reset-password', async (req, res) => {
  const { email } = req.body;
  const resetToken = crypto.randomBytes(20).toString('hex');
  const tokenExpiration = new Date(Date.now() + 36000000000); 

  const formattedTokenExpiration = `${tokenExpiration.getUTCFullYear()}-${String(tokenExpiration.getUTCMonth() + 1).padStart(2, '0')}-${String(tokenExpiration.getUTCDate()).padStart(2, '0')} ${String(tokenExpiration.getUTCHours()).padStart(2, '0')}:${String(tokenExpiration.getUTCMinutes()).padStart(2, '0')}:${String(tokenExpiration.getUTCSeconds()).padStart(2, '0')}`;

  const sqlFindUser = 'SELECT * FROM school_admissions.nurses WHERE email = @.email';
  const sqlUpdateToken = 'UPDATE school_admissions.nurses SET reset_token = @resetToken, token_expiration = @tokenExpiration WHERE email = @email';

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('email', sql.NVarChar, email).query(sqlFindUser);

    if (result.recordset.length > 0) {
      await pool.request()
        .input('resetToken', sql.NVarChar, resetToken)
        .input('tokenExpiration', sql.DateTime, formattedTokenExpiration)
        .input('email', sql.NVarChar, email)
        .query(sqlUpdateToken);

      const mailOptions = {
        from: 'jobinjolly04@gmail.com',
        to: email,
        subject: 'Password Reset',
        text: `Please use the following link to reset your password: http://192.168.0.112:5173/reset-password/${resetToken}`
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.status(500).send({ status: 'fail', message: 'Failed to send email.' });
        } else {
          console.log('Email sent: ' + info.response);
          res.send({ status: 'success', message: 'Reset link sent to your email address.' });
        }
      });
    } else {
      res.status(404).send({ status: 'error', message: 'Email not found in our records.' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ status: 'error', message: 'Database error.' });
  }
});

app.post('/submit-application', upload.fields([
  { name: 'studentPhoto', maxCount: 1 },
  { name: 'class10Certificate', maxCount: 1 },
  { name: 'class12MarkSheet', maxCount: 1 }
]), async (req, res) => {
  const data = {
    ...req.body,
    studentPhoto: req.files['studentPhoto'] ? req.files['studentPhoto'][0].filename : '',
    studentPhotoName: req.files['studentPhoto'] ? req.files['studentPhoto'][0].originalname : '',
    class10Certificate: req.files['class10Certificate'] ? req.files['class10Certificate'][0].filename : '',
    class10CertificateName: req.files['class10Certificate'] ? req.files['class10Certificate'][0].originalname : '',
    class12MarkSheet: req.files['class12MarkSheet'] ? req.files['class12MarkSheet'][0].filename : '',
    class12MarkSheetName: req.files['class12MarkSheet'] ? req.files['class12MarkSheet'][0].originalname : '',
    submissionDate: new Date()
  };

  try {
    const pool = await poolPromise;

    // Insert the application data without the student_id
    const insertQuery = `
      INSERT INTO school_admissions.applications
      (firstName, lastName, studentPhoto, studentPhotoName, class10Certificate, class10CertificateName, class12MarkSheet, class12MarkSheetName, submissionDate)
      VALUES (@firstName, @lastName, @studentPhoto, @studentPhotoName, @class10Certificate, @class10CertificateName, @class12MarkSheet, @class12MarkSheetName, @submissionDate);
      SELECT SCOPE_IDENTITY() AS id;
    `;

    const request = pool.request();
    request.input('firstName', sql.VarChar, data.firstName);
    request.input('lastName', sql.VarChar, data.lastName);
    request.input('studentPhoto', sql.VarChar, data.studentPhoto);
    request.input('studentPhotoName', sql.VarChar, data.studentPhotoName);
    request.input('class10Certificate', sql.VarChar, data.class10Certificate);
    request.input('class10CertificateName', sql.VarChar, data.class10CertificateName);
    request.input('class12MarkSheet', sql.VarChar, data.class12MarkSheet);
    request.input('class12MarkSheetName', sql.VarChar, data.class12MarkSheetName);
    request.input('submissionDate', sql.DateTime, data.submissionDate);

    const result = await request.query(insertQuery);
    const insertedId = result.recordset[0].id;

    // Generate the student_id
    const studentId = `SON/24-25/${String(insertedId).padStart(5, '0')}`;
    const applicationId = String(insertedId).slice(-3);

    // Update the record with the generated student_id
    const updateQuery = `
      UPDATE school_admissions.applications
      SET student_id = @studentId
      WHERE id = @id
    `;

    const updateResult = await pool.request()
      .input('studentId', sql.NVarChar, studentId)
      .input('id', sql.Int, insertedId)
      .query(updateQuery);

    if (updateResult.rowsAffected[0] === 0) {
      throw new Error('Failed to update student_id');
    }

    // Prepare the email data
    const emailData = {
      Student_Name: `<strong>${req.body.firstName} ${req.body.lastName}</strong>`,
      Application_Number: `<strong>${applicationId}</strong>`,
      Student_ID: `<strong>${studentId}</strong>`,
      Student_Email: `<strong>${req.body.email}</strong>`,
      Student_Contact_Number: `<strong>${req.body.contactNumber}</strong>`,
      Transaction_ID: `<strong>123456789</strong>`,
      Application_ID: `<strong>${String(studentId).slice(-3)}</strong>`
    };

    // Send emails
    await sendTemplatedEmailToEmail('submit_application', req.body.email, emailData);
    await sendTemplatedEmailToRole('submit_application', 'nursing', emailData);
    await sendTemplatedEmailToRole('submit_application', 'finance', emailData);

    res.status(200).json({
      status: 'success',
      message: 'Application submitted successfully, emails sent.',
      applicationId: applicationId,
      studentId: studentId
    });
  } catch (error) {
    console.error('Error during application processing:', error);
    res.status(500).json({ status: 'error', message: 'Database error or email sending failure.' });
  }
});




app.get('/get-status/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT status, remarks FROM school_admissions.applications WHERE id = @id';
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query(sql);

    if (result.recordset.length > 0) {
      const application = result.recordset[0];
      res.json({
        status: 'success',
        data: {
          status: application.status,
          remarks: application.remarks
        }
      });
    } else {
      res.status(404).json({ status: 'error', message: 'Application not found.' });
    }
  } catch (error) {
    console.error('Error fetching application status:', error);
    res.status(500).json({ status: 'error', message: 'Database error while fetching status.' });
  }
});

app.post('/update-student-status', async (req, res) => {
  const { studentId, status, remarks } = req.body;
  const validStatuses = ['APPROVED', 'REJECTED'];
  const upperStatus = status.toUpperCase();

  if (!validStatuses.includes(upperStatus)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const sqlUpdateStatus = 'UPDATE school_admissions.applications SET status = @status, remarks = @remarks WHERE id = @studentId';
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('status', sql.NVarChar, upperStatus)
      .input('remarks', sql.NVarChar, remarks)
      .input('studentId', sql.Int, studentId)
      .query(sqlUpdateStatus);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    } else {
      const resultEmail = await pool.request().input('studentId', sql.Int, studentId).query('SELECT email FROM school_admissions.applications WHERE id = @studentId');
      const studentEmail = resultEmail.recordset[0].email;

      const subject = upperStatus === 'APPROVED' ? 'Approval Notice' : 'Rejection Notice';
      const message = upperStatus === 'APPROVED' ? 'Congratulations! Your application has been approved.' : 'We regret to inform you that your application has been rejected.';

      sendEmail(studentEmail, subject, message);
      res.json({ status: 'success', message: 'Student status updated and email sent successfully.' });
    }
  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({ status: 'error', message: 'Error updating student status.' });
  }
});

app.get('/approved-students', async (req, res) => {
  const sql = 'SELECT * FROM school_admissions.applications WHERE status = \'APPROVED\'';
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(sql);
    res.send(result.recordset);
  } catch (error) {
    console.error('Error fetching approved students:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

app.post('/update-and-send-admit-card', async (req, res) => {
  const { studentId, status, remarks } = req.body;
  const upperStatus = status.toUpperCase();

  if (!['APPROVED', 'REJECTED'].includes(upperStatus)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  const sqlFetchStudent = 'SELECT * FROM school_admissions.applications WHERE id = @studentId';
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('studentId', sql.Int, studentId).query(sqlFetchStudent);
    if (result.recordset.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    }
    const student = result.recordset[0];

    let sqlUpdateStatus;
    let updateParams;

    if (upperStatus === 'APPROVED') {
      sqlUpdateStatus = 'UPDATE school_admissions.applications SET status = @status, approve_remarks = @remarks WHERE id = @studentId';
      updateParams = { status: upperStatus, remarks: remarks, studentId: studentId };
    } else if (upperStatus === 'REJECTED') {
      sqlUpdateStatus = 'UPDATE school_admissions.applications SET status = @status, reject_reason = @remarks WHERE id = @studentId';
      updateParams = { status: upperStatus, remarks: remarks, studentId: studentId };
    }

    const updateResult = await pool.request()
      .input('status', sql.NVarChar, upperStatus)
      .input('remarks', sql.NVarChar, remarks)
      .input('studentId', sql.Int, studentId)
      .query(sqlUpdateStatus);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    }

    if (upperStatus === 'APPROVED') {
      try {
        const admitCardPath = await generateAndSendAdmitCard(studentId, student);
        const emailData = {
          Student_Name: `<strong>${student.firstName} ${student.lastName}</strong>`,
          Student_ID: `<strong>${student.student_id}</strong>`,
          Remarks: `<span style="color: green;"><strong>${remarks}</strong></span>`, // Approval remarks
          Date: 'June 29, 2024', // Example date
          Time: '2 PM', // Example time
          SON_Username: 'SON_Nursing_Team',
          ADMIT_CARD_ATTACHMENT: admitCardPath,
          Application_ID: `<strong>${String(studentId).slice(-3)}</strong>` 
        };

        await sendTemplatedEmailToEmail('nursing_approved', student.email, emailData, true);
        await sendTemplatedEmailToRole('nursing_approved', 'finance', emailData);
        res.json({ status: 'success', message: 'Admit card sent and finance notified.' });
      } catch (error) {
        console.error('Error during admit card generation or email notification:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send admit card or notify finance.' });
      }
    } else if (upperStatus === 'REJECTED') {
      const emailData2 = {
        Student_Name: `<strong>${student.firstName} ${student.lastName}</strong>`,
        Student_ID: `<strong>${student.student_id}</strong>`,
        Reason: `<span style="color: red;"><strong>${remarks}</strong></span>`, // Rejection reason
        Application_ID: `<strong>${String(studentId).slice(-3)}</strong>` 
      };
      await sendTemplatedEmailToEmail('nursing_rejected', student.email, emailData2); // no attachment
      await sendTemplatedEmailToRole('nursing_rejected', 'finance', emailData2);
      res.json({ status: 'success', message: 'Rejection notice sent to student and finance notified.' });
    }
  } catch (error) {
    console.error('Error during admit card update and notification:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update admit card status.' });
  }
});

app.post('/update-finance-status', async (req, res) => {
  const { studentId, financeStatus, financeRemarks } = req.body;
  const upperFinanceStatus = financeStatus.toUpperCase();

  if (!['APPROVED', 'REJECTED'].includes(upperFinanceStatus)) {
    return res.status(400).json({ message: 'Invalid finance status value.' });
  }

  let sqlUpdateFinanceStatus;
  let updateParams;

  if (upperFinanceStatus === 'APPROVED') {
    sqlUpdateFinanceStatus = 'UPDATE school_admissions.applications SET finance_status = @financeStatus, finance_approve_remarks = @financeRemarks WHERE id = @studentId';
    updateParams = { financeStatus: upperFinanceStatus, financeRemarks: financeRemarks, studentId: studentId };
  } else if (upperFinanceStatus === 'REJECTED') {
    sqlUpdateFinanceStatus = 'UPDATE school_admissions.applications SET finance_status = @financeStatus, finance_reject_reason = @financeRemarks WHERE id = @studentId';
    updateParams = { financeStatus: upperFinanceStatus, financeRemarks: financeRemarks, studentId: studentId };
  }

  try {
    const pool = await poolPromise;
    const updateResult = await pool.request()
      .input('financeStatus', sql.NVarChar, upperFinanceStatus)
      .input('financeRemarks', sql.NVarChar, financeRemarks)
      .input('studentId', sql.Int, studentId)
      .query(sqlUpdateFinanceStatus);

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    }

    const result = await pool.request().input('studentId', sql.Int, studentId).query('SELECT * FROM school_admissions.applications WHERE id = @studentId');
    const student = result.recordset[0];

    const emailData = {
      Student_Name: `<strong>${student.firstName} ${student.lastName}</strong>`,
      Student_ID: `<strong>${student.student_id}</strong>`,
      Application_ID: `<strong>${String(studentId).slice(-3)}</strong>`,
      Reason: `<span style="color: red;"><strong>${financeRemarks}</strong></span>`,
    };

    const eventTrigger = upperFinanceStatus === 'APPROVED' ? 'finance_approved' : 'finance_rejected';

    await sendTemplatedEmailToEmail(eventTrigger, student.email, emailData);
    await sendTemplatedEmailToRole(eventTrigger, 'nursing', emailData);

    res.json({ status: 'success', message: `Finance status updated to ${financeStatus}.` });
  } catch (error) {
    console.error('Error during finance status update:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update finance status.', error: error.message });
  }
});

app.put('/update-student/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (updatedData.dob) {
    const dob = new Date(updatedData.dob);
    const formattedDOB = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;
    updatedData.dob = formattedDOB;
  }

  if (updatedData.submissionDate) {
    const submissionDate = new Date(updatedData.submissionDate);
    const formattedSubmissionDate = `${submissionDate.getFullYear()}-${String(submissionDate.getMonth() + 1).padStart(2, '0')}-${String(submissionDate.getDate()).padStart(2, '0')} ${String(submissionDate.getHours()).padStart(2, '0')}:${String(submissionDate.getMinutes()).padStart(2, '0')}:${String(submissionDate.getSeconds()).padStart(2, '0')}`;
    updatedData.submissionDate = formattedSubmissionDate;
  }

  const sqlUpdateStudent = 'UPDATE school_admissions.applications SET @updatedData WHERE id = @id';
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('updatedData', sql.NVarChar, JSON.stringify(updatedData))
      .input('id', sql.Int, id)
      .query(sqlUpdateStudent);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    }
    res.json({ status: 'success', message: 'Student information updated successfully.' });
  } catch (error) {
    console.error('Error updating student information:', error);
    res.status(500).json({ status: 'error', message: 'Error updating student information.' });
  }
});

app.delete('/delete-student/:id', async (req, res) => {
  const { id } = req.params;

  const sqlDeleteStudent = 'DELETE FROM school_admissions.applications WHERE id = @id';
  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query(sqlDeleteStudent);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ status: 'error', message: 'Student not found.' });
    }
    res.json({ status: 'success', message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ status: 'error', message: 'Error deleting student.' });
  }
});

// Fetch all email templates
app.get('/get-email-templates', async (req, res) => {
  const sqlQuery = 'SELECT * FROM school_admissions.email_templates';
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).send({ status: 'error', message: 'Database error while fetching email templates.' });
  }
});


// Update an email template
app.put('/update-email-template/:id', async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ status: 'error', message: 'Subject and body are required.' });
  }

  const sql = 'UPDATE school_admissions.email_templates SET subject = @subject, body = @body WHERE id = @id';
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('subject', sql.NVarChar, subject)
      .input('body', sql.NVarChar, body)
      .input('id', sql.Int, id)
      .query(sql);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ status: 'error', message: 'Email template not found.' });
    }
    res.json({ status: 'success', message: 'Email template updated successfully.' });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ status: 'error', message: 'Database error while updating email template.' });
  }
});

app.put('/update-user/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = { ...req.body };

  if (updatedData.created_at) {
    const createdAt = new Date(updatedData.created_at);
    const formattedCreatedAt = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')} ${String(createdAt.getHours()).padStart(2, '0')}:${String(createdAt.getMinutes()).padStart(2, '0')}:${String(createdAt.getSeconds()).padStart(2, '0')}`;
    updatedData.created_at = formattedCreatedAt;
  }

  try {
    const sql = 'UPDATE school_admissions.users SET @updatedData WHERE id = @id';
    const pool = await poolPromise;
    const result = await pool.request()
      .input('updatedData', sql.NVarChar, JSON.stringify(updatedData))
      .input('id', sql.Int, id)
      .query(sql);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }
    res.status(200).send({ status: 'success', message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send({ status: 'error', message: 'Error updating user' });
  }
});

app.put('/update-user-status/:id', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ status: 'error', message: 'Invalid isActive value.' });
  }

  const sqlUpdateStatus = 'UPDATE school_admissions.users SET isActive = @isActive WHERE id = @id';
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('isActive', sql.Bit, isActive)
      .input('id', sql.Int, id)
      .query(sqlUpdateStatus);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }
    res.status(200).send({ status: 'success', message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).send({ status: 'error', message: 'Error updating user status' });
  }
});

app.delete('/delete-user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'DELETE FROM school_admissions.users WHERE id = @id';
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query(sql);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }
    res.status(200).send({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send({ status: 'error', message: 'Error deleting user' });
  }
});

app.post('/change-password/:id', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE school_admissions.users SET password = @password WHERE id = @id';
    const pool = await poolPromise;
    await pool.request()
      .input('password', sql.NVarChar, hashedPassword)
      .input('id', sql.Int, id)
      .query(sql);
    res.status(200).send({ status: 'success', message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send({ status: 'error', message: 'Error changing password' });
  }
});

app.get('/get-users', async (req, res) => {
  const sql = 'SELECT * FROM school_admissions.users';
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(sql);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Database error while fetching users.' });
  }
});

app.get('/get-action-matrix', async (req, res) => {
  const sqlQuery = 'SELECT TOP 1 action_type FROM school_admissions.action_matrix WHERE is_active = 1';
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(sqlQuery);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No active action type found.' });
    }
    res.json({ actionType: result.recordset[0].action_type });
  } catch (error) {
    console.error('Error fetching active action type:', error);
    res.status(500).json({ message: 'Database error while fetching active action type.' });
  }
});


app.post('/set-action-matrix', async (req, res) => {
  const { actionType } = req.body;
  const validActions = ['parallel', 'finance', 'nursing'];
  if (!validActions.includes(actionType.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid action type' });
  }

  const sqlDeactivateActions = 'UPDATE school_admissions.action_matrix SET is_active = 0 WHERE is_active = 1';
  const sqlActivateAction = 'UPDATE school_admissions.action_matrix SET is_active = 1 WHERE action_type = @actionType';

  try {
    const pool = await poolPromise;
    await pool.request().query(sqlDeactivateActions);
    const result = await pool.request().input('actionType', sql.NVarChar, actionType.toLowerCase()).query(sqlActivateAction);
    if (result.rowsAffected[0] === 0) {
      const sqlInsertAction = 'INSERT INTO school_admissions.action_matrix (action_type, is_active) VALUES (@actionType, 1)';
      await pool.request().input('actionType', sql.NVarChar, actionType.toLowerCase()).query(sqlInsertAction);
    }
    res.status(200).json({ status: 'success', message: 'Action matrix updated successfully' });
  } catch (error) {
    console.error('Error updating action matrix:', error);
    res.status(500).json({ message: 'Database error while updating action matrix.' });
  }
});

app.get('/api/dashboard', async (req, res) => {
  const sql = `
    SELECT 
      status, 
      finance_status, 
      COUNT(*) as count 
    FROM 
      school_admissions.applications 
    GROUP BY 
      status, 
      finance_status
  `;

  try {
    const pool = await poolPromise;
    const result = await pool.request().query(sql);

    const counts = {
      registered: 0,
      approved: 0,
      rejected: 0,
      pending: 0,
      financePending: 0
    };

    result.recordset.forEach(row => {
      counts.registered += row.count;

      if (row.status === 'APPROVED' && row.finance_status === 'PENDING') {
        counts.financePending += row.count;
      } else if (row.status === 'REJECTED' && row.finance_status === 'PENDING') {
        counts.financePending += row.count;
      }

      if (row.status === 'APPROVED') {
        counts.approved += row.count;
      } else if (row.status === 'REJECTED') {
        counts.rejected += row.count;
      } else if (row.status === 'PENDING'){
        counts.pending += row.count;
      }
    });

    res.send(counts);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

app.get('/api/finance-dashboard', async (req, res) => {
  const { status } = req.query;
  let sqlQuery = `
    SELECT finance_status AS finance_status, COUNT(*) as count 
    FROM school_admissions.applications 
  `;
  if (status) {
    sqlQuery += ` WHERE finance_status = @status`;
  }
  sqlQuery += ` GROUP BY finance_status`;

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('status', sql.NVarChar, status).query(sqlQuery);

    const counts = {
      total: 0,
      financeApproved: 0,
      financeRejected: 0,
      financePending: 0
    };

    result.recordset.forEach(row => {
      switch (row.finance_status) {
        case 'APPROVED':
          counts.financeApproved = row.count;
          break;
        case 'REJECTED':
          counts.financeRejected = row.count;
          break;
        case 'PENDING':
          counts.financePending = row.count;
          break;
        default:
          console.error(`Unknown finance status: ${row.finance_status}`);
          break;
      }
    });

    counts.total = result.recordset.reduce((acc, curr) => acc + curr.count, 0);

    res.send(counts);
  } catch (error) {
    console.error('Error fetching finance dashboard data:', error);
    res.status(500).send({ status: 'error', message: 'Database error.' });
  }
});


app.get('/get-applications', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM school_admissions.applications');
    res.send(result.recordset);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).send({ status: 'error', message: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is now accessible on all network interfaces at port ${PORT}`);
});
