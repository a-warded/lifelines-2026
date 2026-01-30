-- =============================================
-- LIFELINES 2026 (FADES) DATABASE SCHEMA
-- Translated from MongoDB/Mongoose to SQL
-- =============================================

-- Users table (NextAuth managed)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified TIMESTAMP,
    image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm Profiles
CREATE TABLE farm_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE NOT NULL,
    user_name VARCHAR(255),
    farm_name VARCHAR(100),
    farm_emoji VARCHAR(10) DEFAULT '🌱',
    water_availability ENUM('none', 'low', 'medium', 'high') NOT NULL,
    soil_condition ENUM('normal', 'salty', 'unknown') NOT NULL,
    space_type ENUM('rooftop', 'balcony', 'containers', 'backyard', 'microplot') NOT NULL,
    sunlight ENUM('low', 'medium', 'high') NOT NULL,
    primary_goal ENUM('calories', 'nutrition', 'fast') NOT NULL,
    experience_level ENUM('beginner', 'intermediate', 'advanced'),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_label VARCHAR(255),
    country VARCHAR(100),
    daily_water_liters DECIMAL(10, 2) DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crops (embedded array in MongoDB, separate table in SQL)
CREATE TABLE crops (
    id VARCHAR(36) PRIMARY KEY,
    farm_profile_id VARCHAR(36) NOT NULL,
    plant_id VARCHAR(100) NOT NULL,
    plant_name VARCHAR(255) NOT NULL,
    count INT NOT NULL CHECK (count >= 1),
    stage ENUM('seedling', 'vegetative', 'flowering', 'fruiting', 'mature') DEFAULT 'seedling',
    planted_date DATE,
    notes VARCHAR(500),
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE CASCADE
);

-- Plans (AI-generated farming plans)
CREATE TABLE plans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    farm_profile_id VARCHAR(36),
    estimated_daily_water_liters DECIMAL(10, 2) DEFAULT 0,
    fallback_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farm_profile_id) REFERENCES farm_profiles(id) ON DELETE SET NULL
);

