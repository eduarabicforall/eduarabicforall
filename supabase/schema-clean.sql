-- EduArabic for All - Supabase Schema

-- Tables

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'plus', 'pro')),
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  locale TEXT DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  level TEXT,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  old_price NUMERIC(10,2) DEFAULT 0,
  cover TEXT,
  icon TEXT,
  is_bundle BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ar TEXT,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('clip', 'exercise', 'audio', 'test')),
  title TEXT NOT NULL,
  title_ar TEXT,
  youtube_id TEXT,
  duration INT DEFAULT 0,
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'locked' CHECK (status IN ('done', 'active', 'locked')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  tutor TEXT,
  type TEXT CHECK (type IN ('group', 'one_on_one')),
  start_at TIMESTAMPTZ,
  join_url TEXT,
  plan_required TEXT DEFAULT 'free',
  max_students INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  ref TEXT,
  method TEXT,
  amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id),
  price NUMERIC(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS ai_usage (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  count INT DEFAULT 1,
  month TEXT,
  PRIMARY KEY (user_id, month)
);

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  correction JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes

CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_start ON classes(start_at);
CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON ai_chat_history(user_id);

-- RLS

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins full access profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Admin write modules" ON modules FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read units" ON units FOR SELECT USING (true);
CREATE POLICY "Admin write units" ON units FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Admin write lessons" ON lessons FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users read own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin read all progress" ON progress FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Public read classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Admin write classes" ON classes FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid()));
CREATE POLICY "Admin write order items" ON order_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users read own enrollments" ON enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin write enrollments" ON enrollments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users read own ai_usage" ON ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own ai_usage" ON ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ai_usage" ON ai_usage FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own chat" ON ai_chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users write own chat" ON ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all chat" ON ai_chat_history FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Auto-create profile on signup

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed: Modules

INSERT INTO modules (slug, category, title_en, title_ar, level, description, price, old_price, cover, icon, is_bundle, order_index)
VALUES
  ('nahw-foundations', 'Nahw', 'Nahw Foundations', 'أساسيات النحو', 'Beginner', 'Master the building blocks of Arabic grammar.', 49, 79, 'linear-gradient(150deg,#17756A,#0C3A33)', 'book-open-01', false, 1),
  ('sarf-essentials', 'Sarf', 'Sarf Essentials', 'علم الصرف', 'Beginner', 'Understand Arabic morphology.', 45, 0, 'linear-gradient(150deg,#8C6A1E,#4A3607)', 'language-square', false, 2),
  ('muhadathah', 'Conversation', 'Muhadathah: Everyday Speaking', 'المحادثة اليومية', 'Intermediate', 'Speak Arabic with confidence.', 59, 0, 'linear-gradient(150deg,#A33241,#5A121C)', 'bubble-chat', false, 3),
  ('quranic-arabic', 'Quran', 'Quranic Arabic', 'لغة القرآن', 'Intermediate', 'Understand the language of the Quran.', 65, 89, 'linear-gradient(150deg,#1C6D5C,#0A2C26)', 'quran-01', false, 4),
  ('balaghah', 'Balaghah', 'Introduction to Balaghah', 'مدخل إلى البلاغة', 'Advanced', 'Discover the eloquence of Arabic.', 69, 0, 'linear-gradient(150deg,#5B4B8A,#241C3C)', 'quill-write-01', false, 5),
  ('complete-pathway', 'Bundle', 'Complete Arabic Pathway', 'المسار الكامل', 'All levels', 'All five modules in one bundle.', 199, 287, 'linear-gradient(150deg,#2FC49F,#0C3A33)', 'package', true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed: Units

DO $$ DECLARE mod_id UUID; BEGIN
  SELECT id INTO mod_id FROM modules WHERE slug = 'nahw-foundations';
  INSERT INTO units (module_id, title, title_ar, "order") VALUES
    (mod_id, 'The Nominal Sentence', 'الجملة الاسمية', 1),
    (mod_id, 'The Verbal Sentence', 'الجملة الفعلية', 2),
    (mod_id, 'Pronouns and Demonstratives', 'الضمائر', 3),
    (mod_id, 'Prepositions and Adverbs', 'حروف الجر', 4)
  ON CONFLICT DO NOTHING;
END $$;

-- Seed: Lessons

DO $$ DECLARE uid UUID; BEGIN
  SELECT id INTO uid FROM units WHERE title = 'The Nominal Sentence' LIMIT 1;
  INSERT INTO lessons (unit_id, type, title, title_ar, youtube_id, duration, "order") VALUES
    (uid, 'clip', 'What is a nominal sentence?', 'ما هي الجملة الاسمية?', 'dQw4w9WgXcQ', 180, 1),
    (uid, 'clip', 'Mubtada and Khabar', 'المبتدأ والخبر', 'dQw4w9WgXcQ', 120, 2),
    (uid, 'exercise', 'Practice: build the sentence', 'تمرين', NULL, 300, 3),
    (uid, 'audio', 'Podcast: sentences in speech', 'بودكاست', NULL, 360, 4),
    (uid, 'test', 'Unit 1 checkpoint', 'اختبار', NULL, 600, 5)
  ON CONFLICT DO NOTHING;
END $$;

-- Seed: Classes

INSERT INTO classes (title, tutor, type, start_at, join_url, plan_required)
VALUES
  ('Muhadathah - Level 2', 'Ustaz Hakim', 'group', NOW() + INTERVAL '2 hours', 'https://zoom.us/j/example1', 'free'),
  ('Nahw Q&A Session', 'Ustazah Aisyah', 'group', NOW() + INTERVAL '3 days', 'https://zoom.us/j/example2', 'plus'),
  ('Quranic Recitation Circle', 'Ustaz Rashid', 'group', NOW() + INTERVAL '5 days', 'https://zoom.us/j/example3', 'free')
ON CONFLICT DO NOTHING;
