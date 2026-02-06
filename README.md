# 🥖 Bakery Umi - E-commerce Platform

> Aplikasi e-commerce full-stack untuk toko roti homemade dengan sistem pre-order, built with Next.js 14, Supabase, dan Tailwind CSS.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com/)

## ✨ Features

### Customer Features

- 🛍️ **Product Catalog** - Tampilan grid dengan filter kategori, harga, dan sorting
- 🔍 **Product Search** - Pencarian produk berdasarkan nama
- 🖼️ **Product Gallery** - Multiple images per product dengan zoom
- 🎨 **Variant Selection** - Pilih varian (ukuran, rasa, topping) dengan update harga real-time
- 🛒 **Persistent Cart** - Keranjang belanja tersimpan di localStorage
- 📱 **WhatsApp Integration** - Order langsung via WhatsApp
- 💳 **Multi-Payment Options** - Transfer bank, e-wallet, QRIS (via Midtrans)
- 📅 **Pre-Order System** - Minimal H+2 untuk kesegaran produk
- 🎁 **Promo Codes** - Sistem diskon dengan validasi otomatis
- ⭐ **Product Reviews** - Rating dan review dari customer
- 📱 **Responsive Design** - Mobile-first, optimized untuk semua device
- 🌙 **Dark Mode** - Theme gelap untuk kenyamanan mata

### Admin Features

