// templates.ts — one branded shell + per-type content for the send-auth-email hook.
// The repo's supabase/email-templates/*.html are the design reference; this consolidates
// them into a single shell so there's no 6-way duplication. Tokens are filled in index.ts.

export interface Branding {
  businessName: string;
  primaryColor: string;
  logoUrl: string | null;
  siteUrl: string;
}

/** Header block: tenant logo if present, else a styled text wordmark. */
export function logoBlock(b: Branding): string {
  return b.logoUrl
    ? `<img src="${b.logoUrl}" alt="${escapeHtml(b.businessName)}" style="height:28px;max-width:200px;display:block;" />`
    : `<div style="font-size:15px;font-weight:700;letter-spacing:-0.2px;color:#111827;">${escapeHtml(b.businessName)}</div>`;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

interface Content {
  subject: string;
  heading: string;
  body: string; // may contain {{business_name}}
  ctaLabel?: string; // link types only
  note: string;
  isCode?: boolean; // reauthentication
}

/** Keyed by Supabase email_action_type. */
export const CONTENT: Record<string, Content> = {
  signup: {
    subject: 'Confirm your email',
    heading: 'Confirm your email',
    body: 'Thanks for signing up with {{business_name}}. Please confirm this is your email address to finish setting up your account.',
    ctaLabel: 'Confirm email',
    note: "This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.",
  },
  recovery: {
    subject: 'Reset your password',
    heading: 'Reset your password',
    body: 'We received a request to reset your {{business_name}} password. Click below to choose a new one.',
    ctaLabel: 'Reset password',
    note: "This link expires in 24 hours. If you didn't request this, you can safely ignore this email — your password won't change.",
  },
  magiclink: {
    subject: 'Your sign-in link',
    heading: 'Your sign-in link',
    body: 'Click below to sign in to {{business_name}} securely — no password required.',
    ctaLabel: 'Sign in',
    note: "This link expires in 1 hour and can be used once. If you didn't request it, you can safely ignore this email.",
  },
  invite: {
    subject: "You've been invited",
    heading: "You've been invited",
    body: "You've been invited to create an account with {{business_name}}. Click below to accept and set up your access.",
    ctaLabel: 'Accept invitation',
    note: "This invitation expires in 24 hours. If you weren't expecting it, you can safely ignore this email.",
  },
  email_change: {
    subject: 'Confirm your new email',
    heading: 'Confirm your new email',
    body: 'Confirm the change to the email on your {{business_name}} account. If you didn’t request this, reset your password and contact support.',
    ctaLabel: 'Confirm change',
    note: 'This link expires in 24 hours.',
  },
  reauthentication: {
    subject: 'Your verification code',
    heading: 'Your verification code',
    body: "Enter this code to confirm it's you at {{business_name}}:",
    note: "This code expires in 1 hour. If you didn't request it, you can safely ignore this email.",
    isCode: true,
  },
};

const FONT = `-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

/** Render the full HTML email. `actionUrlOrCode` is the verify URL (link types) or the OTP code. */
export function render(b: Branding, type: string, actionUrlOrCode: string): { subject: string; html: string } {
  const c = CONTENT[type] ?? CONTENT.signup;
  const body = c.body.replace(/\{\{business_name\}\}/g, escapeHtml(b.businessName));

  const ctaBlock = c.isCode
    ? `<div style="margin:0 0 24px 0;padding:16px 0;text-align:center;background:#f4f6fb;border:1px solid #e3e8f0;border-radius:10px;font-family:${FONT};font-size:30px;font-weight:700;letter-spacing:8px;color:#111827;">${escapeHtml(actionUrlOrCode)}</div>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;"><tr>
         <td align="center" style="border-radius:8px;background:${b.primaryColor};">
           <a href="${actionUrlOrCode}" target="_blank" style="display:inline-block;padding:13px 30px;font-family:${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${c.ctaLabel}</a>
         </td></tr></table>
       <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#6b7280;font-family:${FONT};">Or paste this link into your browser:</p>
       <p style="margin:0 0 24px 0;font-size:13px;line-height:1.5;word-break:break-all;font-family:${FONT};"><a href="${actionUrlOrCode}" target="_blank" style="color:${b.primaryColor};text-decoration:underline;">${actionUrlOrCode}</a></p>`;

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="color-scheme" content="light only"/>
<title>${escapeHtml(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f5f7;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;"><tr>
<td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:465px;background:#ffffff;border:1px solid #e6e8eb;border-radius:12px;">
<tr><td style="padding:32px 32px 8px 32px;font-family:${FONT};">${logoBlock(b)}</td></tr>
<tr><td style="padding:8px 32px 0 32px;font-family:${FONT};">
<h1 style="margin:0 0 12px 0;font-size:21px;line-height:1.3;color:#111827;font-weight:700;">${escapeHtml(c.heading)}</h1>
<p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#374151;">${body}</p>
${ctaBlock}
<p style="margin:0 0 28px 0;font-size:13px;line-height:1.6;color:#6b7280;">${escapeHtml(c.note)}</p>
</td></tr>
<tr><td style="padding:20px 32px 28px 32px;border-top:1px solid #eef0f2;font-family:${FONT};">
<p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">Sent by <a href="${b.siteUrl}" style="color:#9ca3af;text-decoration:underline;">${escapeHtml(b.businessName)}</a></p>
</td></tr></table></td></tr></table></body></html>`;

  return { subject: c.subject, html };
}
