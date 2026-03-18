
-- Create GWA sets table
CREATE TABLE public.gwa_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gwa_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own gwa_sets"
  ON public.gwa_sets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add set_id to grades table (nullable for existing data)
ALTER TABLE public.grades ADD COLUMN set_id UUID REFERENCES public.gwa_sets(id) ON DELETE CASCADE;