- 📊 **Dashboard Analytics** - Overview penjualan dan statistik
- 📦 **Product Management** - CRUD produk dengan image upload
- 🏷️ **Category Management** - Kelola kategori produk
- 📋 **Order Management** - Track dan update status pesanan
- 💰 **Promo Management** - Buat dan kelola kode promo
- 💬 **Review Moderation** - Approve/reject customer reviews
- ⚙️ **Settings** - Konfigurasi toko (kontak, shipping fee, dll)

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript |
| **UI Components** | shadcn/ui (customized) |
| **Styling** | Tailwind CSS v4 + Custom Theme |
| **State Management** | Zustand (cart, UI states) |
| **Backend & Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (@supabase/ssr) |
| **Storage** | Supabase Storage (product images) |
| **Payment Gateway** | Midtrans Snap |
| **Deployment** | Vercel |

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18.17 or later
- npm or yarn
- Supabase account ([create free account](https://supabase.com))
- Midtrans account (optional, untuk payment gateway)

## 🔧 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/bakery-umi.git
cd bakery-umi
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Variables

Create `.env.local` file in root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Midtrans (Optional - untuk payment gateway)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key

# App URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Database Setup

#### Option A: Using Supabase Dashboard

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Create new project atau pilih existing project
3. Go to **SQL Editor**
4. Copy seluruh content dari `supabase/schema.sql`
5. Paste dan execute

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

### 5. Seed Database (Optional)

Untuk populate database dengan sample data:

```bash
# Run seed script
npm run seed
```

Atau manual insert via Supabase Dashboard → Table Editor.

### 6. Storage Setup

1. Go to **Storage** di Supabase Dashboard
2. Create bucket `product-images` dengan settings:
   - Public bucket: **Yes**
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
   - Max file size: `5MB`

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📁 Project Structure

```plaintext
bakery-umi/
├── src/
│   ├── app/
│   │   ├── (customer)/              # Customer-facing routes
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx         # Product catalog
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx     # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx         # Shopping cart
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx         # Checkout flow
│   │   │   └── order/
│   │   │       ├── success/page.tsx # Order success
│   │   │       └── [id]/page.tsx    # Order tracking
│   │   │
│   │   ├── admin/                   # Admin dashboard
│   │   │   ├── layout.tsx           # Admin layout + auth
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── promos/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── api/                     # API routes
│   │   │   ├── products/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── payment/
│   │   │   │   └── webhook/route.ts
│   │   │   └── promos/
│   │   │       └── validate/route.ts
│   │   │
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   └── QuantitySelector.tsx
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentMethodSelector.tsx
│   │   │   └── OrderSummary.tsx
│   │   └── ui/                      # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── utils.ts                 # Utility functions
│   │   ├── whatsapp.ts              # WhatsApp helpers
│   │   └── validations.ts           # Zod schemas
│   │
│   ├── store/
│   │   ├── useCartStore.ts          # Cart state (Zustand)
│   │   └── useUIStore.ts            # UI state (modals, etc)
│   │
│   └── types/
│       ├── product.ts               # Product types
│       ├── order.ts                 # Order types
│       └── cart.ts                  # Cart types
│
├── supabase/
│   ├── schema.sql                   # Database schema
│   ├── seed.sql                     # Sample data
│   └── migrations/                  # Migration files
│
├── public/
│   ├── images/                      # Static images
│   └── icons/                       # App icons
│
├── .env.local.example               # Environment template
├── tailwind.config.ts               # Tailwind configuration
├── next.config.js                   # Next.js configuration
└── package.json
```

## 🗄️ Database Schema Overview

### Core Tables

| Table | Description |
| :--- | :--- |
| `categories` | Product categories (Kue Kering, Brownies, dll) |
| `products` | Product master data |
| `product_images` | Image gallery untuk setiap produk |
| `product_variants` | Varian produk (ukuran, rasa, topping) |
| `customers` | Customer profiles |
| `orders` | Order transactions |
| `order_items` | Order line items (detail produk per order) |
| `promos` | Discount codes & campaigns |
| `reviews` | Product reviews & ratings |
| `admin_users` | Admin access control |
| `settings` | App configuration (key-value) |

**See `supabase/schema.sql` for complete schema with relationships, indexes, and RLS policies.**

### Row Level Security (RLS)

All tables protected with RLS policies:

- ✅ Public read access for products (where `is_available = true`)
- ✅ Authenticated admin-only write access
- ✅ Customers can only view their own orders
- ✅ Anonymous users can create orders (checkout as guest)

## 🛍️ Product Catalog Structure

Sample product organization:

### 1. Kue Kering Lebaran - Ekonomis (250gr)

- **Type:** Single product with 12 variants
- **Price:** Rp25.000 (flat untuk semua varian)
- **Variants:** Putri Salju, Nastar, Kastengel, Kue Sagu, dll
- **Shipping:** Dalam & Luar Kota

### 2. Kue Kering Premium

- **Type:** Separate products
- **Price Range:** Rp60.000 - Rp80.000
- **Products:** Nastar Premium, Kastengel Premium, dll
- **Shipping:** Dalam & Luar Kota

### 3. Brownies

- **Type:** Single product with 4 topping variants
- **Base Price:** Rp70.000
- **Variants:** Full Almond, Choco Chip, Full Keju, Mix (+Rp10.000)
- **Shipping:** Dalam & Luar Kota

### 4. Donat

- **Type:** 2 separate products (different package sizes)
- **Variants:**
  - Donat Original (6pcs) - Rp20.000
  - Donat Aneka Topping (12pcs) - Rp35.000
- **Shipping:** Dalam Kota Only

### 5. Pizza

- **Type:** Single product with 3 variants
- **Price Range:** Rp22.000 - Rp50.000
- **Variants:** Mozzarella, Smoke Beef + Mozza, Mozza + Sosis
- **Shipping:** Dalam Kota Only

## 🔌 API Endpoints

### Public Endpoints

```plaintext
GET    /api/products              # Get all products (with filters)
GET    /api/products/:id          # Get single product
GET    /api/categories            # Get all categories
POST   /api/orders                # Create new order
POST   /api/promos/validate       # Validate promo code
```

### Admin Endpoints (Authenticated)

```plaintext
POST   /api/products              # Create product
PATCH  /api/products/:id          # Update product
DELETE /api/products/:id          # Delete product
GET    /api/orders                # Get all orders
PATCH  /api/orders/:id            # Update order status
POST   /api/promos                # Create promo
```

### Webhooks

```plaintext
POST   /api/payment/webhook       # Midtrans payment notification
```

## 💳 Payment Integration (Midtrans)

### Setup Midtrans

1. Create account di [Midtrans](https://midtrans.com)
2. Get Client Key & Server Key dari dashboard
3. Add to `.env.local`
4. Configure webhook URL: `https://yourdomain.com/api/payment/webhook`

### Payment Flow

1. Customer complete checkout form
2. Frontend request Snap token dari API
3. API call Midtrans to generate token
4. Display Midtrans Snap popup
5. Customer complete payment
6. Midtrans send webhook notification
7. Update order status to "paid"

### Supported Payment Methods

- 💳 Credit/Debit Card
- 🏦 Bank Transfer (BCA, Mandiri, BNI, dll)
- 📱 E-Wallet (GoPay, OVO, DANA, ShopeePay)
- 🔳 QRIS
- 🏪 Convenience Store (Alfamart, Indomaret)

## 📱 WhatsApp Integration

### Direct Order Feature

Customers dapat order langsung via WhatsApp with:

- Pre-filled message berisi detail produk
- Auto-format untuk kemudahan
- Link langsung ke chat WhatsApp Business

**Function:** `generateWhatsAppOrderLink(product, variant, quantity)`

**Location:** `src/lib/whatsapp.ts`

### Admin Notification

Ketika ada order baru, admin dapat terima notifikasi via WhatsApp (manual trigger atau integrate dengan WhatsApp Business API).

## 🎨 Theming & Customization

### Tailwind Config

Edit `tailwind.config.ts` untuk customize colors:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#fef5ee',
        100: '#fde9d7',
        // ... Warm orange tones
      },
      cream: {
        50: '#fafaf9',
        100: '#f5f5f4',
        // ... Cream tones
      }
    }
  }
}
```

### shadcn/ui Customization

Components di `src/components/ui/` dapat di-customize sesuai brand:

- Button variants (primary, secondary, outline)
- Color schemes
- Border radius
- Font sizes

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Coverage

- ✅ Cart functionality
- ✅ Checkout flow
- ✅ Product filtering
- ✅ Promo validation
- ⏳ Payment integration (coming soon)
- ⏳ Admin CRUD operations (coming soon)

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

1. **Connect to Vercel**

- Go to [vercel.com](https://vercel.com)
- Import GitHub repository
- Configure environment variables
- Deploy!

1. **Set Environment Variables di Vercel**
Go to Project Settings → Environment Variables:

```plaintext
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
MIDTRANS_SERVER_KEY
NEXT_PUBLIC_BASE_URL
```

1. **Configure Midtrans Webhook**
Update webhook URL di Midtrans Dashboard:

```plaintext
https://yourdomain.vercel.app/api/payment/webhook
```

### Alternative Deployment Options

- **Netlify:** Similar workflow dengan Vercel
- **Railway:** Good for full-stack apps
- **AWS Amplify:** Enterprise-grade hosting
- **Self-hosted:** VPS dengan PM2 + Nginx

## 📊 Performance Optimizations

- ✅ Next.js Image Optimization (automatic WebP conversion)
- ✅ Code splitting (route-based)
- ✅ React Query caching
- ✅ Lazy loading components
- ✅ Database indexes on frequently queried columns
- ✅ Supabase connection pooling
- ✅ Static generation untuk product pages (ISR)

**Lighthouse Score Target:** 90+ on all metrics

## 🔒 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Supabase Row Level Security (RLS)
- ✅ Input validation dengan Zod
- ✅ SQL injection prevention (Supabase client)
- ✅ XSS protection (React auto-escaping)
- ✅ CSRF tokens for mutations
- ✅ Rate limiting on API routes
- ✅ Secure payment handling (Midtrans Snap)

## 🐛 Troubleshooting

### Common Issues

#### 1. Supabase connection error

```plaintext
Solution: Check .env.local file, ensure correct URL and anon key
```

#### 2. Images not loading

```plaintext
Solution: Check Supabase Storage bucket is public
```

#### 3. Cart not persisting

```plaintext
Solution: Check browser localStorage, clear cache if needed
```

#### 4. Payment webhook not working

```plaintext
Solution: Ensure webhook URL is correct in Midtrans dashboard
         Check /api/payment/webhook logs
