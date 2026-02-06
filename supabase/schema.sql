-- ============================================
-- BAKERY E-COMMERCE DATABASE SCHEMA
-- Supabase PostgreSQL Schema
-- ============================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE
    SET NULL,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        base_price DECIMAL(10, 2) NOT NULL,
        -- Product metadata
        sku VARCHAR(50),
        weight_grams INTEGER,
        stock_quantity INTEGER DEFAULT 0,
        min_order_quantity INTEGER DEFAULT 1,
        max_order_quantity INTEGER,
        -- Pre-order settings
        is_pre_order BOOLEAN DEFAULT true,
        pre_order_days INTEGER DEFAULT 2,
        -- Shipping
        is_shippable BOOLEAN DEFAULT true,
        shipping_local_only BOOLEAN DEFAULT false,
        -- SEO & Display
        meta_title VARCHAR(200),
        meta_description TEXT,
        featured_image TEXT,
        -- Stats
        view_count INTEGER DEFAULT 0,
        order_count INTEGER DEFAULT 0,
        rating_average DECIMAL(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        -- Status
        is_active BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(200),
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- PRODUCT VARIANTS TABLE
-- ============================================
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50),
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    stock_quantity INTEGER DEFAULT 0,
    weight_grams INTEGER,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- CUSTOMERS TABLE (integrates with Supabase Auth)
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(200),
    -- Default shipping address
    address_line TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    -- Stats
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE
    SET NULL,
        -- Customer info (denormalized for historical record)
        customer_name VARCHAR(200) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(200),
        -- Shipping info
        shipping_address TEXT NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        shipping_postal_code VARCHAR(10),
        -- Order totals
        subtotal DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        shipping_cost DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        -- Payment
        payment_method VARCHAR(50) NOT NULL,
        -- 'whatsapp', 'qris', 'bank_transfer', 'e_wallet'
        payment_status VARCHAR(50) DEFAULT 'pending',
        -- 'pending', 'paid', 'failed', 'refunded'
        midtrans_transaction_id VARCHAR(200),
        midtrans_token TEXT,
        paid_at TIMESTAMP WITH TIME ZONE,
        -- Order status
        status VARCHAR(50) DEFAULT 'pending',
        -- 'pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'
        -- Pre-order
        delivery_date DATE,
        delivery_time_slot VARCHAR(50),
        -- Notes
        customer_notes TEXT,
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE
    SET NULL,
        variant_id UUID REFERENCES product_variants(id) ON DELETE
    SET NULL,
        -- Denormalized product info (for historical record)
        product_name VARCHAR(200) NOT NULL,
        variant_name VARCHAR(100),
        unit_price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- PROMOS TABLE
-- ============================================
CREATE TABLE promos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    -- Discount settings
    discount_type VARCHAR(20) NOT NULL,
    -- 'percentage', 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    -- Usage limits
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    max_usage_total INTEGER,
    max_usage_per_customer INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    -- Validity
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE
    SET NULL,
        order_id UUID REFERENCES orders(id) ON DELETE
    SET NULL,
        rating INTEGER NOT NULL CHECK (
            rating >= 1
            AND rating <= 5
        ),
        title VARCHAR(200),
        comment TEXT,
        -- Moderation
        is_verified_purchase BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    -- 'super_admin', 'admin', 'staff'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- SETTINGS TABLE (Key-Value Store)
-- ============================================
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
-- Public read access for active products & categories
CREATE POLICY "Public can view active categories" ON categories FOR
SELECT USING (is_active = true);
CREATE POLICY "Public can view active products" ON products FOR
SELECT USING (is_active = true);
CREATE POLICY "Public can view product images" ON product_images FOR
SELECT USING (true);
CREATE POLICY "Public can view active variants" ON product_variants FOR
SELECT USING (is_active = true);
CREATE POLICY "Public can view approved reviews" ON reviews FOR
SELECT USING (is_approved = true);
-- Customers can view their own data
CREATE POLICY "Customers can view own profile" ON customers FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Customers can update own profile" ON customers FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Customers can view own orders" ON orders FOR
SELECT USING (customer_id = auth.uid());
-- Admin full access (check admin_users table)
CREATE POLICY "Admins have full access to categories" ON categories FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admin_users
        WHERE id = auth.uid()
            AND is_active = true
    )
);
CREATE POLICY "Admins have full access to products" ON products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admin_users
        WHERE id = auth.uid()
            AND is_active = true
    )
);
CREATE POLICY "Admins have full access to orders" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM admin_users
        WHERE id = auth.uid()
            AND is_active = true
    )
);
-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE
UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE
UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE
UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE
UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promos_updated_at BEFORE
UPDATE ON promos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE
UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE
UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================
-- Insert default settings
INSERT INTO settings (key, value, description)
VALUES (
        'whatsapp_number',
        '6281234567890',
        'WhatsApp number for customer service'
    ),
    (
        'min_pre_order_days',
        '2',
        'Minimum days required for pre-order'
    ),
    ('tax_percentage', '11', 'Tax percentage (PPN)'),
    (
        'free_shipping_threshold',
        '200000',
        'Minimum order for free shipping'
    ),
    (
        'store_name',
        'Warm Oven Bakery',
        'Store display name'
    ),
    (
        'store_email',
        'hello@warmoven.id',
        'Store contact email'
    );
-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order)
VALUES (
        'Kue Kering',
        'kue-kering',
        'Kue kering premium dan ekonomis',
        1
    ),
    (
        'Brownies',
        'brownies',
        'Brownies fudgy dengan berbagai topping',
        2
    ),
    (
        'Donat',
        'donat',
        'Donat empuk dengan berbagai varian',
        3
    ),
    (
        'Pizza',
        'pizza',
        'Pizza homemade dengan topping pilihan',
        4
    );
-- Note: Add your actual product data here
-- Example:
-- INSERT INTO products (category_id, name, slug, description, base_price, is_pre_order, pre_order_days) 
-- SELECT id, 'Nastar Wisman Premium', 'nastar-wisman-premium', 'Kue kering premium dengan mentega Wisman asli', 185000, true, 2
-- FROM categories WHERE slug = 'kue-kering';