const generateOtpTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
        <h2 style="color: #ea580c; margin: 0;">Near Look</h2>
      </div>
      <div style="padding: 20px 0; text-align: center;">
        <h3 style="color: #333; font-size: 24px;">Your Verification Code</h3>
        <p style="color: #666; font-size: 16px;">Please use the following OTP to complete your login/signup process.</p>
        <div style="margin: 30px auto; padding: 15px; background-color: #fff; border: 2px dashed #ea580c; display: inline-block; border-radius: 8px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #aaa; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Near Look. All rights reserved.
      </div>
    </div>
  `;
};

const generateStatusTemplate = (title, status, reason = '') => {
  const isApproved = status.toUpperCase() === 'APPROVED';
  const color = isApproved ? '#16a34a' : '#dc2626';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
        <h2 style="color: #ea580c; margin: 0;">Near Look</h2>
      </div>
      <div style="padding: 20px 0;">
        <h3 style="color: #333; font-size: 20px; text-align: center;">Update on Your Submission</h3>
        <p style="color: #555; font-size: 16px; line-height: 1.5;">
          Your item <strong>"${title}"</strong> has been reviewed.
        </p>
        <div style="margin: 20px 0; padding: 15px; border-radius: 6px; background-color: #fff; border-left: 4px solid ${color};">
          <p style="margin: 0; font-size: 16px; color: #333;">
            Status: <span style="color: ${color}; font-weight: bold;">${status.toUpperCase()}</span>
          </p>
          ${reason ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #666;"><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">
          ${isApproved ? 'Your item is now live and visible to customers.' : 'Please address the issues mentioned and try again.'}
        </p>
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #aaa; font-size: 12px;">
        &copy; ${new Date().getFullYear()} Near Look. All rights reserved.
      </div>
    </div>
  `;
};

module.exports = {
  generateOtpTemplate,
  generateStatusTemplate
};
