# Digital Heroes Golf - Charity Subscription & Draw Engine

A full-stack, secure web application built to manage monthly charity golf subscriptions, log player performance, and execute an automated, algorithmic prize draw system.

This platform seamlessly integrates payment processing with a custom database architecture to enforce a 10% minimum charity contribution while distributing fractional prize pools to monthly winners based on their golf scores.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Secure routing and database-level Row Level Security (RLS) separating standard Users from platform Administrators.
- **Financial Engine (Stripe):** End-to-end subscription flow utilizing Stripe Checkout and secure backend Webhooks to automatically update database user tiers.
- **Custom Draw Engine:** An Admin-only calculation engine capable of running "Draft" simulations (Random or Score-Weighted Algorithmic) before officially publishing monthly winning numbers.
- **Automated Prize Distribution:** A backend Next.js API route that automatically cross-references active subscriber scores against published winning numbers, calculating precise 3-match, 4-match, and 5-match fractional payouts.
- **Winner Verification Workflow:** Integrated AWS-style S3 cloud storage (Supabase) allowing users to securely upload scorecards, paired with an Admin queue for visual verification and payout approval.
- **Charity Impact Directory:** A dynamic interface showcasing featured and searchable charitable organizations supported by the platform's revenue.

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
- **Backend:** Next.js Route Handlers (API)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth, Supabase Storage)
- **Payments:** Stripe (Checkout Sessions & Webhooks)
- **Language:** TypeScript

## ⚙️ Environment Variables

To run this project locally, create a `.env.local` file in the root directory and add the following keys:

```env
# Next.js Public URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Keys (Find in Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Keys (Find in Stripe Developer Dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

💻 Local Installation & Setup
Clone the repository:

Bash
git clone [https://github.com/your-username/digital-heroes-golf.git](https://github.com/your-username/digital-heroes-golf.git)
cd digital-heroes-golf
Install dependencies:

Bash
npm install
Start the Stripe CLI (in a separate terminal) to forward webhooks:

Bash
stripe listen --forward-to localhost:3000/api/webhook
(Note: Copy the webhook signing secret output by this command into your .env.local file).

Run the development server:

Bash
npm run dev
Open http://localhost:3000 with your browser to see the result.

🧪 Testing the Platform
To fully test the Draw Engine and Verification loops without needing to create a new user and pass a test credit card through Stripe, use the pre-configured Administrator account.

Admin Portal: Navigate to /admin to access the Draw Engine and Verification Queue.

User Dashboard: Navigate to /dashboard to view recent scores, charities, and the winnings portal.

Developed by Prince.
