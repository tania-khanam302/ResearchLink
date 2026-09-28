import nodeMailer from "nodemailer";

export const sendEmail = async ({ to, subject, message }) => {
  try {
    const transporter = nodeMailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      service: process.env.SMTP_SERVICE,

      /*ata on rakhle terminal a dekha jabe
      // host: process.env.SMTP_HOST,
      // port: process.env.SMTP_PORT,
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    //   service: process.env.SMTP_SERVICE,

    */
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html: message,
    };

    const info = await transporter.sendMail(mailOptions);
    const acceptedRecipients = (info.accepted || []).map((recipient) =>
      String(recipient).toLowerCase(),
    );
    const requestedRecipients = (Array.isArray(to) ? to : [to]).map((recipient) =>
      String(recipient).toLowerCase(),
    );

    console.info("SMTP delivery result", {
      messageId: info.messageId,
      acceptedCount: acceptedRecipients.length,
      rejectedCount: info.rejected?.length || 0,
      response: info.response,
    });

    if (!requestedRecipients.some((recipient) => acceptedRecipients.includes(recipient))) {
      throw new Error("SMTP server did not accept the recipient");
    }

    return info;
  } catch (error) {
    throw new Error(error.message || "Cannot send E-mail");
  }
};
