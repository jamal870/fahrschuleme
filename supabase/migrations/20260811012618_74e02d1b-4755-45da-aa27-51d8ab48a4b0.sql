CREATE TABLE public.ai_providers (
  provider text PRIMARY KEY CHECK (provider IN ('lovable','openai','gemini','anthropic')),
  api_key text,
  enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_providers TO service_role;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ai_assistant_config (
  assistant text PRIMARY KEY CHECK (assistant IN ('chatbot','admin')),
  provider text NOT NULL DEFAULT 'lovable',
  model text NOT NULL DEFAULT 'google/gemini-3.6-flash',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_assistant_config TO service_role;
GRANT SELECT ON public.ai_assistant_config TO authenticated;
ALTER TABLE public.ai_assistant_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view assistant config"
  ON public.ai_assistant_config FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_assistant_config_updated_at BEFORE UPDATE ON public.ai_assistant_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.ai_providers (provider, enabled) VALUES
  ('lovable', true), ('openai', false), ('gemini', false), ('anthropic', false);
INSERT INTO public.ai_assistant_config (assistant, provider, model) VALUES
  ('chatbot','lovable','google/gemini-3.6-flash'),
  ('admin','lovable','google/gemini-3.6-flash');