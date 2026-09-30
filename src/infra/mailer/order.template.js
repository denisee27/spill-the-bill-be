const BRAND = '#9b1c1c';
const BRAND_LIGHT = '#fef2f2';

function baseLayout(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} - Spill the Bill</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND};padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.3px;">Spill the Bill</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:12px;">${title}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">Spill the Bill Team &bull; Thank you for shopping with us!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function greeting(name) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${name}</strong>,</p>`;
}

function orderBadge(orderId, color = BRAND) {
  return `<p style="margin:0 0 20px;font-size:12px;font-weight:700;color:${color};letter-spacing:0.05em;text-transform:uppercase;">
    Order #${orderId.toString().slice(0, 8).toUpperCase()}
  </p>`;
}

function statusBadge(label, color, bg) {
  return `<span style="display:inline-block;padding:4px 12px;background:${bg};color:${color};border-radius:999px;font-size:12px;font-weight:700;">${label}</span>`;
}

function divider() {
  return `<div style="border-top:1px solid #f3f4f6;margin:24px 0;"></div>`;
}

// ── 0. Order created — send QRIS so user can pay ────────────────────────────
export function orderCreatedEmailHtml({ customerName, orderId, amount, qrisUrl }) {
  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId)}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Order Confirmed!</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      Your order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong> has been placed.
      Please complete your payment using the QRIS code below.
    </p>

    <!-- Total box -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="background:${BRAND_LIGHT};border-radius:10px;padding:16px 20px;text-align:center;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Total to pay</p>
          <p style="margin:0;font-size:28px;font-weight:800;color:${BRAND};">${amount}</p>
        </td>
      </tr>
    </table>

    <!-- QRIS image -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td align="center" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#374151;">Scan QRIS to Pay</p>
          ${qrisUrl ? `<img src="${qrisUrl}" alt="QRIS Payment Code" width="220" style="border-radius:8px;display:block;margin:0 auto;" />` : ''}
          <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;">Open your banking or e-wallet app and scan</p>
        </td>
      </tr>
    </table>

    ${divider()}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      After paying, please upload your payment proof through the <strong>My Orders</strong> page. We'll verify it within 24 hours.
    </p>
  `;
  return baseLayout('Order Confirmed', body);
}

export function orderCreatedEmailText({ customerName, orderId, amount }) {
  return `Hi ${customerName},

Your order #${orderId.toString().slice(0, 8).toUpperCase()} has been placed!
Total to pay: ${amount}

Please scan the QRIS code in the app or transfer to our bank account, then upload your payment proof in My Orders.

— Spill the Bill Team`;
}

// ── 1. Payment proof received (user uploaded proof → CHECKING_PAYMENT) ─────
export function paymentReceivedEmailHtml({ customerName, orderId, amount }) {
  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId)}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Payment Proof Received</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      We've received your payment proof for order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong>.
      Our team will verify it shortly — this usually takes less than 24 hours.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:${BRAND_LIGHT};border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Order total</p>
          <p style="margin:0;font-size:22px;font-weight:800;color:${BRAND};">${amount}</p>
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      You'll receive another email once your payment is verified. If you have any questions, feel free to contact us via WhatsApp.
    </p>
  `;
  return baseLayout('Payment Proof Received', body);
}

export function paymentReceivedEmailText({ customerName, orderId, amount }) {
  return `Hi ${customerName},

We received your payment proof for order #${orderId.toString().slice(0, 8).toUpperCase()} (${amount}).

Our team will verify it within 24 hours. We'll email you once it's confirmed.

— Spill the Bill Team`;
}

// ── 2. Payment approved ──────────────────────────────────────────────────────
export function paymentApprovedEmailHtml({ customerName, orderId, amount }) {
  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId, '#15803d')}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Payment Confirmed! 🎉</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      Great news! Your payment for order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong> has been verified and confirmed.
      We're now preparing your order for shipment.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Status</p>
                ${statusBadge('Payment Approved', '#15803d', '#dcfce7')}
              </td>
              <td align="right">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Total paid</p>
                <p style="margin:0;font-size:18px;font-weight:800;color:#15803d;">${amount}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      We'll notify you again once your order is shipped. Thank you for shopping with Spill the Bill!
    </p>
  `;
  return baseLayout('Payment Confirmed', body);
}

export function paymentApprovedEmailText({ customerName, orderId, amount }) {
  return `Hi ${customerName},

Your payment for order #${orderId.toString().slice(0, 8).toUpperCase()} (${amount}) has been confirmed!

We're now preparing your order. You'll receive another email when it's shipped.

— Spill the Bill Team`;
}

// ── 3. Payment rejected ──────────────────────────────────────────────────────
export function paymentRejectedEmailHtml({ customerName, orderId, reason }) {
  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId, '#dc2626')}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Payment Not Verified</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      Unfortunately, we were unable to verify your payment for order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong>.
    </p>
    ${reason ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Reason</p>
          <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">${reason}</p>
        </td>
      </tr>
    </table>
    ` : ''}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      Please re-upload your payment proof or contact us via WhatsApp if you believe this is an error. We're happy to help resolve this.
    </p>
  `;
  return baseLayout('Payment Not Verified', body);
}

export function paymentRejectedEmailText({ customerName, orderId, reason }) {
  return `Hi ${customerName},

We were unable to verify your payment for order #${orderId.toString().slice(0, 8).toUpperCase()}.
${reason ? `\nReason: ${reason}` : ''}
Please contact us via WhatsApp or re-upload your payment proof.

