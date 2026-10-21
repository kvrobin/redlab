-- ============================================================================
-- RED LAB COLLABORATION PLATFORM - COMPLETE SUPABASE SCHEMA & AUTOMATION ENGINE
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM ('researcher', 'supervisor');
CREATE TYPE workstream_type AS ENUM ('general', 'wet_lab', 'dry_lab_code', 'cad_hardware', 'thesis_writing', 'administration');
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review_professor', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE milestone_status AS ENUM ('upcoming', 'in_progress', 'awaiting_approval', 'approved', 'revision_requested');
CREATE TYPE meeting_status AS ENUM ('voting', 'confirmed', 'reschedule_needed', 'completed', 'cancelled');
CREATE TYPE vote_type AS ENUM ('upvote', 'downvote', 'if_needed');
CREATE TYPE literature_status AS ENUM ('to_read', 'reading', 'summarized', 'cited_in_thesis');

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 PROFILES (Linked to Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    short_code TEXT NOT NULL DEFAULT 'R', -- 'R' (Robin), 'E' (Emma), 'D' (Domi), 'P' (Prof)
    role user_role NOT NULL DEFAULT 'researcher',
    primary_workstream workstream_type NOT NULL DEFAULT 'general',
    avatar_url TEXT,
    badge_color TEXT NOT NULL DEFAULT '#E11D48',
    notify_email BOOLEAN NOT NULL DEFAULT true,
    notify_webhook BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 MILESTONES (Haladási terv és Professzori jóváhagyási pontok)
CREATE TABLE public.milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    phase_number INT NOT NULL,
    due_date DATE NOT NULL,
    status milestone_status NOT NULL DEFAULT 'upcoming',
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    deliverable_url TEXT,
    supervisor_feedback TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 KANBAN TASKS (Feladatok, Checklistek és Workstream-ek)
CREATE TABLE public.kanban_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    priority task_priority NOT NULL DEFAULT 'medium',
    workstream workstream_type NOT NULL DEFAULT 'general',
    position DOUBLE PRECISION NOT NULL DEFAULT 1000.0, -- Drag-and-drop sorrendhez
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    co_assignees UUID[] DEFAULT '{}',
    due_date TIMESTAMPTZ,
    checklist JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ "id": "1", "text": "Chip terv ellenőrzése", "done": true }]
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 TASK COMMENTS (Kommentek feladatonként és mérföldkövenként)
CREATE TABLE public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES public.kanban_tasks(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_professor_note BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 MEETINGS (Időpont-egyeztető események)
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    agenda_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["1. Heti haladás", "2. Mérési eredmények"]
    duration_minutes INT NOT NULL DEFAULT 60,
    location_or_link TEXT DEFAULT 'Google Meet / Labor',
    status meeting_status NOT NULL DEFAULT 'voting',
    requires_supervisor BOOLEAN NOT NULL DEFAULT false,
    confirmed_slot_id UUID, -- Később FK-ként kötve a meeting_slots-hoz
    meeting_notes TEXT, -- Megbeszélés utáni jegyzőkönyv (Minutes)
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 MEETING SLOTS (Javasolt idősávok egy megbeszéléshez)
CREATE TABLE public.meeting_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    proposed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.meetings
    ADD CONSTRAINT fk_confirmed_slot
    FOREIGN KEY (confirmed_slot_id) REFERENCES public.meeting_slots(id) ON DELETE SET NULL;

-- 3.7 MEETING VOTES (Upvote / Downvote / If-Needed szavazatok)
CREATE TABLE public.meeting_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES public.meeting_slots(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    vote vote_type NOT NULL,
    comment TEXT, -- Ha downvote: "Laborom van 14:00-ig, 15:00-tól jó lenne!"
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(slot_id, voter_id)
);

-- 3.8 LITERATURE HUB (Szakirodalom, Cikkek, DOI & BibTeX kezelő)
CREATE TABLE public.literature_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    publication_year INT,
    journal TEXT,
    doi TEXT UNIQUE,
    external_url TEXT,
    pdf_storage_path TEXT,
    abstract TEXT,
    key_findings TEXT, -- "Miért fontos ez a mi szakdogánkhoz?"
    bibtex_citation TEXT,
    status literature_status NOT NULL DEFAULT 'to_read',
    workstream workstream_type NOT NULL DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_pinned_for_professor BOOLEAN NOT NULL DEFAULT false,
    added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 REPOSITORY FILES (GitHub-stílusú verziózott fájlmegosztó)
CREATE TABLE public.repository_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_category workstream_type NOT NULL DEFAULT 'general',
    file_group_key TEXT NOT NULL, -- Azonos nevű fájlok verzióinak összekapcsolására (pl. "szakdoga-bevezetes")
    file_name TEXT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    commit_message TEXT NOT NULL, -- "v2: Témavezetői javítások beépítve a 3. fejezetbe"
    is_latest BOOLEAN NOT NULL DEFAULT true,
    milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 LAB & RESEARCH LOGS (Digitális Kutatási Napló)
CREATE TABLE public.research_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    workstream workstream_type NOT NULL DEFAULT 'wet_lab',
    content_markdown TEXT NOT NULL,
    parameters_json JSONB DEFAULT '{}'::jsonb, -- Pl. áramlási sebesség, hőmérséklet, modell hiperparaméterek
    linked_file_ids UUID[] DEFAULT '{}',
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 ACTIVITY FEED & AUTOMATED NOTIFICATIONS
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'TASK_MOVED', 'FILE_UPLOADED', 'MEETING_RESCHEDULE', 'MILESTONE_APPROVED', 'PAPER_ADDED'
    entity_title TEXT NOT NULL,
    details TEXT,
    target_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'urgent'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. AUTOMATION TRIGGERS & BUSINESS LOGIC FUNCTIONS
-- ============================================================================

-- 4.1 Automatikus verziószámozás új fájl feltöltésekor (GitHub-stílusú verziózás)
CREATE OR REPLACE FUNCTION public.handle_file_versioning()
RETURNS TRIGGER AS $$
DECLARE
    max_ver INT;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) INTO max_ver
    FROM public.repository_files
    WHERE file_group_key = NEW.file_group_key;

    IF max_ver > 0 THEN
        UPDATE public.repository_files
        SET is_latest = false
        WHERE file_group_key = NEW.file_group_key AND is_latest = true;
    END IF;

    NEW.version_number := max_ver + 1;
    NEW.is_latest := true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_file_versioning
