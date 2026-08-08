"use client";

import Link from "next/link";
import { useState } from "react";
import { saveAnalyticsConsent } from "../../lib/analytics/client";
import useAnalyticsConsent from "./useAnalyticsConsent";

export default function CookieConsent() {
  const choice = useAnalyticsConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const open = choice === "unset" || settingsOpen;

  function choose(value) {
    saveAnalyticsConsent(value);
    setSettingsOpen(false);
  }

  if (choice === "loading") return null;
  return (
    <>
      {open ? (
        <section className="analytics-consent" role="dialog" aria-label="Analytics cookie preferences">
          <div>
            <strong>Cookie preferences</strong>
            <p>
              Necessary storage keeps the site and your preference working. With your permission,
              analytics helps us understand page performance and improve inquiry journeys.
              <Link href="/privacy"> Privacy details</Link>
            </p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" onClick={() => choose("denied")}>Necessary only</button>
            <button className="primary" type="button" onClick={() => choose("granted")}>
              Accept analytics
            </button>
          </div>
        </section>
      ) : (
        <button className="analytics-settings" type="button" onClick={() => setSettingsOpen(true)}>
          Cookie settings
        </button>
      )}
    </>
  );
}