— Spill the Bill Team`;
}

// ── 4. Order delivered ───────────────────────────────────────────────────────
export function orderDeliveredEmailHtml({ customerName, orderId, deliveryNotes, proofImageUrls = [] }) {
  const imagesHtml = proofImageUrls.length > 0 ? `
    <p style="margin:20px 0 8px;font-size:13px;font-weight:700;color:#374151;">Delivery Proof</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${proofImageUrls.map((url) => `
          <td style="padding:0 4px 0 0;" width="${Math.floor(100 / Math.min(proofImageUrls.length, 3))}%">
            <a href="${url}" target="_blank" style="display:block;">
              <img src="${url}" alt="Delivery proof" style="width:100%;border-radius:8px;border:1px solid #e5e7eb;object-fit:cover;" />
            </a>
          </td>
        `).join('')}
      </tr>
    </table>
  ` : '';

  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId, '#2563eb')}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Your Order Has Been Delivered!</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      Order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong> has been marked as delivered.
      We hope you love your purchase!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Status</p>
          ${statusBadge('Delivered', '#1d4ed8', '#dbeafe')}
          ${deliveryNotes ? `<p style="margin:12px 0 0;font-size:13px;color:#1e40af;line-height:1.6;"><strong>Note:</strong> ${deliveryNotes}</p>` : ''}
        </td>
      </tr>
    </table>
    ${imagesHtml}
    ${divider()}
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">
      If there's any issue with your order, please contact us within 3 days. Thank you for shopping with Spill the Bill!
    </p>
  `;
  return baseLayout('Order Delivered', body);
}

export function orderDeliveredEmailText({ customerName, orderId, deliveryNotes }) {
  return `Hi ${customerName},

Your order #${orderId.toString().slice(0, 8).toUpperCase()} has been delivered!
${deliveryNotes ? `\nNote from our team: ${deliveryNotes}` : ''}
If there's any issue, contact us within 3 days.

Thank you for shopping with Spill the Bill!
— Spill the Bill Team`;
}

// ── 5. Order shipped ─────────────────────────────────────────────────────────
export function orderShippedEmailHtml({ customerName, orderId, deliveryNotes, estimatedDeliveryDate, frontendUrl }) {
  const etaText = estimatedDeliveryDate
    ? new Date(estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId, '#7c3aed')}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Your Order Is On Its Way!</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      Order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong> has been handed to the courier and is on its way to you.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:16px 20px;">
          ${statusBadge('Shipped', '#6d28d9', '#ede9fe')}
          ${etaText ? `<p style="margin:12px 0 0;font-size:13px;color:#5b21b6;line-height:1.6;"><strong>Estimated arrival:</strong> ${etaText}</p>` : ''}
          ${deliveryNotes ? `<p style="margin:8px 0 0;font-size:13px;color:#5b21b6;line-height:1.6;"><strong>Note:</strong> ${deliveryNotes}</p>` : ''}
        </td>
      </tr>
    </table>
    ${divider()}
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">
      Once your package arrives, please confirm receipt in the app so we know it's been delivered safely.
    </p>
    ${frontendUrl ? `<a href="${frontendUrl}/orders" style="display:inline-block;padding:12px 28px;background:#7c3aed;color:#fff;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Track My Order</a>` : ''}
  `;
  return baseLayout('Order Shipped', body);
}

export function orderShippedEmailText({ customerName, orderId, deliveryNotes, estimatedDeliveryDate }) {
  const etaText = estimatedDeliveryDate
    ? new Date(estimatedDeliveryDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  return `Hi ${customerName},

Your order #${orderId.toString().slice(0, 8).toUpperCase()} has been shipped!
${etaText ? `\nEstimated arrival: ${etaText}` : ''}
${deliveryNotes ? `Note: ${deliveryNotes}` : ''}
Please confirm receipt in the app once your package arrives.

— Spill the Bill Team`;
}

// ── 6. Refund requested (admin triggered) ────────────────────────────────────
export function refundRequestedEmailHtml({ customerName, orderId, reason, frontendUrl }) {
  const body = `
    ${greeting(customerName)}
    ${orderBadge(orderId, '#d97706')}
    <p style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Refund Will Be Processed</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">
      We need to refund your payment for order <strong>#${orderId.toString().slice(0, 8).toUpperCase()}</strong>.
      Please provide your bank account or e-wallet details so we can transfer the funds back to you.
    </p>
    ${reason ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Reason</p>
          <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">${reason}</p>
        </td>
      </tr>
    </table>
    ` : ''}
    ${divider()}
    <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">
      Please open your order detail to fill in your bank account or e-wallet information.
    </p>
    ${frontendUrl ? `<a href="${frontendUrl}/orders/${orderId}" style="display:inline-block;padding:12px 28px;background:#d97706;color:#fff;border-radius:10px;font-weight:700;font-size:14px;text-decoration:none;">Fill In Refund Details</a>` : ''}
  `;
  return baseLayout('Refund Will Be Processed', body);
}

export function refundRequestedEmailText({ customerName, orderId, reason, frontendUrl }) {
  return `Hi ${customerName},

We need to refund your payment for order #${orderId.toString().slice(0, 8).toUpperCase()}.
${reason ? `\nReason: ${reason}` : ''}
Please open your order and fill in your bank account or e-wallet details so we can process the transfer.
${frontendUrl ? `\nLink: ${frontendUrl}/orders/${orderId}` : ''}

— Spill the Bill Team`;
}
