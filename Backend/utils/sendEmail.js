import nodemailer from 'nodemailer';
export const sendEmail = async (to, messageContent) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'medibed098@gmail.com',
        pass: 'vtbdfqilayxkrkpj', // Use your Google App Password
      },
      tls: {
        rejectUnauthorized: false,
      },
      logger: true,
      debug: true,
    });

    // Message object
    const message = {
      from: 'medibed098@gmail.com',
      to,
      subject: "Patient Details from Hospital Management System",
      html: `<h3>Patient Details</h3>
             <pre>${messageContent}</pre>`,
    };

    // Send the email
    const info = await transporter.sendMail(message);
    console.log('Message sent:', info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

