# 🥐 Warm Oven Bakery - E-commerce Platform

Aplikasi e-commerce full-stack untuk toko roti dengan sistem pre-order, built with Next.js 14, Supabase, dan Tailwind CSS.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui (customized)
- **State Management**: Zustand (persistent cart)
- **Backend & Database**: Supabase (PostgreSQL)
- **Payment Gateway**: Midtrans Snap (optional)
- **Styling**: Tailwind CSS v4 + Custom Theme

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
```

## 🗄️ Database Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy & paste content from `supabase/schema.sql`
   - Execute the SQL script

3. **Configure Environment Variables**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## 🏃 Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```plaintext
bakery/
├── src/
│   ├── app/
│   │   ├── (customer)/          # Customer-facing pages
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── products/         # Product catalog & detail
│   │   │   ├── cart/             # Shopping cart
│   │   │   └── checkout/         # Checkout flow
│   │   └── admin/                # Admin dashboard
│   ├── components/
│   │   ├── layout/               # Header, Footer
│   │   ├── product/              # Product components
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   └── utils.ts              # Utility functions
│   └── store/
│       └── useCartStore.ts       # Zustand cart store
├── supabase/
│   └── schema.sql                # Database schema
└── public/                       # Static assets
```

## 🎨 Features

- ✅ Product catalog with filtering & sorting
- ✅ Product detail with variant selection
- ✅ Persistent shopping cart (Zustand + localStorage)
- ✅ Multi-step checkout flow
- ✅ Pre-order system (H+2 minimum)
- ✅ WhatsApp integration for direct orders
- ✅ Admin dashboard (basic UI)
- ✅ Dark mode support
- ✅ Responsive design
- ⏳ Midtrans payment integration (placeholder ready)
- ⏳ Order management system
- ⏳ Customer reviews & ratings

## 🔐 Authentication & Security

- Supabase Auth for admin users
- Row Level Security (RLS) policies enabled
- Public read access for products
- Admin-only access for management features

## 📝 Database Schema

### Main Tables

- `categories` - Product categories
- `products` - Product information
- `product_images` - Product image gallery
- `product_variants` - Size/topping variants
- `customers` - Customer profiles
- `orders` - Order records
- `order_items` - Order line items
- `promos` - Discount codes
- `reviews` - Product reviews
- `admin_users` - Admin access control
- `settings` - App configuration

See `supabase/schema.sql` for complete schema with indexes and RLS policies.

## 🛒 Product Catalog Structure

1. **Kue Kering Ekonomis (250gr)**: 12 variants, flat price Rp25.000
2. **Kue Kering Premium**: Separate products (Rp60.000 - Rp80.000)
3. **Donat**: 2 package sizes (6pcs, 12pcs)
4. **Brownies**: Multiple topping variants with price adjustments
5. **Pizza**: 3 variants (size + topping combinations)

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

Make sure to set these in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` (optional)
- `MIDTRANS_SERVER_KEY` (optional)

## 📞 Support

For questions or issues, contact:

- Email: <hello@warmoven.id>
- WhatsApp: +62 812 3456 7890

## 📄 License

MIT License - feel free to use this for your own bakery business!

---

Built with ❤️ using Next.js 14 & Supabase
