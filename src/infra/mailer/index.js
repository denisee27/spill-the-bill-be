import nodemailer from 'nodemailer';
import logger from '../logger/index.js';
import { otpEmailText } from './otp.template.js';
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
} from './order.template.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'spillthebillteam@gmail.com',
    pass: 'ifhyubwxfjnusfgk',
  },
});

const FROM = '"Spill the Bill" <spillthebillteam@gmail.com>';

export async function sendMail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({ from: FROM, to, subject, text: text || '', html });
    logger.info({ messageId: info.messageId, to }, 'Email sent');
    return info;
  } catch (err) {
    logger.error({ err, to }, 'Failed to send email');
    throw err;
  }
}

export async function sendOrderCreatedEmail({ to, orderId, customerName, amount, qrisUrl }) {
  try {
    await sendMail({
      to,
      subject: `Order Confirmed - #${orderId.toString().slice(0, 8).toUpperCase()}`,
      html: orderCreatedEmailHtml({ customerName, orderId, amount, qrisUrl }),
      text: orderCreatedEmailText({ customerName, orderId, amount }),
    });
    logger.info({ orderId, to }, 'Order created email sent');
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
      subject: `Payment Confirmed ✓ - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
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
      subject: `Your Order Has Been Delivered! - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
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
      subject: `Your Order Is On Its Way! - Order #${orderId.toString().slice(0, 8).toUpperCase()}`,
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

export default transporter;