-- Recommended Crops (embedded in Plans)
CREATE TABLE recommended_crops (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    crop_name VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    time_to_harvest_days INT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Timeline Blocks (embedded in Plans)
CREATE TABLE timeline_blocks (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    label VARCHAR(50) NOT NULL,
    step_order INT NOT NULL,
    step_content TEXT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Setup Checklist (embedded in Plans)
CREATE TABLE setup_checklist_items (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(36) NOT NULL,
    item_order INT NOT NULL,
    item_content TEXT NOT NULL,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Water Calculations
CREATE TABLE water_calculations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total_liters_per_day DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Water Entries (embedded in Water Calculations)
CREATE TABLE water_entries (
    id VARCHAR(36) PRIMARY KEY,
    water_calculation_id VARCHAR(36) NOT NULL,
    plant_id VARCHAR(100) NOT NULL,
    stage ENUM('seedling', 'vegetative', 'flowering', 'fruiting', 'mature') NOT NULL,
    count INT NOT NULL CHECK (count >= 1),
    FOREIGN KEY (water_calculation_id) REFERENCES water_calculations(id) ON DELETE CASCADE
);

-- Water Results (embedded in Water Calculations)
CREATE TABLE water_results (
    id VARCHAR(36) PRIMARY KEY,
    water_calculation_id VARCHAR(36) NOT NULL,
    plant_id VARCHAR(100) NOT NULL,
    plant_name VARCHAR(255) NOT NULL,
    stage ENUM('seedling', 'vegetative', 'flowering', 'fruiting', 'mature') NOT NULL,
    count INT NOT NULL,
    liters_per_plant DECIMAL(10, 3) NOT NULL,
    total_liters DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (water_calculation_id) REFERENCES water_calculations(id) ON DELETE CASCADE
);

-- Water Tips (embedded in Water Calculations)
CREATE TABLE water_tips (
    id VARCHAR(36) PRIMARY KEY,
    water_calculation_id VARCHAR(36) NOT NULL,
    tip_order INT NOT NULL,
    tip_content TEXT NOT NULL,
    FOREIGN KEY (water_calculation_id) REFERENCES water_calculations(id) ON DELETE CASCADE
);

-- Compost Sites
CREATE TABLE compost_sites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255),
    site_name VARCHAR(100) NOT NULL,
    site_emoji VARCHAR(10) DEFAULT '♻️',
    description VARCHAR(500),
    site_type ENUM('community', 'private', 'commercial', 'municipal') NOT NULL,
    accepts_waste BOOLEAN DEFAULT TRUE,
    sells_fertilizer BOOLEAN DEFAULT FALSE,
    capacity_kg DECIMAL(10, 2),
    current_load_kg DECIMAL(10, 2) DEFAULT 0,
    contact_info VARCHAR(200),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    location_label VARCHAR(255),
    country VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exchange Listings
CREATE TABLE exchange_listings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255),
    type ENUM('seeds', 'produce', 'tools', 'fertilizer', 'other') NOT NULL,
    plant_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    quantity VARCHAR(100),
    image_url VARCHAR(500),
    mode ENUM('offering', 'seeking') DEFAULT 'offering',
    deal_type ENUM('price', 'trade', 'donation') DEFAULT 'donation',
    price DECIMAL(10, 2) CHECK (price >= 0),
    currency_country VARCHAR(10),
    delivery_method ENUM('pickup', 'walking', 'bicycle', 'car', 'truck', 'boat', 'drone', 'helicopter', 'airdrop') DEFAULT 'pickup',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    country VARCHAR(100) NOT NULL,
    location_label VARCHAR(255),
    status ENUM('available', 'claimed', 'completed', 'cancelled') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trade Items (embedded array in Exchange Listings)
CREATE TABLE trade_items (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES exchange_listings(id) ON DELETE CASCADE
);

-- Exchange Claims
CREATE TABLE exchange_claims (
    id VARCHAR(36) PRIMARY KEY,
    listing_id VARCHAR(36) NOT NULL,
    owner_id VARCHAR(36) NOT NULL,
    claimer_id VARCHAR(36) NOT NULL,
    claimer_name VARCHAR(255),
    message TEXT,
    trade_offer TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES exchange_listings(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (claimer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum Posts
CREATE TABLE forum_posts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255),
    title VARCHAR(200) NOT NULL,
    content VARCHAR(5000) NOT NULL,
    category ENUM('composting', 'water-saving', 'seed-saving', 'crop-rotation', 'organic', 'zero-waste', 'general') DEFAULT 'general',
    journey_stage ENUM('seed', 'growing', 'harvest', 'compost', 'full-cycle'),
    comment_count INT DEFAULT 0,
    image_url VARCHAR(500),
    country VARCHAR(100),
    region VARCHAR(100),
    is_pinned BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum Post Likes (embedded array in MongoDB)
CREATE TABLE forum_post_likes (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum Comments
CREATE TABLE forum_comments (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255),
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forum Comment Likes
CREATE TABLE forum_comment_likes (
    id VARCHAR(36) PRIMARY KEY,
    comment_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assistant Messages (AI Chat History)
CREATE TABLE assistant_messages (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_farm_profiles_user ON farm_profiles(user_id);
CREATE INDEX idx_crops_farm ON crops(farm_profile_id);
CREATE INDEX idx_plans_user ON plans(user_id);
CREATE INDEX idx_water_calc_user ON water_calculations(user_id);
CREATE INDEX idx_compost_sites_user ON compost_sites(user_id);
CREATE INDEX idx_compost_sites_location ON compost_sites(latitude, longitude);
CREATE INDEX idx_exchange_user ON exchange_listings(user_id);
CREATE INDEX idx_exchange_status ON exchange_listings(status);
CREATE INDEX idx_exchange_country ON exchange_listings(country);
CREATE INDEX idx_claims_listing ON exchange_claims(listing_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category, created_at);
CREATE INDEX idx_forum_posts_pinned ON forum_posts(is_pinned, created_at);
CREATE INDEX idx_forum_comments_post ON forum_comments(post_id);
CREATE INDEX idx_assistant_user_time ON assistant_messages(user_id, created_at);