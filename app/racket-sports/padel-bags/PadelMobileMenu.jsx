"use client";

export default function PadelMobileMenu({ className, children }) {
  function closeForNavigation(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!event.target.closest("a[href]")) return;

    // Close before Link handles the anchor, so the RFQ is not behind the drawer.
    event.currentTarget.open = false;
  }

  return (
    <details className={className} onClickCapture={closeForNavigation}>
      {children}
    </details>
  );
}
