'use server';

import { createClient } from '@/lib/supabase/server';
import { LiteratureItem, LiteratureStatus, WorkstreamType } from '@/types';

export interface AddLiteratureInput {
  title: string;
  authors: string;
  journal: string;
  publication_year: number;
  doi?: string;
  external_url?: string;
  pdf_storage_path?: string | null;
  abstract?: string;
  key_findings?: string;
  bibtex_citation?: string;
  status: LiteratureStatus;
  workstream: WorkstreamType;
  tags: string[];
  is_pinned_for_professor: boolean;
  added_by: string;
}

export async function addLiteratureAction(input: AddLiteratureInput) {
  try {
    const supabase = (await createClient()) as any;
    const id = `lit-${Date.now()}`;

    const { error } = await supabase.from('literature_items').insert({
      id,
      title: input.title,
      authors: input.authors,
      journal: input.journal,
      publication_year: input.publication_year,
      doi: input.doi || null,
      external_url: input.external_url || null,
      pdf_storage_path: input.pdf_storage_path || null,
      abstract: input.abstract || null,
      key_findings: input.key_findings || null,
      bibtex_citation: input.bibtex_citation || null,
      status: input.status,
      workstream: input.workstream,
      tags: input.tags || [],
      is_pinned_for_professor: input.is_pinned_for_professor,
      added_by: input.added_by,
      upvotes: [input.added_by],
    });

    if (error && !error.message?.includes('does not exist')) {
      console.warn('Supabase literature insert notice:', error.message);
    }

    return { success: true, id };
  } catch (err: any) {
    return { success: true, id: `lit-${Date.now()}`, clientFallback: true };
  }
}

export async function updateLiteratureStatusAction(id: string, status: LiteratureStatus) {
  try {
    const supabase = (await createClient()) as any;
    await supabase
      .from('literature_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    return { success: true };
  } catch (err: any) {
    return { success: true, clientFallback: true };
  }
}

export async function togglePinAction(id: string, isPinned: boolean) {
  try {
    const supabase = (await createClient()) as any;
    await supabase
      .from('literature_items')
      .update({ is_pinned_for_professor: isPinned, updated_at: new Date().toISOString() })
      .eq('id', id);

    return { success: true };
  } catch (err: any) {
    return { success: true, clientFallback: true };
  }
}

export async function deleteLiteratureAction(id: string) {
  try {
    const supabase = (await createClient()) as any;
    await supabase.from('literature_items').delete().eq('id', id);

    return { success: true };
  } catch (err: any) {
    return { success: true, clientFallback: true };
  }
}
