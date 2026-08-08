# Cappuccino Bag analytics setup

This guide covers the production website at `https://www.cappuccinobag.com`.
The code is safe to deploy without analytics IDs: no GA4 or Clarity script is
loaded when its public ID is empty. Analytics also remains off in local and
Vercel Preview environments.

## 1. Environment variables

Set these in Vercel under Project → Settings → Environment Variables. Add the
analytics variables to **Production** only unless a separate test property is
used for Preview.

```dotenv
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
NEXT_PUBLIC_SITE_NAME=Cappuccino Bag
NEXT_PUBLIC_SITE_DOMAIN=cappuccinobag.com
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

Do not place a GA4 property number or Google service-account private key in a
`NEXT_PUBLIC_` variable. `NEXT_PUBLIC_GA_MEASUREMENT_ID` is the public web data
stream ID such as `G-XXXXXXXXXX`, not the numeric GA4 property ID used by the
server-side CRM dashboard.

After changing an environment variable, redeploy the latest `main` deployment
from Vercel. A build made before the change will not contain the updated public
value.

## 2. Create the GA4 property and web stream

1. In Google Analytics Admin, create a property for Cappuccino Bag with the
   reporting time zone and currency used by the business.
2. Under Data collection and modification → Data streams, create a Web stream.
3. Use `https://www.cappuccinobag.com` as the website URL.
4. Copy the Measurement ID that begins with `G-` into
   `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
5. Keep Enhanced Measurement enabled. Under page views, keep “Page changes
   based on browser history events” enabled. The Next.js integration relies on
   this for App Router navigation and deliberately does not send a second
   manual page view.
6. In Admin → Data display → Events/Key events, mark these events as key events:
   `generate_lead`, `rfq_submit`, `contact_submit`, and
   `product_inquiry_submit`. Mark `sample_request_submit` as a key event if
   sample requests are a sales KPI.

Events are sent only after Analytics consent:

- `generate_lead`
- `form_start`
- `rfq_submit`
- `contact_submit`
- `product_inquiry_submit`
- `sample_request_submit`
- `whatsapp_click`
- `email_click`
- `phone_click`
- `catalog_download`
- `product_view`
- `category_view`
- `cta_click`
- `video_start`
- `video_complete`

The browser event allowlist excludes names, email addresses, phone and WhatsApp
numbers, addresses, message text, customer project names, quotation values and
other form content. `product_name` is allowed only for a public catalogue name.

## 3. Create Microsoft Clarity

1. Create a Clarity project for `https://www.cappuccinobag.com`.
2. Copy the public Project ID into `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
3. Redeploy Production.
4. In Clarity Settings, leave sensitive text masking enabled.
5. Submit a test inquiry with non-real test data, open the recording and verify
   that the entire form is masked. The site adds `data-clarity-mask="true"` to
   every form, including forms rendered from the static-site content.

Clarity is loaded after consent and after the page becomes interactive. Empty
or invalid IDs do not load a script.

## 4. Enable Vercel Web Analytics and Speed Insights

1. In the Vercel project, open the Analytics tab and enable Web Analytics.
2. Open Speed Insights and enable it for the project.
3. Redeploy Production.

The packages are included in the root layout but render only on a production
deployment after Analytics consent. Their `beforeSend` hooks remove sensitive
query fields and omit campaign query strings from the URL sent to Vercel.
GA4 remains the primary source for conversion events, so a Vercel plan without
custom events does not affect inquiry tracking or the build.

## 5. Test analytics

Use a production deployment or a separate test property. Preview deployments
are intentionally noindex and analytics-disabled.

1. Clear the `cappuccino_analytics_consent` local-storage value.
2. Reload the page and choose **Necessary only**. Confirm that requests to
   Google Analytics and Clarity do not appear.
3. Reopen **Cookie settings**, choose **Accept analytics**, and confirm each
   analytics script loads once.
4. In GA4 Realtime, open the homepage, a category, a product, Contact and RFQ.
5. Submit a valid test RFQ. Confirm `generate_lead` and `rfq_submit` appear only
   after the server returns a successful inquiry number.
6. Submit an invalid form and simulate a failed network request. Confirm no
   success event appears.
7. Use Google Tag Assistant and GA4 DebugView for event-level testing. Enable
   debug mode with browser tooling or a dedicated test stream; do not add a
   production debug flag to the repository.
8. Inspect the network payloads and confirm no form PII is present.
9. In Clarity, verify inquiry, contact and CRM forms are masked.

## 6. UTM attribution

The site stores the first touch for 90 days and the current visit separately.
The inquiry API writes both sets to Supabase only after a successful form
submission. Sensitive query keys such as `email`, `phone`, `name`, `company`
and `message` are removed before a URL is stored or sent to analytics.

Examples:

```text
https://www.cappuccinobag.com/padel?utm_source=linkedin&utm_medium=social&utm_campaign=padel_oem_2026
https://www.cappuccinobag.com/rfq?utm_source=email&utm_medium=outreach&utm_campaign=uk_padel_buyers
```

Apply the additive migration after the existing CRM migrations:

```text
supabase/migrations/20260731_lead_attribution.sql
```

The existing first-touch columns remain unchanged. Current-visit columns are
also shown in the inquiry detail view, inquiry email and CSV export.

## 7. Search Console setup

1. Open Google Search Console and add a **Domain property** for
   `cappuccinobag.com`.
2. Copy the TXT verification value supplied by Google.
3. Add it as a DNS TXT record at the domain DNS provider. Do not remove existing
   email, SPF, DKIM or other TXT records.
4. Wait for DNS propagation, then select Verify in Search Console.
5. Submit `https://www.cappuccinobag.com/sitemap.xml`.
6. Review Pages for indexing and canonical issues, Performance for queries,
   countries and landing pages, and Core Web Vitals for real-user performance.
7. Connect Search Console to the matching GA4 property from the GA4 product
   links settings.

The production site canonicalizes to `www`. Preview responses carry
`X-Robots-Tag: noindex, nofollow, noarchive`; Preview `robots.txt` also
disallows crawling.

## 8. Reports and traffic filters

In GA4 Admin:

1. Define internal traffic using the company network in the GA4 interface. Do
   not commit office IP addresses to code.
2. Create and test an Internal Traffic data filter before activating it.
3. Use Developer Traffic for DebugView sessions and a separate test stream or
   property for sustained QA.
4. Configure unwanted referrals for payment, form or service domains only when
   they incorrectly start new sessions.
5. Configure cross-domain measurement only if a future trusted subdomain or
   second domain needs to share the same user journey.

Useful reports:

- User acquisition: first source/medium and campaign.
- Traffic acquisition: current session source/medium.
- Landing page and Pages and screens: page engagement.
- Key events: `generate_lead` split by form type, country, category and campaign.
- Explore: funnel from category/product view → form start → successful inquiry.

## 9. Consent and operating notes

Necessary storage is always available. Analytics is blocked until the visitor
accepts it, and declining analytics never blocks content or forms. Visitors can
change the choice through the persistent **Cookie settings** button.

The privacy page describes the tools and masking approach without making a
legal certification claim. Reassess the notice and consent design with
qualified counsel when processing, targeting or regional scope changes.
