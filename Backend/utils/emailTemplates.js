const resetPasswordTemplate = (resetUrl, userName = 'User') => `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 30px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#2563eb; padding:20px; text-align:center;">
              <h2 style="color:#ffffff; margin:0;">Password Reset Request</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="font-size:15px; color:#333;">Hi ${userName},</p>
              <p style="font-size:15px; color:#333;">
                We received a request to reset your password. Click the button below to set a new one.
                This link is valid for <strong>15 minutes</strong>.
              </p>
              <div style="text-align:center; margin: 30px 0;">
                <a href="${resetUrl}" target="_blank"
                   style="background:#2563eb; color:#ffffff; padding:12px 28px; border-radius:6px; text-decoration:none; font-size:15px; font-weight:bold; display:inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="font-size:13px; color:#777;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${resetUrl}" style="color:#2563eb; word-break:break-all;">${resetUrl}</a>
              </p>
              <p style="font-size:13px; color:#999; margin-top:25px;">
                If you didn't request this, you can safely ignore this email — your password won't be changed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f7; padding:15px; text-align:center;">
              <p style="font-size:12px; color:#aaa; margin:0;">&copy; ${new Date().getFullYear()} GTech-CODE. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const verificationEmailTemplate = (verificationUrl, userName = 'User') => `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding: 30px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#16a34a; padding:20px; text-align:center;">
              <h2 style="color:#ffffff; margin:0;">Verify Your Email</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="font-size:15px; color:#333;">Hi ${userName},</p>
              <p style="font-size:15px; color:#333;">
                Welcome to GTech-CODE. Click the button below to verify your email address.
              </p>
              <div style="text-align:center; margin: 30px 0;">
                <a href="${verificationUrl}" target="_blank"
                   style="background:#16a34a; color:#ffffff; padding:12px 28px; border-radius:6px; text-decoration:none; font-size:15px; font-weight:bold; display:inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="font-size:13px; color:#777;">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${verificationUrl}" style="color:#16a34a; word-break:break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f4f4f7; padding:15px; text-align:center;">
              <p style="font-size:12px; color:#aaa; margin:0;">&copy; ${new Date().getFullYear()} GTech-CODE. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { resetPasswordTemplate, verificationEmailTemplate };