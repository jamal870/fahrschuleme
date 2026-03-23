
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.course_dates (
  id TEXT PRIMARY KEY,
  part INTEGER NOT NULL CHECK (part BETWEEN 1 AND 3),
  day TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Wettingen',
  instructor TEXT,
  price NUMERIC NOT NULL DEFAULT 160,
  spots_available INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.course_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course dates are publicly readable"
  ON public.course_dates FOR SELECT USING (true);

CREATE TRIGGER update_course_dates_updated_at
  BEFORE UPDATE ON public.course_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fahrstunden_services (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('auto', 'motorrad')),
  name TEXT NOT NULL,
  duration TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fahrstunden_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fahrstunden services are publicly readable"
  ON public.fahrstunden_services FOR SELECT USING (true);

CREATE TABLE public.fahrstunden_packages (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES public.fahrstunden_services(id),
  name TEXT NOT NULL,
  lessons INTEGER NOT NULL,
  discount TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  price_per_lesson NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fahrstunden_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fahrstunden packages are publicly readable"
  ON public.fahrstunden_packages FOR SELECT USING (true);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type TEXT NOT NULL CHECK (booking_type IN ('grundkurs', 'fahrstunde')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  address TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  fa_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Bookings readable by service role only"
  ON public.bookings FOR SELECT USING (false);

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  course_date_id TEXT REFERENCES public.course_dates(id),
  fahrstunden_service_id TEXT REFERENCES public.fahrstunden_services(id),
  fahrstunden_package_id TEXT REFERENCES public.fahrstunden_packages(id),
  instructor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create booking items"
  ON public.booking_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Booking items readable by service role only"
  ON public.booking_items FOR SELECT USING (false);

CREATE OR REPLACE FUNCTION public.decrement_spots(course_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.course_dates
  SET spots_available = spots_available - 1
  WHERE id = course_id AND spots_available > 0;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No spots available for course %', course_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.increment_spots(course_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.course_dates
  SET spots_available = spots_available + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
