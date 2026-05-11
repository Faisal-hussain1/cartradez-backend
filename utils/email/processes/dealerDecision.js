const sendEmail = require('../send');

module.exports = async ({user, status, reason}) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  const isApproved = status === 'approved';

  const subject = isApproved
    ? 'Your CarTradez Dealer Request Has Been Approved'
    : 'Your CarTradez Dealer Request Has Been Rejected';

  const reasonBlock =
    !isApproved && reason
      ? `<p><strong>Reason:</strong> ${reason}</p>`
      : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; line-height: 1.6;">
      <h2>${isApproved ? 'Dealer Request Approved' : 'Dealer Request Rejected'}</h2>
      <p>Hello ${fullName || 'User'},</p>
      <p>
        Your dealer request on <strong>CarTradez</strong> has been
        <strong>${isApproved ? ' approved' : ' rejected'}</strong>.
      </p>
      ${reasonBlock}
      <p>
        ${isApproved
          ? 'You can now continue using dealer features.'
          : 'You can update your details and submit a new dealer request.'}
      </p>
      <p>Regards,<br/><strong>CarTradez Team</strong></p>
    </div>
  `;

  await sendEmail({
    to: user.email,
    subject,
    html,
  });
};
