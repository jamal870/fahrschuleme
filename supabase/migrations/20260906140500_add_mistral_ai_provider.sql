-- Mistral AI (EU/Frankreich-gehostet) als weiteren KI-Anbieter zulassen,
-- damit im Admin unter "KI-Keys" ein DSGVO-freundlicher, EU-hostender
-- Anbieter neben Lovable/OpenAI/Gemini/Anthropic aktiviert werden kann.
ALTER TABLE public.ai_providers DROP CONSTRAINT IF EXISTS ai_providers_provider_check;
ALTER TABLE public.ai_providers ADD CONSTRAINT ai_providers_provider_check
  CHECK (provider IN ('lovable','openai','gemini','anthropic','mistral'));

INSERT INTO public.ai_providers (provider, enabled) VALUES ('mistral', false)
  ON CONFLICT (provider) DO NOTHING;
