export function otpEmailHtml(code) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code - Spill the Bill</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#9b1c1c;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">Spill the Bill</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;">Verification Code</p>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
                Use the code below to continue. The code is valid for 10 minutes.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;">Your code</p>
                    <p style="margin:0;font-size:40px;font-weight:800;color:#9b1c1c;letter-spacing:0.15em;">${code}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
                If you did not request this, please ignore this email. Do not share this code with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 40px;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:12px;color:#d1d5db;">Spill the Bill Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function otpEmailText(code) {
  return `Spill the Bill - Verification Code

Your verification code is: ${code}

This code is valid for 10 minutes.

If you did not request this, please ignore this email. Do not share this code with anyone.

— Spill the Bill Team`;
}
