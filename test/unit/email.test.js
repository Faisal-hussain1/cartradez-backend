const mockSendMail = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  sendMail: mockSendMail,
}));

jest.mock('nodemailer', () => ({
  createTransport: mockCreateTransport,
}));

const configureEmailEnvironment = () => {
  process.env.EMAIL_HOST = 'smtp.gmail.com';
  process.env.EMAIL_PORT = '587';
  process.env.EMAIL_SECURE = 'false';
  process.env.EMAIL_USER = 'authenticated@gmail.com';
  process.env.EMAIL_PASS = 'test-password';
  process.env.DEFAULT_EMAIL_ADDRESS = 'different@gmail.com';
  process.env.DEFAULT_EMAIL_NAME = 'CarTradez';
  process.env.EMAIL_REPLY_TO = 'support@cartradez.com';
  delete process.env.EMAIL_ALLOW_FROM_ALIAS;
};

describe('transactional email', () => {
  beforeEach(() => {
    jest.resetModules();
    mockSendMail.mockReset();
    mockSendMail.mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['customer@example.com'],
      rejected: [],
    });
    configureEmailEnvironment();
  });

  test('aligns Gmail From and envelope addresses and adds plain text', async () => {
    const sendEmail = require('../../utils/email/send');

    await sendEmail({
      to: 'customer@example.com',
      subject: 'Account update',
      html: '<p>Hello &amp; welcome</p>',
    });

    const message = mockSendMail.mock.calls[0][0];

    expect(message.from).toEqual({
      name: 'CarTradez',
      address: 'authenticated@gmail.com',
    });
    expect(message.envelope).toEqual({
      from: 'authenticated@gmail.com',
      to: 'customer@example.com',
    });
    expect(message.replyTo).toBe('support@cartradez.com');
    expect(message.text).toBe('Hello & welcome');
  });

  test('uses the compact shared email style for password resets', async () => {
    const resetPassword = require('../../utils/email/processes/resetPassword');

    await resetPassword({
      user: {
        email: 'customer@example.com',
        firstName: '<Alex>',
        lastName: 'Driver',
      },
      resetUrl: 'https://www.cartradez.com/reset/example-token',
    });

    const message = mockSendMail.mock.calls[0][0];

    expect(message.html).toContain('max-width:320px');
    expect(message.html).toContain('Reset Your Password');
    expect(message.html).toContain('&lt;Alex&gt; Driver');
    expect(message.html).not.toContain('Hello <Alex> Driver');
    expect(message.text).toContain(
      'https://www.cartradez.com/reset/example-token'
    );
  });
});
