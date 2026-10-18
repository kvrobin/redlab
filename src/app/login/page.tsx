'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEFAULT_TEAM_MEMBERS, TeamMemberSeed } from '@/types/database';
import { useStore } from '@/lib/store';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  KeyRound,
  GraduationCap,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentProfileById } = useStore();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'password' | 'magic_link'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Email + Password sign-in
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Hiányzó adatok!', {
        description: 'Kérlek add meg az egyetemi email címedet és jelszavadat.',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        // Set demo auth cookie as well for middleware consistency
        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
        toast.success('Sikeres bejelentkezés!', {
          description: 'Üdvözöljük a RED Lab tudományos felületén.',
        });
        router.push('/');
        router.refresh();
      } else {
        // Fallback demo login: find matching team member or default to Robin
        const member = DEFAULT_TEAM_MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase()) || DEFAULT_TEAM_MEMBERS[0];
        setCurrentProfileById(member.id);
        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';

        toast.success(`Üdvözöljük, ${member.fullName}!`, {
          description: 'Belépve tesztkörnyezetben (Supabase offline mód).',
        });
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Hibás bejelentkezési adatok.';
      toast.error('Bejelentkezési hiba!', {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Magic Link sign-in for professors
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Hiányzó email cím!', {
        description: 'Kérlek add meg a professzori email címedet a bejelentkezési linkhez.',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          throw error;
        }

        setMagicLinkSent(true);
        toast.success('Magic Link elküldve!', {
          description: `Ellenőrizd a(z) ${email} postafiókot az egykattintásos belépéshez.`,
        });
      } else {
        // Demo simulation
        setMagicLinkSent(true);
        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
        const member = DEFAULT_TEAM_MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase()) || DEFAULT_TEAM_MEMBERS[3];
        setCurrentProfileById(member.id);

        toast.success('Magic Link teszt üzemmódban szimulálva!', {
          description: `Kattints a folytatás gombra a belépéshez: ${member.fullName}.`,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Nem sikerült elküldeni a Magic Linket.';
      toast.error('Hiba történt!', {
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click team member sign-in
  const handleQuickLogin = (member: TeamMemberSeed) => {
    setCurrentProfileById(member.id);
    document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
    toast.success(`Belépve: ${member.fullName}`, {
      description: `${member.role === 'supervisor' ? 'Témavezetői' : 'Kutatói'} munkamenet aktiválva.`,
    });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-grid-pattern">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-red-600/15 via-rose-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-rose-900/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-950/60 ring-1 ring-white/20">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                RED<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">LAB</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block -mt-0.5">
                Scientific Collab
              </span>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            Zártkörű Kutatói & Szakdolgozati Rendszer
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Robin, Emma, Domi kutatók és témavezető professzoraik kollaborációs platformja.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-[#12141D] border border-[#1E2230] p-6 shadow-2xl relative">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900/80 border border-[#1E2230] mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('password');
                setMagicLinkSent(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'password'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Jelszavas Belépés</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('magic_link');
                setMagicLinkSent(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'magic_link'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Magic Link (Professzorok)</span>
            </button>
          </div>

          {/* Form 1: Password Login */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Egyetemi Email Cím
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="robin@redlab.edu vagy prof.kovacs@redlab.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-[#1E2230] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Jelszó
                  </label>
                  <span className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer">
                    Elfelejtett jelszó?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-[#1E2230] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950/40 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
              >
                <span>{isLoading ? 'Azonosítás...' : 'Biztonságos Belépés'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Form 2: Magic Link */}
          {activeTab === 'magic_link' && (
            <div>
              {!magicLinkSent ? (
                <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-300 leading-relaxed">
                    <span className="font-semibold block mb-0.5">Egyszerű, jelszó nélküli belépés:</span>
                    A témavezető professzoroknak elegendő megadniuk egyetemi címüket, és a rendszer közvetlen hitelesítő linket küld.
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Professzori / Kutatói Email Cím
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="prof.kovacs@redlab.edu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-[#1E2230] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500/80 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-950/40 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isLoading ? 'Küldés...' : 'Magic Link Kérése'}</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">A belépési link elkészült!</h3>
                  <p className="text-xs text-slate-400">
                    Kattints az alábbi gombra a munkamenet azonnali indításához:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      router.push('/');
                      router.refresh();
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Belépés a RED Lab Központba</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Persona Switcher for Development & Demonstration */}
        <div className="rounded-2xl bg-[#12141D]/90 border border-[#1E2230] p-4.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1E2230]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
              Gyors Belépés Szerepkörrel (1-Kattintás)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Demo Sandbox
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Válassz egy csapattagot a zártkörű felület azonnali kipróbálásához:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {DEFAULT_TEAM_MEMBERS.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleQuickLogin(member)}
                className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-900/80 border border-[#1E2230] hover:border-slate-700 hover:bg-slate-800/80 transition-all text-left group"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: member.badgeColor }}
                >
                  {member.shortCode}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                    {member.fullName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {member.role === 'supervisor' ? 'Témavezető Prof.' : 'Kutató'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
          <span>RLS & Supabase Auth Védelem • SSL 256-bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}
