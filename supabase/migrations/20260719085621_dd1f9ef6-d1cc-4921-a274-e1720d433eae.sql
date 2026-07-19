
-- Enums
CREATE TYPE public.club_role AS ENUM ('admin', 'member');
CREATE TYPE public.registration_status AS ENUM ('registered', 'waitlisted', 'cancelled', 'attended');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  university TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CLUBS
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  category TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.clubs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clubs TO authenticated;
GRANT ALL ON public.clubs TO service_role;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_clubs_updated BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CLUB MEMBERSHIPS
CREATE TABLE public.club_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.club_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (club_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_memberships TO authenticated;
GRANT ALL ON public.club_memberships TO service_role;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

-- Security-definer helper to check club admin without recursion
CREATE OR REPLACE FUNCTION public.is_club_admin(_user_id UUID, _club_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.club_memberships
    WHERE user_id = _user_id AND club_id = _club_id AND role = 'admin'
  );
$$;

-- Clubs policies
CREATE POLICY "Clubs viewable by everyone" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create clubs" ON public.clubs FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Club admins can update club" ON public.clubs FOR UPDATE
  USING (public.is_club_admin(auth.uid(), id));
CREATE POLICY "Club admins can delete club" ON public.clubs FOR DELETE
  USING (public.is_club_admin(auth.uid(), id));

-- Memberships policies
CREATE POLICY "Memberships viewable by everyone" ON public.club_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join a club as member" ON public.club_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'member');
CREATE POLICY "Club admins can add memberships" ON public.club_memberships FOR INSERT
  WITH CHECK (public.is_club_admin(auth.uid(), club_id));
CREATE POLICY "Users can leave (delete own membership)" ON public.club_memberships FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "Club admins can manage memberships" ON public.club_memberships FOR UPDATE
  USING (public.is_club_admin(auth.uid(), club_id));
CREATE POLICY "Club admins can remove memberships" ON public.club_memberships FOR DELETE
  USING (public.is_club_admin(auth.uid(), club_id));

-- When a club is created, make creator an admin
CREATE OR REPLACE FUNCTION public.handle_new_club()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.club_memberships (club_id, user_id, role)
    VALUES (NEW.id, NEW.created_by, 'admin')
    ON CONFLICT (club_id, user_id) DO UPDATE SET role = 'admin';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_club_created AFTER INSERT ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_club();

-- EVENTS
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  cover_url TEXT,
  capacity INT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_club ON public.events(club_id);
CREATE INDEX idx_events_starts_at ON public.events(starts_at);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Club admins can insert events" ON public.events FOR INSERT
  WITH CHECK (public.is_club_admin(auth.uid(), club_id));
CREATE POLICY "Club admins can update events" ON public.events FOR UPDATE
  USING (public.is_club_admin(auth.uid(), club_id));
CREATE POLICY "Club admins can delete events" ON public.events FOR DELETE
  USING (public.is_club_admin(auth.uid(), club_id));

-- REGISTRATIONS
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.registration_status NOT NULL DEFAULT 'registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX idx_registrations_user ON public.registrations(user_id);
CREATE INDEX idx_registrations_event ON public.registrations(event_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_registrations_updated BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.is_event_club_admin(_user_id UUID, _event_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.club_memberships m ON m.club_id = e.club_id
    WHERE e.id = _event_id AND m.user_id = _user_id AND m.role = 'admin'
  );
$$;

CREATE POLICY "Users view own registrations" ON public.registrations FOR SELECT
  USING (auth.uid() = user_id OR public.is_event_club_admin(auth.uid(), event_id));
CREATE POLICY "Users register self" ON public.registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own registration" ON public.registrations FOR UPDATE
  USING (auth.uid() = user_id OR public.is_event_club_admin(auth.uid(), event_id));
CREATE POLICY "Users delete own registration" ON public.registrations FOR DELETE
  USING (auth.uid() = user_id OR public.is_event_club_admin(auth.uid(), event_id));

-- FEEDBACK
CREATE TABLE public.event_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_feedback TO authenticated;
GRANT ALL ON public.event_feedback TO service_role;
ALTER TABLE public.event_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feedback viewable by author or club admin" ON public.event_feedback FOR SELECT
  USING (auth.uid() = user_id OR public.is_event_club_admin(auth.uid(), event_id));
CREATE POLICY "Users write own feedback" ON public.event_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own feedback" ON public.event_feedback FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own feedback" ON public.event_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- CERTIFICATES
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX idx_certificates_user ON public.certificates(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own certificates or club admin" ON public.certificates FOR SELECT
  USING (auth.uid() = user_id OR public.is_event_club_admin(auth.uid(), event_id));
CREATE POLICY "Club admins issue certificates" ON public.certificates FOR INSERT
  WITH CHECK (public.is_event_club_admin(auth.uid(), event_id));
CREATE POLICY "Club admins update certificates" ON public.certificates FOR UPDATE
  USING (public.is_event_club_admin(auth.uid(), event_id));
CREATE POLICY "Club admins delete certificates" ON public.certificates FOR DELETE
  USING (public.is_event_club_admin(auth.uid(), event_id));
