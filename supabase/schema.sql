-- Create cv_history table
CREATE TABLE IF NOT EXISTS cv_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    base_cv_data JSONB NOT NULL,
    optimized_cv_data JSONB NOT NULL,
    target_company TEXT NOT NULL,
    target_position TEXT NOT NULL,
    template_id INTEGER NOT NULL DEFAULT 1,
    keywords_added TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cv_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own CV history"
    ON cv_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CV history"
    ON cv_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CV history"
    ON cv_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV history"
    ON cv_history FOR DELETE
    USING (auth.uid() = user_id);

-- Create a profiles table for extra user info
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);
