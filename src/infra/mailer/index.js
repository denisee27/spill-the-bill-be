import nodemailer from 'nodemailer';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
import logger from '../logger/index.js';
import { otpEmailHtml, otpEmailText } from './otp.template.js';
import {
  orderCreatedEmailHtml,
  orderCreatedEmailText,
  paymentReceivedEmailHtml,
  paymentReceivedEmailText,
  paymentApprovedEmailHtml,
  paymentApprovedEmailText,
  paymentRejectedEmailHtml,
  paymentRejectedEmailText,
  orderDeliveredEmailHtml,
  orderDeliveredEmailText,
  orderShippedEmailHtml,
  orderShippedEmailText,
  refundRequestedEmailHtml,
  refundRequestedEmailText,
  refundDetailSubmittedEmailHtml,
  refundDetailSubmittedEmailText,
} from './order.template.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || `"Spill the Bill" <${process.env.SMTP_USER}>`;
const REPLY_TO = process.env.SMTP_USER;

export async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject,
      text: text || '',
      html,
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=unsubscribe>`,
        'X-Priority': '3',
        'Precedence': 'bulk',
      },
    });
    logger.info({ messageId: info.messageId, to }, 'Email sent');
    return info;
  } catch (err) {
    logger.error({ err, to }, 'Failed to send email');
    throw err;
  }
}

export async function sendOtpEmail({ to, code }) {
  try {
    await sendMail({
      to,
      subject: 'Your Spill the Bill Verification Code',
      html: otpEmailHtml(code),
      text: otpEmailText(code),
    });
    logger.info({ to }, 'OTP email sent');
  } catch (err) {
    logger.error({ err, to }, 'Failed to send OTP email');
    throw err;
  }
}

export async function sendOrderCreatedEmail({ to, orderId, customerName, amount, paymentDeadline }) {
  try {
    let qrisAttachment = null;
    try {
      const qrisBuffer = await readFile(join(__dirname, 'qris.jpeg'));
      qrisAttachment = { filename: 'qris.jpeg', content: qrisBuffer, cid: 'qris', contentDisposition: 'inline' };
    } catch {
      logger.warn({ orderId }, 'qris.jpeg not found, skipping attachment');
    }

    const mailOptions = {
      from: FROM,
      replyTo: REPLY_TO,
      to,
      subject: `Order Confirmed - #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: orderCreatedEmailHtml({ customerName, orderId, amount, paymentDeadline, qrisDownloadUrl: `${process.env.FRONTEND_URL}/qris.jpeg` }),
      text: orderCreatedEmailText({ customerName, orderId, amount, paymentDeadline }),
      headers: {
        'List-Unsubscribe': `<mailto:${REPLY_TO}?subject=unsubscribe>`,
        'X-Priority': '3',
        'Precedence': 'bulk',
      },
    };
    if (qrisAttachment) mailOptions.attachments = [qrisAttachment];

    const info = await transporter.sendMail(mailOptions);
    logger.info({ messageId: info.messageId, orderId, to }, 'Order created email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send order created email');
  }
}

export async function sendPaymentReceivedEmail({ to, orderId, customerName, amount }) {
  try {
    await sendMail({
      to,
      subject: `Payment Proof Received - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: paymentReceivedEmailHtml({ customerName, orderId, amount }),
      text: paymentReceivedEmailText({ customerName, orderId, amount }),
    });
    logger.info({ orderId, to }, 'Payment received email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send payment received email');
  }
}

export async function sendPaymentApprovedEmail({ to, orderId, customerName, amount }) {
  try {
    await sendMail({
      to,
      subject: `Payment Confirmed - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: paymentApprovedEmailHtml({ customerName, orderId, amount }),
      text: paymentApprovedEmailText({ customerName, orderId, amount }),
    });
    logger.info({ orderId, to }, 'Payment approved email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send payment approved email');
  }
}

export async function sendPaymentRejectedEmail({ to, orderId, customerName, reason }) {
  try {
    await sendMail({
      to,
      subject: `Payment Update - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: paymentRejectedEmailHtml({ customerName, orderId, reason }),
      text: paymentRejectedEmailText({ customerName, orderId, reason }),
    });
    logger.info({ orderId, to }, 'Payment rejected email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send payment rejected email');
  }
}

export async function sendOrderDeliveredEmail({ to, orderId, customerName, deliveryNotes, proofImageUrls }) {
  try {
    await sendMail({
      to,
      subject: `Order Delivered - #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: orderDeliveredEmailHtml({ customerName, orderId, deliveryNotes, proofImageUrls }),
      text: orderDeliveredEmailText({ customerName, orderId, deliveryNotes }),
    });
    logger.info({ orderId, to }, 'Order delivered email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send order delivered email');
  }
}

export async function sendOrderShippedEmail({ to, orderId, customerName, deliveryNotes, estimatedDeliveryDate, frontendUrl }) {
  try {
    await sendMail({
      to,
      subject: `Your Order Is On Its Way - #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: orderShippedEmailHtml({ customerName, orderId, deliveryNotes, estimatedDeliveryDate, frontendUrl }),
      text: orderShippedEmailText({ customerName, orderId, deliveryNotes, estimatedDeliveryDate }),
    });
    logger.info({ orderId, to }, 'Order shipped email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send order shipped email');
  }
}

export async function sendRefundRequestedEmail({ to, orderId, customerName, reason, frontendUrl }) {
  try {
    await sendMail({
      to,
      subject: `Refund Will Be Processed - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: refundRequestedEmailHtml({ customerName, orderId, reason, frontendUrl }),
      text: refundRequestedEmailText({ customerName, orderId, reason, frontendUrl }),
    });
    logger.info({ orderId, to }, 'Refund requested email sent');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send refund requested email');
  }
}

export async function sendRefundDetailSubmittedEmail({ to, orderId, customerName, customerEmail, refundDetail, adminOrderUrl }) {
  try {
    await sendMail({
      to,
      subject: `[Action Required] Refund Details Submitted - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: refundDetailSubmittedEmailHtml({ orderId, customerName, customerEmail, refundDetail, adminOrderUrl }),
      text: refundDetailSubmittedEmailText({ orderId, customerName, customerEmail, refundDetail }),
    });
    logger.info({ orderId, to }, 'Refund detail submitted email sent to admin');
  } catch (err) {
    logger.error({ err, orderId }, 'Failed to send refund detail submitted email');
  }
}

export default transporter;
