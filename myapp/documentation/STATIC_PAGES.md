# Static Pages Overview

## Pages
- TopRowbanner.html: Home and product discovery layout.
- BuyOnCredit.html: Credit application flow with modal form.
- Cart.html: Shopping cart, order summary, and checkout modal.
- HelpCentre.html: FAQ, search, and support message modal.
- Requestforquotes.html: RFQ form and upload panel.
- TrackOrder.html: Order tracking view.
- WriteReview.html: Product review form.
- grievance.html: Write-to-management form.

## Shared assets
- base.css: Shared typography, color tokens, layout helpers, focus styles, toast styles.
- ui-notify.js: Toast notification helper used by multiple pages.

## Notable behavior
- TopRowbanner.js: Category selection, search suggestions, hero carousel, featured carousel.
- BuyOnCredit.js: Modal flow, validation, reference ID generation, EMI estimate.
- Cart.js: Mock cart items, promo codes, checkout modal, and success modal.
- HelpCentre.js: FAQ toggle, category scroll, search, support message modal.
- javascript.js: RFQ tab switching, dynamic row add, validation and status messages.
- TrackOrder.js: Deterministic mock tracking data based on order ID and contact.
- WriteReview.js: Rating selection, form validation, status messages.
- grievance.js: Basic validation and success status.

## Gaps to finish
- Customer authentication and account pages are not implemented.
- Payment gateway integration and webhooks are not implemented.
- Requestforquotes.js is empty; logic currently lives in javascript.js.

## Recommended completion steps
1) Build a backend API and connect pages to it.
2) Replace mock data in Cart.js and TrackOrder.js with API responses.
3) Implement file upload endpoints and wire to RFQ and grievance flows.
4) Add authentication and user accounts for saved orders and addresses.
5) Standardize shared layout (header/footer) for consistent navigation.
