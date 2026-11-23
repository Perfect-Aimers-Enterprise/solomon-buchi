# Solomon Buchi — Official Website

Next.js 15 (App Router) · TypeScript · Tailwind CSS · MongoDB/Mongoose · Nodemailer · Paystack + Stripe · WhatsApp Business Cloud API.

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in what you need
npm run dev                    # http://localhost:3000
```

Minimum to see the site: nothing. Minimum to accept enquiries: `MONGODB_URI`.

## The one file you edit: `src/config/site.config.ts`

| Section | Controls |
| --- | --- |
| `brand` | Name, tagline, description, email, phone, website, social links |
| `person` | Solomon Buchi's name, title, short bio, **full biography**, philosophy, portrait path, values, achievements, milestones, **Facebook followers + profile URL** |
| `locations` | Nigeria + UK by default (flags, city, address, phone) |
| `services` | Switch whole service lines on/off (nav, pages and forms follow) |
| `externalLinks` | Redirect a service to an external page. `ebooks` → `https://selfany.com/becomearticulate` |
| `notifications` | Email / WhatsApp on-off, recipient, number, channel preference |
| `payments` | On/off, provider (`paystack` \| `stripe`), currency, payment-method labels |
| `booking` | Purchase-code prefix (`GKA`), approval flag |
| `content` | Service copy, publications, **events + ticket tiers + prices**, testimonials |

Nothing is invented: empty bio/philosophy/achievements/milestones/testimonials simply don't render (the bio and philosophy fall back to neutral wording built only from the facts supplied).

**Portrait:** drop the photo at `public/images/solomon-buchi.jpg`. Until then an elegant monogram panel shows.

**Facebook link:** set `person.socialProof.facebookProfile`.

## Notification rules (`src/lib/notifications/notification.service.ts`)

A channel is *active* only if it is enabled in the config **and** its env vars exist.

- WhatsApp active (alone or with email) → WhatsApp is used (priority). If it fails and email is active, email is the fallback.
- Only email active → Nodemailer to `notifications.email.recipient` (or `NOTIFICATION_EMAIL`).
- Neither → stored in MongoDB only; the visitor sees "received and recorded".
- Verified purchases always email the administrator when SMTP is configured, plus WhatsApp if active. The customer gets a confirmation email when SMTP is configured.

WhatsApp note: Meta only allows free-form text inside the 24-hour customer window. For reliable alerts create an approved template with **one** body variable and set `WHATSAPP_TEMPLATE_NAME`.

## Payments

Set `payments.enabled: true` and the provider's keys. Prices come only from `site.config.ts`; the browser sends an item id and a quantity, never an amount.

1. `POST /api/payments/initialize` creates a **pending** purchase (unique unguessable reference) and returns the provider's checkout URL.
2. **Paystack:** the callback page and the webhook both verify with Paystack's API server-side. Webhook URL: `{SITE_URL}/api/webhooks/paystack` (HMAC-SHA512 signature checked).
3. **Stripe:** Checkout Session; fulfilment happens only from the signed webhook `{SITE_URL}/api/webhooks/stripe` (events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`).
4. `fulfilPurchase` checks amount + currency against what was stored, then flips pending → paid in **one atomic update**; only the winner issues the `GKA-YYYY-XXXXXX` code, creates tickets and sends emails. Duplicate webhooks/page loads are no-ops. Unique indexes on purchase code, reference, and (provider, provider transaction id).

## Admin (`/admin`)

Set `ADMIN_PASSWORD` and a 32+ char `ADMIN_SESSION_SECRET`. Signed httpOnly cookie, 8-hour session, login rate-limited, pages `noindex`.

- `/admin` — service requests and contact enquiries
- `/admin/purchases` — search by purchase code, customer email or reference; see transaction details; mark each ticket as used (atomic, cannot be redeemed twice)

## Notes & limits

- **Rate limiting is in-memory** (per server instance). On serverless or multi-instance hosting, swap `src/lib/utils/rate-limit.ts` for a shared store such as Redis/Upstash — same function signature.
- Events live in `site.config.ts` (they hide themselves once the date passes); tickets, purchases and transactions are in MongoDB. There is no Event collection or capacity limit — add one if you need sell-out control.
- There is no newsletter backend, so the homepage ends with an enquiry invitation instead of a fake sign-up form.
- Fonts (Cormorant Garamond, Inter, Playfair Display) load via `next/font/google` at build time.
