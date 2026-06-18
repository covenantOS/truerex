# True Plumbers &amp; AC — Email Templates

Standalone, copy-paste-ready HTML emails built for the True Plumbers &amp; AC
brand (gold `#FFD700` + black, condensed Oswald-style headlines). Designed to
match the print flyer aesthetic while staying compatible with real email
clients.

## Templates

### `true-plumbers-water-heater.html`
Outreach to the **existing customer list** — the "This Kills Water Heaters
Fast" hard-water / pre-summer flush campaign. Warmed for current customers
("you're already part of the True family") with a soft flush-and-inspection
offer and a tap-to-call CTA.

## Email-client compatibility

- Table-based layout with inline styles (Gmail, Outlook, Apple Mail, mobile).
- VML fallback so the call-to-action button renders solid in Outlook.
- Hidden preheader text controls the inbox preview line.
- Responsive: panels stack and the button goes full-width under ~620px.
- Dark-on-dark by design (matches the flyer); `color-scheme` meta included.

> Emoji are used for the icons/comparison so the email looks complete with no
> external image hosting. To match the flyer's real photos, replace the emoji
> in the "VS" block and feature rows with hosted `<img>` tags (use absolute
> https URLs + descriptive `alt` text).

## Merge tags

The template uses `{{tag|fallback}}` style placeholders. Swap these for your
ESP's syntax (Resend/Blooio/Mailchimp/etc.) before sending:

| Placeholder | Purpose | Example |
|---|---|---|
| `{{first_name\|there}}` | Recipient first name, falls back to "there" | `Hey Sarah,` |
| `{{promo\|$25 off your flush}}` | Returning-customer offer line | edit or remove |
| `{{company_address\|...}}` | Physical mailing address (CAN-SPAM) | required by law |
| `{{{unsubscribe}}}` | Unsubscribe link | required by law |

**Before sending to a list:** set a real physical mailing address and a
working unsubscribe link — both are legally required (CAN-SPAM) for commercial
email to an existing list.

## Sending

Drop the HTML into your sending platform (this project already integrates
[Resend](../src/lib/integrations/resend.ts)). Pair it with the subject line:

> **Pop. Crackle. Pop. — that's your water heater dying.**

and a plain-text fallback for best deliverability.
