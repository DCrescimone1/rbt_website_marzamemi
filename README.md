This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

The application relies on several environment variables configured in `.env.local`:

- `VILLA_ZEFIRO_ICAL` – iCal URL for the **Villa Zefiro** availability calendar
- `VILLA_I2MARI_ICAL` – iCal URL for the **Villa i 2 Mari** availability calendar
- `VILLA_ZEFIRO_AIRBNB_URL` – Airbnb listing URL for **Villa Zefiro**
- `VILLA_I2MARI_AIRBNB_URL` – Airbnb listing URL for **Villa i 2 Mari**
- `BOOKING_BASE_URL` – Booking.com URL that contains prices for both villas

These variables are used by the calendar API and scraping layer to fetch availability and prices from external providers.

## Dual-Villa Booking System

The booking flow supports two separate properties:

- **Villa Zefiro**
- **Villa i 2 Mari**

Key behaviors:

- **Calendar logic** – a date is marked as unavailable only when **both** villas are booked for that date.
- **Price search** – the `/api/search-prices` endpoint fetches prices separately for each villa from Airbnb and Booking.com, plus a calculated direct booking price.
- **Booking cards** – the booking section renders two price comparison cards side by side, one per villa, each showing platform prices, a direct booking option, and an availability badge.

## Hero Section

The hero section is a split-screen, dual-villa album with the following behavior:

1. **Two full-height panels** – one for **Villa Zefiro**, one for **Villa i 2 Mari**, displayed side by side on desktop (stacked on mobile)
2. **Auto-cycling background images** – each panel cycles through its own set of villa images every 6 seconds, with a subtle Ken Burns-style zoom
3. **Hover interactions** – on hover, each panel reveals a thumbnail strip, previous/next arrows and a top-right image counter (e.g. `01 / 10`)
4. **Translated titles** – villa names are read from the translation system (`property.villaZefiro.name`, `property.villaI2Mari.name`)

### Components

- `HeroSection` – thin wrapper used by the page, now rendering the new dual album
- `HeroDualAlbum` – self-contained split-screen hero for the two villas

> Note: the previous GSAP-based `ZoomContainer` hero is still present in the codebase for reference but is no longer used on the page.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
