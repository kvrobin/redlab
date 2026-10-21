'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEFAULT_TEAM_MEMBERS } from '@/types/database';
import { RedLabLogo } from '@/components/brand/RedLabLogo';
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
  Cpu,
  Microscope,
  Binary,
  UserCheck,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface DemoRolePreset {
  id: 'student' | 'supervisor';
  title: string;
  badgeLabel: string;
  subtitle: string;
  role: 'researcher' | 'supervisor';
  workstream: 'cad_hardware' | 'wet_lab' | 'dry_lab_code' | 'general' | 'thesis_writing' | 'administration';
  email: string;
  profileId: string;
  shortCode: string;
  badgeColor: string;
  icon: React.ReactNode;
}

const DEMO_ROLE_PRESETS: DemoRolePreset[] = [
  {
    id: 'student',
    title: '1. Hallgatói nézet',
    badgeLabel: 'Hallgató / Kutató',
    subtitle: 'Kutatói munkatér, kísérletek, mérési adatok, Kanban és kéziratírás',
    role: 'researcher',
    workstream: 'wet_lab',
    email: 'hallgato@redlab.hu',
    profileId: 'user-robin',
    shortCode: 'H',
    badgeColor: '#E11D48',
    icon: <FlaskConical className="w-5 h-5 text-rose-400" />,
  },
  {
    id: 'supervisor',
    title: '2. Témavezetői nézet',
    badgeLabel: 'Témavezető',
    subtitle: 'Fejezet-bírálatok, konzultációs időpontok és hivatalos jóváhagyások (Sign-Off)',
    role: 'supervisor',
    workstream: 'general',
    email: 'temavezeto@redlab.hu',
    profileId: 'user-prof-kovacs',
    shortCode: 'T',
    badgeColor: '#8B5CF6',
    icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/dashboard';
  const supabase = createClient();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic_link'>('password');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shortCode, setShortCode] = useState('R');
  const [role, setRole] = useState<'researcher' | 'supervisor'>('researcher');
  const [workstream, setWorkstream] = useState<
    'cad_hardware' | 'wet_lab' | 'dry_lab_code' | 'general' | 'thesis_writing' | 'administration'
  >('general');
  const [badgeColor, setBadgeColor] = useState('#E11D48');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Sign In with Password
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';

        toast.success('Sikeres bejelentkezés!', {
          description: `Üdvözlünk a RED Lab rendszerben! (${data.user.email})`,
        });

        router.push(redirectedFrom);
        router.refresh();
      } else {
        // Supabase offline/local fallback
        const matchingMember =
          DEFAULT_TEAM_MEMBERS.find((m) => m.email.toLowerCase() === email.toLowerCase()) ||
          DEFAULT_TEAM_MEMBERS[0];
        document.cookie = `redlab_demo_profile_id=${matchingMember.id}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';

        toast.success(`Üdvözlünk, ${matchingMember.fullName}!`, {
          description: 'Belépve tesztkörnyezetben (Supabase offline mód).',
        });

        router.push(redirectedFrom);
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

  // Sign In with Magic Link (for supervisors)
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Hiányzó email cím!', {
        description: 'Kérlek add meg az email címedet a bejelentkezési linkhez.',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              redirectedFrom
            )}`,
          },
        });

        if (error) throw error;

        setMagicLinkSent(true);
        toast.success('Belépési link elküldve!', {
          description: `Egy biztonságos belépési linket küldtünk a következő címre: ${email}`,
        });
      } else {
        // Demo magic link
        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
        toast.success('Belépés szimulálva!', {
          description: `Bejelentkezve ezzel a címmel: ${email}`,
        });
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Nem sikerült a link kiküldése.';
      toast.error('Hiba történt!', { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up / Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error('Hiányzó név!', { description: 'Kérlek add meg a teljes nevedet.' });
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Érvénytelen email!', { description: 'Kérlek érvényes email címet adj meg.' });
      return;
    }

    if (password.length < 6) {
      toast.error('Rövid jelszó!', { description: 'A jelszónak legalább 6 karakter hosszúnak kell lennie.' });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('A jelszavak nem egyeznek!', { description: 'Kérlek ellenőrizd az új jelszót.' });
      return;
    }

    if (!acceptTerms) {
      toast.error('Adatvédelmi nyilatkozat elfogadása kötelező!', {
        description: 'Kérlek fogadd el a RED Lab Adatkezelési Tájékoztatóját a regisztrációhoz.',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const computedShortCode =
          shortCode.trim() ||
          fullName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              short_code: computedShortCode,
              role,
              primary_workstream: workstream,
              badge_color: badgeColor,
              notify_email: true,
              notify_webhook: true,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              redirectedFrom
            )}`,
          },
        });

        if (error) throw error;

        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';

        if (data.session) {
          toast.success('Sikeres regisztráció és belépés!', {
            description: `Üdvözlünk a RED Lab kutatócsoportjában, ${fullName}!`,
          });
          router.push(redirectedFrom);
          router.refresh();
        } else {
          toast.success('Regisztrációs fiók elkészült!', {
            description: 'Kérlek ellenőrizd a beérkező fiókodat a visszaigazoló linkért, vagy lépj be közvetlenül.',
          });
          setMode('login');
        }
      } else {
        // Demo offline registration
        document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
        toast.success('Profil regisztrálva!', {
          description: `Üdvözlünk, ${fullName}! (Supabase offline demó mód).`,
        });
        router.push(redirectedFrom);
        router.refresh();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'A regisztráció nem sikerült.';
      toast.error('Regisztrációs hiba!', { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click Demo Login
  const handleQuickDemoLogin = (preset: DemoRolePreset) => {
    setEmail(preset.email);
    setPassword('RedLab2026!');
    document.cookie = 'redlab_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
    document.cookie = `redlab_demo_profile_id=${preset.profileId}; path=/; max-age=604800; SameSite=Lax`;

    toast.success(`Azonnali belépés: ${preset.title}`, {
      description: preset.subtitle,
    });
    router.push(redirectedFrom);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Background ambient light effects */}
      <div className="absolute top-[-10rem] left-1/2 -translate-x-1/2 w-[65rem] h-[35rem] bg-gradient-to-b from-rose-900/20 via-purple-900/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5rem] -right-20 w-[40rem] h-[30rem] bg-rose-950/15 blur-3xl rounded-full pointer-events-none" />

      {/* Top Bar with System Status */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <RedLabLogo variant="full" size="lg" />

        {/* Server Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">
            Szerver elérhető
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        <div className="bg-[#0D121F]/90 border border-slate-800/80 shadow-2xl rounded-2xl backdrop-blur-xl overflow-hidden">
          {/* Top Mode Selector Tabs (Bejelentkezés vs Regisztráció) */}
          <div className="grid grid-cols-2 border-b border-slate-800 bg-[#090D17]">
            <button
              onClick={() => {
                setMode('login');
                setMagicLinkSent(false);
              }}
              className={`py-4 text-center font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                mode === 'login'
                  ? 'text-white border-b-2 border-rose-500 bg-rose-500/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4 text-rose-400" />
              <span>Bejelentkezés (Sign In)</span>
            </button>

            <button
              onClick={() => setMode('register')}
              className={`py-4 text-center font-semibold text-sm transition-all flex items-center justify-center space-x-2 ${
                mode === 'register'
                  ? 'text-white border-b-2 border-rose-500 bg-rose-500/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4 text-rose-400" />
              <span>Regisztráció & Szerepkörök (Sign Up)</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. BEJELENTKEZÉS NÉZET */}
            {mode === 'login' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Üdvözlünk a RED Lab Munkatérben!
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Jelentkezz be email címeddel és jelszavaddal, vagy válassz az alábbi 2 gyors demó nézet közül.
                  </p>
                </div>

                {/* Sub-tabs: Jelszavas vs Magic Link */}
                <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs w-full sm:w-auto sm:inline-flex">
                  <button
                    onClick={() => setLoginMethod('password')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-medium transition-all ${
                      loginMethod === 'password'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Email + Jelszó
                  </button>
                  <button
                    onClick={() => setLoginMethod('magic_link')}
                    className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-medium transition-all ${
                      loginMethod === 'magic_link'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Magic Link (Témavezetőknek)
                  </button>
                </div>

                {loginMethod === 'password' ? (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Cím
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="pl. kutato@redlab.hu vagy saját email"
                          className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Jelszó
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Belépés a Munkatérbe</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                    {magicLinkSent ? (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-sm space-y-2">
                        <div className="flex items-center space-x-2 font-semibold">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Belépési link elküldve!</span>
                        </div>
                        <p className="text-xs text-emerald-300/80">
                          Kattints az emailben érkező megerősítő hivatkozásra a jelszómentes professzori belépéshez.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Témavezetői Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="pl. temavezeto@redlab.hu"
                              className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-purple-950/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Magic Link Küldése Emailben</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </form>
                )}

                {/* Quick 1-Click Demo Profiles (2 Options) */}
                <div className="pt-6 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                      <span>Gyors Demó Belépés (2 opció)</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">1 kattintásos azonnali hozzáférés</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEMO_ROLE_PRESETS.map((char) => (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => handleQuickDemoLogin(char)}
                        className="group flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-950/20 transition-all text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ring-1 ring-white/10 shrink-0 mt-0.5"
                          style={{ backgroundColor: char.badgeColor }}
                        >
                          {char.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                              {char.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                char.role === 'supervisor'
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                                  : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                              }`}
                            >
                              {char.badgeLabel}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-snug">{char.subtitle}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. REGISZTRÁCIÓS NÉZET */}
            {mode === 'register' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Új Kutatói vagy Témavezetői Fiók
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Add meg kutatói adataidat a RED Lab munkatérhez való csatlakozáshoz.
                  </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Teljes Név
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="pl. Teljes Név"
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Cím
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pl. kutato@redlab.hu"
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                    </div>

                    {/* Short Code & Badge Color */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Monogram / Rövid Kód
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={shortCode}
                        onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                        placeholder="H, T"
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>Avatar / Jelvény Szín</span>
                        <span className="text-[10px] text-slate-400 font-mono">{badgeColor}</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={badgeColor}
                          onChange={(e) => setBadgeColor(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-700 bg-[#141A29] cursor-pointer p-0.5"
                        />
                        <div className="flex space-x-1.5 flex-1">
                          {['#E11D48', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setBadgeColor(color)}
                              className="w-7 h-7 rounded-lg ring-1 ring-white/20 transition-transform active:scale-90"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Szerepkör a Laborban
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'researcher' | 'supervisor')}
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        <option value="researcher">Kutató Hallgató (Researcher)</option>
                        <option value="supervisor">Témavezető / Professzor (Supervisor)</option>
                      </select>
                    </div>

                    {/* Workstream */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Elsődleges Munkaterület (Workstream)
                      </label>
                      <select
                        value={workstream}
                        onChange={(e) => setWorkstream(e.target.value as any)}
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        <option value="general">Általános Kutatás / Csapatmunka</option>
                        <option value="cad_hardware">CAD & Mikrofluidikai Hardver</option>
                        <option value="wet_lab">Wet Lab & Sejttenyésztési Mérések</option>
                        <option value="dry_lab_code">Dry Lab, Szimuláció & Kód</option>
                        <option value="thesis_writing">Szakdolgozat & Kézirat Írás</option>
                        <option value="administration">Adminisztráció & Szervezés</option>
                      </select>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jelszó (min. 6 karakter)
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jelszó Megerősítése
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#141A29] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                    </div>
                  </div>

                  {/* GDPR / Terms Checkbox */}
                  <div className="flex items-start space-x-2.5 pt-2">
                    <input
                      type="checkbox"
                      id="termsCheckbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-700 bg-[#141A29] text-rose-600 focus:ring-rose-500/50 cursor-pointer accent-rose-600 shrink-0"
                    />
                    <label htmlFor="termsCheckbox" className="text-xs text-slate-300 leading-snug cursor-pointer select-none">
                      Elolvastam és elfogadom a RED Lab{' '}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-rose-400 hover:text-rose-300 underline font-semibold"
                      >
                        Adatkezelési Tájékoztatóját
                      </Link>
                      , és hozzájárulok a regisztrációs adataim kezeléséhez a kutatási együttműködés céljából.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Regisztráció & Csatlakozás a RED Lab-hez</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 gap-2">
        <div>RED Lab (Research & Engineering Dynamics) © 2026</div>
        <div className="flex items-center space-x-4 text-[11px]">
          <Link
            href="/privacy"
            className="text-slate-400 hover:text-rose-400 underline font-mono transition-colors"
          >
            Adatvédelem & Jogi nyilatkozat (/privacy)
          </Link>
          <span className="flex items-center space-x-1 text-slate-400">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>End-to-End Hitelesítés & RLS Adatvédelem</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] flex items-center justify-center">
          <div className="flex items-center space-x-2 text-rose-500 font-mono text-sm">
            <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
            <span>RED Lab Hitelesítés betöltése...</span>
          </div>
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
