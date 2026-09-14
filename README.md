# Market My Arl Dashboard

A comprehensive, modern Next.js admin dashboard template designed for e-commerce platforms. The Market My Arl Dashboard provides a robust set of tools and interfaces to manage products, sellers, customers, orders, marketing campaigns, and extensive reporting.

## 🌟 Key Features

The dashboard includes a wide array of pre-built modules for complete e-commerce management:

- **E-commerce Core**: Manage Products, Categories, Inventory, Orders, Transactions, and Refunds.
- **User Management**: Dedicated interfaces for Admins, Sellers, and Customers.
- **Marketing & Promotions**: Tools for Coupons, Flash Sales, Featured Deals, Promo Popups, Abandoned Carts, and Clearance.
- **Analytics & Reporting**: Interactive Dashboard metrics, detailed Financial Reports, and Top Products tracking.
- **Site Controls**: Manage Home Page layout, FAQs, Privacy Policies, Terms & Conditions, and general site settings.
- **Communication**: Built-in Inbox and Support messaging interfaces.

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI & Components**:
  - [@headlessui/react](https://headlessui.com/) for accessible unstyled components
  - [Huge Icons](https://hugeicons.com/) for beautiful and extensive iconography
  - [ApexCharts](https://apexcharts.com/) & [react-apexcharts](https://apexcharts.com/docs/react-charts/) for interactive data visualizations
  - [react-day-picker](https://react-day-picker.js.org/) & [date-fns](https://date-fns.org/) for date selection and formatting
  - [Sonner](https://sonner.emilkowal.ski/) for toast notifications

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or newer recommended) installed on your machine.

### Installation

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

### Development Server

Start the local development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard. The application will automatically update as you modify the source files.

## 🛠️ Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components organized by feature (e.g., `dashboard/`, `products/`, `orders/`, `seller/`, `ui/`, etc.).
- `public/`: Static assets like images and fonts.
- `icons/`: Custom SVG icons used throughout the system.

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

After the build completes, you can start the production server:

```bash
npm run start
```

## 🌐 Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new). Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
