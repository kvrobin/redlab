import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AuthAndRealtimeProvider } from '@/lib/store';
import { WorkspaceClientLayout } from './WorkspaceClientLayout';
import { Profile } from '@/types/database';
import { initialProfiles } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get('redlab_demo_auth')?.value;
  const hasDemoAuth = demoCookie === 'true' || demoCookie === 'authenticated';

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Strict barrier: If not authenticated and no demo authentication, redirect to /login
  if (!user && !hasDemoAuth) {
    redirect('/login');
  }

  let currentProfile: Profile | null = null;
  let allProfiles: Profile[] = [];

  if (user) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: teamProfiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      currentProfile = profile as Profile | null;
      allProfiles = (teamProfiles as Profile[]) || [];
    } catch (err) {
      console.warn('[RED Lab] Error fetching profile in server layout:', err);
    }
  }

  // Fallback defaults for demo / first-time registration resilience
  const demoProfileId = cookieStore.get('redlab_demo_profile_id')?.value;
  if (!currentProfile && demoProfileId) {
    const matched = initialProfiles.find((m) => m.id === demoProfileId);
    if (matched) currentProfile = matched;
  }

  if (!currentProfile) {
    currentProfile = initialProfiles[0];
  }
  if (!allProfiles || allProfiles.length === 0) {
    allProfiles = initialProfiles;
  }

  return (
    <AuthAndRealtimeProvider
      initialUser={user}
      initialProfile={currentProfile}
      initialProfiles={allProfiles}
    >
      <WorkspaceClientLayout>{children}</WorkspaceClientLayout>
    </AuthAndRealtimeProvider>
  );
}