BEFORE INSERT ON public.repository_files
FOR EACH ROW EXECUTE FUNCTION public.handle_file_versioning();

-- 4.2 Intelligens Időpont-Szavazás Kiértékelő Motor (Upvote / Downvote / Auto-Reschedule)
CREATE OR REPLACE FUNCTION public.evaluate_meeting_consensus()
RETURNS TRIGGER AS $$
DECLARE
    v_total_slots INT;
    v_blocked_slots INT;
    v_winning_slot UUID;
    v_researcher_count INT;
    v_meeting_title TEXT;
BEGIN
    SELECT title INTO v_meeting_title FROM public.meetings WHERE id = NEW.meeting_id;
    SELECT COUNT(*) INTO v_researcher_count FROM public.profiles WHERE role = 'researcher';
    SELECT COUNT(*) INTO v_total_slots FROM public.meeting_slots WHERE meeting_id = NEW.meeting_id;

    -- Megszámoljuk, hány idősáv kapott legalább 1 DOWNVOTE-ot (vétót)
    SELECT COUNT(DISTINCT s.id) INTO v_blocked_slots
    FROM public.meeting_slots s
    JOIN public.meeting_votes v ON v.slot_id = s.id
    WHERE s.meeting_id = NEW.meeting_id AND v.vote = 'downvote';

    -- 1. ESET: Ha MINDEN javasolt idősávon van legalább egy Downvote -> AUTO RESCHEDULE NEEDED!
    IF v_total_slots > 0 AND v_blocked_slots = v_total_slots THEN
        UPDATE public.meetings
        SET status = 'reschedule_needed', updated_at = NOW()
        WHERE id = NEW.meeting_id AND status != 'reschedule_needed';

        -- Automatikus értesítés küldése minden csapattagnak
        INSERT INTO public.notifications (recipient_id, title, message, link_url, severity)
        SELECT id,
               'Új időpont-javaslat szükséges! 🔄',
               'A(z) "' || v_meeting_title || '" megbeszélés minden javasolt idősávja ütközik valakinek. Kérlek javasoljatok új sávot!',
               '/scheduler?meeting=' || NEW.meeting_id,
               'urgent'
        FROM public.profiles;

        INSERT INTO public.activity_logs (actor_id, action_type, entity_title, details, target_url)
        VALUES (NEW.voter_id, 'MEETING_RESCHEDULE', v_meeting_title, 'Minden idősáv leszavazva -> Automatikus újütemezés kérve', '/scheduler');

        RETURN NEW;
    END IF;

    -- 2. ESET: Van-e olyan idősáv, ahol 0 Downvote van, és minden kutató Upvote-ot nyomott?
    SELECT s.id INTO v_winning_slot
    FROM public.meeting_slots s
    WHERE s.meeting_id = NEW.meeting_id
      AND NOT EXISTS (
          SELECT 1 FROM public.meeting_votes v2
          WHERE v2.slot_id = s.id AND v2.vote = 'downvote'
      )
      AND (
          SELECT COUNT(*) FROM public.meeting_votes v3
          WHERE v3.slot_id = s.id AND v3.vote = 'upvote'
      ) >= GREATEST(v_researcher_count, 3)
    LIMIT 1;

    IF v_winning_slot IS NOT NULL THEN
        UPDATE public.meetings
        SET status = 'confirmed',
            confirmed_slot_id = v_winning_slot,
            updated_at = NOW()
        WHERE id = NEW.meeting_id;

        INSERT INTO public.notifications (recipient_id, title, message, link_url, severity)
        SELECT id,
               'Megbeszélés időpontja véglegesítve! ✅',
               'A(z) "' || v_meeting_title || '" időpontja egyhangú szavazással elfogadva.',
               '/scheduler?meeting=' || NEW.meeting_id,
               'success'
        FROM public.profiles;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_evaluate_meeting_votes
