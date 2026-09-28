This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Resuming client signup

After account creation, programme signup saves an account-linked draft in Supabase user metadata (`onboarding_draft`) and a browser copy scoped to the user ID. Intake edits sync after a short pause; Continue waits for a successful sync. Login restores the newer draft and routes to package selection, intake, or payment. Ask Alpha stores its selected offer for resuming checkout. No database migration is required.

Drafts do not create onboarding submissions, package selections, or payments, and never grant dashboard access. Submitted payments still go through the existing verification flow. Unsubmitted payment files must be selected again. If account sync fails, the form reports the error and retains the browser draft; only successfully synced changes are available on another device.

Run the isolated draft/auth regression checks with `node --test tests/onboarding-draft.test.cjs`. They do not write to Supabase.

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
