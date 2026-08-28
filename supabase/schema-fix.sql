-- Fix: Drop the recursive policies
DROP POLICY IF EXISTS "Admins full access profiles" ON profiles;
DROP POLICY IF EXISTS "Admin write modules" ON modules;
DROP POLICY IF EXISTS "Admin write units" ON units;
DROP POLICY IF EXISTS "Admin write lessons" ON lessons;
DROP POLICY IF EXISTS "Admin read all progress" ON progress;
DROP POLICY IF EXISTS "Admin write classes" ON classes;
DROP POLICY IF EXISTS "Admin read all orders" ON orders;
DROP POLICY IF EXISTS "Admin write order items" ON order_items;
DROP POLICY IF EXISTS "Admin write enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admin read all chat" ON ai_chat_history;

-- Fix: Use a helper function that checks role from JWT claims
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = auth.uid()),
    'user'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fix: Recreate admin policies using the function
CREATE POLICY "Admins full access profiles" ON profiles FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin write modules" ON modules FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin write units" ON units FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin write lessons" ON lessons FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin read all progress" ON progress FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin write classes" ON classes FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin read all orders" ON orders FOR SELECT
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin write order items" ON order_items FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin write enrollments" ON enrollments FOR ALL
  USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin read all chat" ON ai_chat_history FOR SELECT
  USING (public.get_user_role() = 'admin');
