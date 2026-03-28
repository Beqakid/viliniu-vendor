# Viliniu Vendor Dashboard

Next.js 14 vendor dashboard for the Viliniu multi-merchant marketplace.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Backend**: Payload CMS v3 (REST API)
- **Auth**: Payload JWT (httpOnly cookies)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Deploy**: Cloudflare Pages

## Setup

1. Clone this repository
2. Copy `.env.local.example` to `.env.local`
3. Set `NEXT_PUBLIC_PAYLOAD_URL` to your Payload CMS URL
4. Install dependencies: `npm install`
5. Run dev server: `npm run dev`

## Features
- Vendor login/register
- Store setup & management
- Product CRUD (add, edit, list)
- Order management with status updates
- Real-time dashboard stats

## Deploy to Cloudflare Pages
1. Connect this repo to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `.next`
4. Add environment variable: `NEXT_PUBLIC_PAYLOAD_URL`