```

#### 5. Build errors on Vercel

```plaintext
Solution: Ensure all environment variables are set
         Check Node.js version compatibility (18.17+)
```

### Debug Mode

Enable debug logging:

```env
# .env.local
NEXT_PUBLIC_DEBUG=true
```

## 📝 Roadmap

### Phase 1 (Current) ✅

- [x] Product catalog & detail
- [x] Shopping cart
- [x] Checkout flow
- [x] WhatsApp integration
- [x] Basic admin dashboard

### Phase 2 (In Progress) 🚧

- [ ] Midtrans payment integration
- [ ] Order tracking
- [ ] Customer reviews
- [ ] Email notifications
- [ ] Advanced admin analytics

### Phase 3 (Planned) 📋

- [ ] Customer accounts & order history
- [ ] Wishlist functionality
- [ ] Loyalty points system
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Untuk contribute:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

**Coding Standards:**

- Use TypeScript strict mode
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

## 📞 Support & Contact

- **Email:** <hello@bakeryumi.com>
- **WhatsApp:** +62 812 3456 7890
- **Instagram:** @bakeryumi
- **GitHub Issues:** [Report bug](https://github.com/yourusername/bakery-umi/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Indonesian home bakery businesses**

**Star ⭐ this repo if you find it helpful!**
