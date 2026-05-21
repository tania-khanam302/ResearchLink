export function generateForgotPasswordEmailTemplate(resetPasswordUrl) {
  return `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e5e7eb; border-radius:8px; background-color:#ffffff; color:#1f2937;">

    <!-- Header -->
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="color:#3b82f6; margin:0;">Final Year Project Management System - 🔐 Password Reset Request</h2>
      <p style="font-size:14px; color:#6b7280; margin:5px 0 0;">
        Secure access to your account
      </p>
    </div>

    <!-- Body -->
    <p style="font-size:16px; color:#374151;">Dear User,</p>

    <p style="font-size:16px; color:#374151;">
      We received a request to reset your password. Click the button below:
    </p>

    <!-- Button -->
    <div style="text-align:center; margin:30px 0;">
      <a href="${resetPasswordUrl}"
         style="display:inline-block; padding:12px 24px; background:#3b82f6; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
        Reset Password
      </a>
    </div>

    <p style="font-size:14px; color:#374151;">
      If you did not request this, you can safely ignore this email.
      This link will expire soon.
    </p>

    <p style="font-size:14px; color:#374151;">
      If button doesn't work, copy and paste this link:
    </p>

    <p style="font-size:12px; color:#6b7280; word-break:break-all;">
      ${resetPasswordUrl}
    </p>

  </div>
  `;
}