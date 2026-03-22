CREATE TABLE IF NOT EXISTS public.review_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_templates_scope_check CHECK (scope IN ('single_match_review'))
);

CREATE INDEX IF NOT EXISTS review_templates_updated_at_id_idx
  ON public.review_templates(updated_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS public.review_template_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.review_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  is_required BOOLEAN NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_template_checklist_items_sort_order_check CHECK (sort_order >= 0),
  CONSTRAINT review_template_checklist_items_unique_sort_order_per_template UNIQUE (template_id, sort_order)
);

CREATE INDEX IF NOT EXISTS review_template_checklist_items_template_order_idx
  ON public.review_template_checklist_items(template_id, sort_order ASC, id ASC);

CREATE TABLE IF NOT EXISTS public.review_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT review_presets_scope_check CHECK (scope IN ('match_detail'))
);

CREATE INDEX IF NOT EXISTS review_presets_updated_at_id_idx
  ON public.review_presets(updated_at DESC, id DESC);