AFTER INSERT OR UPDATE ON public.meeting_votes
FOR EACH ROW EXECUTE FUNCTION public.evaluate_meeting_consensus();

-- 4.3 Mérföldkő (Milestone) százalékos haladásának automatikus újraszámolása a Kanban kártyákból
CREATE OR REPLACE FUNCTION public.recalculate_milestone_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_milestone_id UUID;
    v_total INT;
    v_done INT;
    v_percent INT;
BEGIN
    v_milestone_id := COALESCE(NEW.milestone_id, OLD.milestone_id);
    IF v_milestone_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'done')
    INTO v_total, v_done
    FROM public.kanban_tasks
    WHERE milestone_id = v_milestone_id;

    IF v_total > 0 THEN
        v_percent := ROUND((v_done::NUMERIC / v_total::NUMERIC) * 100);
        UPDATE public.milestones
        SET progress_percent = v_percent, updated_at = NOW()
        WHERE id = v_milestone_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_milestone_progress
AFTER INSERT OR UPDATE OR DELETE ON public.kanban_tasks
FOR EACH ROW EXECUTE FUNCTION public.recalculate_milestone_progress();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.literature_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Minden bejelentkezett RED Lab tag (kutatók és professzorok) olvashatja a közös munkateret
CREATE POLICY "Authenticated members can read all workspace data"
ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read milestones" ON public.milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read tasks" ON public.kanban_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read comments" ON public.task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read meetings" ON public.meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read slots" ON public.meeting_slots FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read votes" ON public.meeting_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read literature" ON public.literature_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read files" ON public.repository_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read logs" ON public.research_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read activities" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = recipient_id);

-- Írási jogosultságok bejelentkezett csapattagoknak
CREATE POLICY "Members can manage tasks" ON public.kanban_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Members can manage milestones" ON public.milestones FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Members can comment" ON public.task_comments FOR ALL TO authenticated USING (true) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Members can manage meetings" ON public.meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Members can manage slots" ON public.meeting_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Members can vote" ON public.meeting_votes FOR ALL TO authenticated USING (true) WITH CHECK (auth.uid() = voter_id);
CREATE POLICY "Members can manage literature" ON public.literature_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Members can upload files" ON public.repository_files FOR ALL TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "Members can manage research logs" ON public.research_logs FOR ALL TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = recipient_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 4.4 AUTOMATIKUS PROFIL LÉTREHOZÁSA AUTH.USERS REGISZTRÁCIÓJAKOR
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        short_code,
        role,
        primary_workstream,
        avatar_url,
        badge_color,
        notify_email,
        notify_webhook
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'short_code', UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 1, 1))),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'researcher'::public.user_role),
        COALESCE((NEW.raw_user_meta_data->>'primary_workstream')::public.workstream_type, 'general'::public.workstream_type),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'badge_color', '#E11D48'),
        COALESCE((NEW.raw_user_meta_data->>'notify_email')::boolean, true),
        COALESCE((NEW.raw_user_meta_data->>'notify_webhook')::boolean, true)
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        short_code = EXCLUDED.short_code,
        role = EXCLUDED.role,
        primary_workstream = EXCLUDED.primary_workstream,
        badge_color = EXCLUDED.badge_color,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger csatolása auth.users-re
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

