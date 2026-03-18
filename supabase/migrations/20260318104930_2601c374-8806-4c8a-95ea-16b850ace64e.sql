
-- Drop old unique constraint and add new one with set_id
ALTER TABLE public.grades DROP CONSTRAINT IF EXISTS grades_user_id_subject_id_key;
CREATE UNIQUE INDEX grades_user_set_subject_unique ON public.grades (user_id, subject_id, set_id);
