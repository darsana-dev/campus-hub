
-- Profile role
DO $$ BEGIN
  CREATE TYPE public.profile_role AS ENUM ('student','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.profile_role NOT NULL DEFAULT 'student';

-- Backfill admins from existing club_memberships
UPDATE public.profiles p SET role = 'admin'
WHERE EXISTS (SELECT 1 FROM public.club_memberships m WHERE m.user_id = p.id AND m.role = 'admin');

-- Keep profile.role in sync with club_memberships
CREATE OR REPLACE FUNCTION public.sync_profile_role_on_membership()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.role = 'admin' THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.user_id AND role <> 'admin';
  END IF;
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.role <> 'admin') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.club_memberships
      WHERE user_id = COALESCE(OLD.user_id, NEW.user_id) AND role = 'admin'
        AND (TG_OP <> 'UPDATE' OR id <> NEW.id)
    ) THEN
      UPDATE public.profiles SET role = 'student'
      WHERE id = COALESCE(OLD.user_id, NEW.user_id) AND role <> 'student';
    END IF;
  END IF;
  RETURN NULL;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_profile_role_ins ON public.club_memberships;
CREATE TRIGGER trg_sync_profile_role_ins
AFTER INSERT OR UPDATE OR DELETE ON public.club_memberships
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_on_membership();

-- Event status
DO $$ BEGIN
  CREATE TYPE public.event_status AS ENUM ('draft','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS status public.event_status NOT NULL DEFAULT 'draft';

-- Existing rows should stay visible: mark them published
UPDATE public.events SET status = 'published' WHERE status = 'draft' AND created_at < now();

-- Tighten public event visibility: published-only, admins see own drafts
DROP POLICY IF EXISTS "Events viewable by everyone" ON public.events;
CREATE POLICY "Published events viewable by everyone" ON public.events
  FOR SELECT USING (status = 'published' OR public.is_club_admin(auth.uid(), club_id));

-- Registrations: optional free-text response
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS response text;
