This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Hero Section Animation

The hero section features a GSAP-powered perspective zoom effect with the following elements:

1. **12 Images** - Distributed across 3 depth layers, zoom toward viewer as you scroll
2. **Title** - "La Tua Sicilia Autentica" - zooms from far (z:-2000, opacity:0.1) to close (z:50, opacity:1)
3. **Subtitle** - "La Sicilia autentica a due passi dal mare" - inverse animation, starts visible (opacity:1) and fades out (opacity:0) as it zooms
4. **Book Now Button** - Fades in at 85% animation completion
5. **Scroll unlock** - After animation completes, title remains at max size, subtitle fully faded, normal page scroll begins

### Animation Timeline

- **Scroll 0-100%**: All elements zoom together
- **Scroll 85%**: Button fades in
- **Scroll 100%**: Title visible, subtitle gone, scroll unlocks

### Components

- `HeroSection` - Main container with ScrollSmoother integration
- `ZoomContainer` - Manages 12 images across 3 depth layers
- `HeadingSection` - Animated title, subtitle, and button

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
