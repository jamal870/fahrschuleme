
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  qualification text,
  hobbies text,
  character text,
  motto text,
  phone text,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible team members"
ON public.team_members FOR SELECT
USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert team members"
ON public.team_members FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team members"
ON public.team_members FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team members"
ON public.team_members FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.team_members (name, role, qualification, hobbies, character, motto, phone, sort_order) VALUES
('Jimmy Ettana', 'Geschäftsführer', 'Staatlich geprüfter Fahrlehrer für Auto und Motorrad', 'Motorrad fahren, reisen, essen', 'freundlich, hilfsbereit, geduldig, zuverlässig und unkompliziert', 'Gemeinsam (Fahrlehrer und Fahrschüler) sind wir stark und schaffen alles!', '078 974 44 74', 1),
('Rebecca Rüegg', 'Auto-Fahrlehrerin', 'Autofahrlehrerin mit eidg. Fachausweis', 'Freunde und Familie treffen, Natur geniessen, Fitness', 'geduldig, freundlich, ehrlich und zwischendurch mal über sich selbst am schmunzeln', 'Dein Ziel ist mein Ziel: die Führerprüfung bestehen – unkompliziert, effizient und mit einer Prise Humor.', '078 851 48 58', 2);
