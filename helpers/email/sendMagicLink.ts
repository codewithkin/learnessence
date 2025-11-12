import nodemailer from 'nodemailer';

interface SendMagicLinkParams {
  email: string;
  token: string;
  url: string;
}

export async function sendMagicLink({ email, token, url }: SendMagicLinkParams) {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email content
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'LearnEssence'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: email,
    subject: 'Sign in to LearnEssence',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sign in to LearnEssence</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 40px; text-align: center;">
            <h1 style="color: #111827; margin-bottom: 24px;">Sign in to LearnEssence</h1>
            <p style="color: #6b7280; font-size: 16px; margin-bottom: 32px;">
              Click the button below to sign in to your account. This link will expire in 15 minutes.
            </p>
            <a href="${url}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Sign In
            </a>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #6b7280; font-size: 14px; word-break: break-all; margin-top: 8px;">
              ${url}
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Sign in to LearnEssence

Click the link below to sign in to your account. This link will expire in 15 minutes.

${url}

If you didn't request this email, you can safely ignore it.
    `.trim(),
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Magic link email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending magic link email:', error);
    throw new Error('Failed to send magic link email');
  }
}
