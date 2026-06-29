# Auth Email Templates (token-filled, per-tenant)

One generic set of templates, branded per client at send time. Instead of pasting these into
Supabase's single template slot (which would be the same for every tenant), they're rendered by
a **`send-auth-email` Auth Hook** (edge function) that detects which site the email is for and
fills in that tenant's name, color, and logo. One file set → every client, zero per-client copies.

> Shared SFP project `ekuzbozvnouexksthlfa`. Branding comes from `sfp_tenants`
> (`display_name`, `primary_color`, `accent_color`, `logo_url`).

## Files (one per auth email type)
| File | Auth event | Special tokens |
|---|---|---|
| `confirm-signup.html` | signup confirmation | — |
| `reset-password.html` | password recovery | — |
| `change-email.html` | email change | `{{current_email}}`, `{{new_email}}` |
| `magic-link.html` | passwordless sign-in | — |
| `invite.html` | invited user | — |
| `reauthentication.html` | one-time code | `{{token}}` |

## Tokens the hook fills
| Token | Filled with | Fallback |
|---|---|---|
| `{{business_name}}` | tenant `display_name` | `ServiceFlowPro` |
| `{{primary_color}}` | tenant `primary_color` (hex) | `#2563eb` |
| `{{logo_block}}` | `<img src="logo_url">` **or** a styled text wordmark of `{{business_name}}` | text wordmark |
| `{{action_url}}` | the confirm/reset/etc. link Supabase provides for the event | — |
| `{{token}}` | the 6-digit code (reauthentication only) | — |
| `{{current_email}}` / `{{new_email}}` | change-email addresses | — |
| `{{site_url}}` | the tenant's site URL | project Site URL |

## How the hook knows which tenant (routing detection)
In order:
1. **Stamped at signup (primary):** the app passes its org into `signUp` →
   `options.data.organization_code = VITE_TENANT_SLUG`. The hook reads
   `user.user_metadata.organization_code`.
2. **Routing origin (fallback):** parse the event's `redirect_to` / Site URL **domain** and
   match it to a tenant (`sfp_tenants.embed_allowed_origins` / `branding_config`).
3. **Neither:** fall back to neutral ServiceFlowPro defaults — never breaks.

Then branding is loaded from `sfp_tenants` and substituted into the tokens.

## Status / what's left to turn it on
- ✅ Templates are token-filled and ready.
- ⏳ Build the **`send-auth-email`** edge function (detect org → load `sfp_tenants` branding →
  fill tokens → send via **Resend**) and enable it under Supabase → **Authentication → Hooks →
  Send Email**. Set `RESEND_API_KEY`.
- ⏳ Add `organization_code` to the app's `signUp` call (one line in `src/lib/auth.tsx`).

## Fallback (no hook)
If you ever want to skip the hook, you can paste any single file (with the tokens replaced by
literal Supabase Go-template vars like `{{ .ConfirmationURL }}`) into the dashboard template
slot — but then it's one fixed brand for all tenants. The hook is the per-tenant path.
