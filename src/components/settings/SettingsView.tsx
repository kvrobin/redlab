'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Profile, UserRole, WorkstreamType } from '@/types';
import {
  Settings,
  User,
  Bell,
  Mail,
  Send,
  UserPlus,
  Shield,
  GraduationCap,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Palette,
  Briefcase,
  Layers,
  Radio,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

const BADGE_COLOR_PALETTE = [
  { label: 'RED Lab Karmazsin', hex: '#E11D48' },
  { label: 'Élénk Rózsaszín', hex: '#F43F5E' },
  { label: 'Ibolya / Professzori', hex: '#8B5CF6' },
  { label: 'Óceán Kék', hex: '#0EA5E9' },
  { label: 'Smaragdzöld', hex: '#10B981' },
  { label: 'Borostyán / Arany', hex: '#F59E0B' },
  { label: 'Indigó', hex: '#6366F1' },
  { label: 'Grafit Szürke', hex: '#64748B' },
];

export function SettingsView() {
  const {
    currentProfile,
    profiles,
    updateCurrentProfile,
    addNewMember,
    setCurrentProfileById,
    realtimeStatus,
    isSupabaseLive,
    seedDatabase,
    tasks,
    milestones,
    repositoryFiles,
    researchLogs,
    literatureItems,
    meetings,
    signOut,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'notifications' | 'invite' | 'database'>('profile');

  // Profile Edit State
  const [fullName, setFullName] = useState(currentProfile.full_name);
  const [email, setEmail] = useState(currentProfile.email);
  const [shortCode, setShortCode] = useState<string>(currentProfile.short_code);
  const [role, setRole] = useState<UserRole>(currentProfile.role);
  const [workstream, setWorkstream] = useState<WorkstreamType>(currentProfile.primary_workstream);
  const [badgeColor, setBadgeColor] = useState(currentProfile.badge_color);
  const [affiliation, setAffiliation] = useState(currentProfile.affiliation || 'RED Lab Tudományos Kutatócsoport');
  const [title, setTitle] = useState(currentProfile.title || (currentProfile.role === 'supervisor' ? 'Egyetemi Docens, Témavezető' : 'MSc Kutató Hallgató'));

  // Notification Preferences State
  const [notifyEmail, setNotifyEmail] = useState(currentProfile.notify_email);
  const [notifyWebhook, setNotifyWebhook] = useState(currentProfile.notify_webhook);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Invitation State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('supervisor');
  const [inviteWorkstream, setInviteWorkstream] = useState<WorkstreamType>('administration');
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSendingInviteEmail, setIsSendingInviteEmail] = useState(false);

  // Sync state when currentProfile changes
  useEffect(() => {
    setFullName(currentProfile.full_name);
    setEmail(currentProfile.email);
    setShortCode(currentProfile.short_code);
    setRole(currentProfile.role);
    setWorkstream(currentProfile.primary_workstream);
    setBadgeColor(currentProfile.badge_color);
    setAffiliation(currentProfile.affiliation || 'RED Lab Tudományos Kutatócsoport');
    setTitle(currentProfile.title || '');
    setNotifyEmail(currentProfile.notify_email);
    setNotifyWebhook(currentProfile.notify_webhook);

    // Load custom webhook from localStorage if saved
    if (typeof window !== 'undefined') {
      const savedWebhook = localStorage.getItem('redlab_discord_webhook');
      if (savedWebhook) setDiscordWebhookUrl(savedWebhook);
    }
  }, [currentProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentProfile({
      full_name: fullName.trim(),
      email: email.trim(),
      short_code: (shortCode.trim().substring(0, 1).toUpperCase() as 'R' | 'E' | 'D' | 'P') || 'R',
      role,
      primary_workstream: workstream,
      badge_color: badgeColor,
      affiliation: affiliation.trim(),
      title: title.trim(),
      notify_email: notifyEmail,
      notify_webhook: notifyWebhook,
    });
  };

  const handleSaveWebhookUrl = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('redlab_discord_webhook', discordWebhookUrl.trim());
      toast.success('Discord Webhook URL elmentve!');
    }
  };

  const handleTestDiscordWebhook = async () => {
    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'TEST_NOTIFICATION',
          title: 'Teszt Értesítés a RED Lab Rendszerből! 🚀',
          message: `${currentProfile.full_name} sikeresen tesztelte az automatizált kommunikációs motort. A rendszer készen áll az éles események közvetítésére!`,
          actorName: currentProfile.full_name,
          actorEmail: currentProfile.email,
          workstream: currentProfile.primary_workstream,
          targetUrl: '/settings',
          customWebhookUrl: discordWebhookUrl.trim() || undefined,
          sendEmail: true,
          metadata: {
            'Tesztelő': currentProfile.full_name,
            'Időpont': new Date().toLocaleTimeString('hu-HU'),
            'Rendszer Státusz': 'Aktív & Üzemkész',
          },
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.data?.discordStatus || 'Discord webhook és email teszt sikeresen lefutott!',
        });
        toast.success('Teszt üzenet sikeresen elküldve! 🚀', {
          description: data.data?.discordStatus,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'A webhook tesztelés során hiba lépett fel.',
        });
        toast.error('Hiba az értesítés küldésekor', {
          description: data.error,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Hálózati kapcsolati hiba.',
      });
      toast.error('Hálózati hiba a tesztelés során');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error('Kérlek add meg a meghívandó személy nevét és email címét!');
      return;
    }

    const token = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://redlab.bme.hu';
    const link = `${origin}/login?invite=${token}&role=${inviteRole}&name=${encodeURIComponent(inviteName.trim())}&email=${encodeURIComponent(inviteEmail.trim())}`;

    setGeneratedInviteLink(link);
    setIsCopied(false);

    // Register member in store so they appear in team directory
    addNewMember({
      email: inviteEmail.trim(),
      full_name: inviteName.trim(),
      short_code: (inviteName.trim().charAt(0).toUpperCase() as 'R' | 'E' | 'D' | 'P') || 'P',
      role: inviteRole,
      primary_workstream: inviteWorkstream,
      badge_color: inviteRole === 'supervisor' ? '#8B5CF6' : '#E11D48',
      notify_email: true,
      notify_webhook: true,
      title: inviteRole === 'supervisor' ? 'Témavezető Professzor' : 'Kutató Hallgató',
      affiliation: 'RED Lab Tudományos Kutatócsoport',
    });

    toast.success(`Meghívó link elkészült: ${inviteName} (${inviteRole === 'supervisor' ? 'Témavezető' : 'Kutató'})`);
  };

  const handleCopyInviteLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setIsCopied(true);
    toast.success('Meghívó link kimásolva a vágólapra! 📋');
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSendInviteEmail = async () => {
    if (!generatedInviteLink || !inviteEmail) return;
    setIsSendingInviteEmail(true);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'TEST_NOTIFICATION',
          title: `Meghívó a RED Lab Tudományos Platformra: ${inviteName}`,
          message: `${currentProfile.full_name} meghívta Önt a RED Lab kutatócsoportba mint ${inviteRole === 'supervisor' ? 'Témavezető Professzor' : 'Kutató Hallgató'}. Csatlakozás a közvetlen meghívó linken: ${generatedInviteLink}`,
          actorName: currentProfile.full_name,
          actorEmail: currentProfile.email,
          workstream: inviteWorkstream,
          targetUrl: generatedInviteLink,
          sendEmail: true,
          recipientEmail: inviteEmail,
          customWebhookUrl: discordWebhookUrl.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Hivatalos meghívó email elküldve a(z) ${inviteEmail} címre! ✉️`);
      } else {
        toast.error('Hiba az email kiküldésekor.');
      }
    } catch {
      toast.error('Hálózati hiba a meghívó küldésekor.');
    } finally {
      setIsSendingInviteEmail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-xl space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/40 flex items-center">
            <Settings className="w-3.5 h-3.5 mr-1 text-rose-400" />
            RED LAB RENDSZERBEÁLLÍTÁSOK
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Profil, Automatizált Értesítések & Csapattag Meghívók
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight">
          Beállítások & Kommunikációs Motor
        </h1>

        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Kezeld a személyes kutatói profilodat, hangold be a Discord / Slack Webhook és professzori email
          értesítési csatornákat, vagy generálj azonnali meghívó linket konzulens professzorok és új kutatók számára.
        </p>

        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 pt-4 border-t border-[#1E2230] overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'profile'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Kutatói Profil</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'notifications'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Értesítések & Discord Webhook</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invite')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'invite'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Témavezető / Tag Meghívó</span>
          </button>

          <button
            onClick={() => setActiveSubTab('database')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'database'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Adatbázis & Realtime Állapot</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. KUTATÓI PROFIL BEÁLLÍTÁSOK */}
      {/* ========================================================================= */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ring-2 ring-white/20"
                  style={{ backgroundColor: badgeColor }}
                >
                  {shortCode || 'R'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Személyes Adatok & Szerepkör</h2>
                  <p className="text-xs text-slate-400">Az értesítésekben és audit naplókban megjelenő azonosítóid</p>
                </div>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                Szerepkör: <strong className={role === 'supervisor' ? 'text-amber-400' : 'text-rose-400'}>{role === 'supervisor' ? 'Témavezető' : 'Kutató'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Teljes Név *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Email Cím *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Rövid Kód (Avatar Monogram)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Rendszer Szerepkör
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="researcher">Kutató Hallgató (Robin, Emma, Domi)</option>
                  <option value="supervisor">Témavezető Professzor (Bírálat, Szignó, Elfogadás)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Elsődleges Kutatási Terület
                </label>
                <select
                  value={workstream}
                  onChange={(e) => setWorkstream(e.target.value as WorkstreamType)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="thesis_writing">Szakdolgozat Kézirat & Sablon</option>
                  <option value="dry_lab_code">Dry Lab (Szimuláció, CFD, Neurális Háló)</option>
                  <option value="wet_lab">Wet Lab (Laboratórium & Mikrofluidika)</option>
                  <option value="cad_hardware">CAD & Hardware Fabrikáció</option>
                  <option value="administration">Adminisztráció & Vezetés</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Egyetemi Titulus / Beosztás
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="pl. Egyetemi Docens vagy MSc Kutató Hallgató"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-mono uppercase block mb-1 text-xs">
                Intézményi Affiliáció
              </label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="pl. RED Lab Tudományos Kutatócsoport / Egyetemi Tanszék"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>

            {/* Avatar Color Picker */}
            <div>
              <label className="text-slate-400 font-mono uppercase block mb-2 text-xs flex items-center">
                <Palette className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                Avatar Színpaletta:
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {BADGE_COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setBadgeColor(c.hex)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      badgeColor === c.hex
                        ? 'border-white bg-slate-800 text-white ring-2 ring-rose-500/50'
                        : 'border-[#1E2230] bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2230]">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all active:scale-95"
              >
                Profil Módosítások Mentése
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 2. ÉRTESÍTÉSEK & DISCORD WEBHOOK */}
      {/* ========================================================================= */}
      {activeSubTab === 'notifications' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Channel Overview Card */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-rose-500">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Automatizált Értesítési Csatornák</h2>
                  <p className="text-xs text-slate-400">Háromszintű integráció a kutatók és professzorok között</p>
                </div>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Motor Aktív
              </span>
            </div>

            {/* Channels Description */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] space-y-1.5">
                <div className="font-bold text-white flex items-center">
                  <Bell className="w-4 h-4 mr-1.5 text-rose-400" />
                  1. In-App Realtime
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Azonnali felugró toast értesítések és adatbázis bejegyzések minden csapattagnak, aki épp az appot használja.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] space-y-1.5">
                <div className="font-bold text-white flex items-center">
                  <Share2 className="w-4 h-4 mr-1.5 text-indigo-400" />
                  2. Discord / Slack
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  RED Lab karmazsinvörös Embed kártyák a közös laboratóriumi csatornába közvetlen ugróhivatkozásokkal.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-[#1E2230] space-y-1.5">
                <div className="font-bold text-white flex items-center">
                  <Mail className="w-4 h-4 mr-1.5 text-amber-400" />
                  3. Professzori Email
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Letisztult HTML tájékoztató a témavezetőnek új szignó-kérelmekről és időpont-szavazásokról Resend alapon.
                </p>
              </div>
            </div>

            {/* Discord Webhook Configuration */}
            <div className="pt-4 border-t border-[#1E2230] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white flex items-center">
                    <Share2 className="w-4 h-4 mr-1.5 text-rose-500" />
                    Discord / Slack Webhook URL
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Ide illeszd be a Discord szerver &quot;Integrációk &gt; Webhook létrehozása&quot; linkjét
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveWebhookUrl}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                >
                  URL Mentése
                </button>
              </div>

              <input
                type="url"
                value={discordWebhookUrl}
                onChange={(e) => setDiscordWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/123456789/abcdef..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 font-mono text-xs focus:outline-none focus:border-rose-500"
              />

              {/* Test Button & Result */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-[11px] text-slate-400">
                  {discordWebhookUrl.trim() ? (
                    <span className="text-emerald-400 flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" /> Egyéni Webhook beállítva
                    </span>
                  ) : (
                    <span className="text-slate-500 italic">
                      (Ha üres, a rendszer környezeti változóból vagy szimulált csatornán küldi az auditot)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTestDiscordWebhook}
                  disabled={isTestingWebhook}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center space-x-2 transition-all disabled:opacity-50 active:scale-95 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestingWebhook ? 'Küldés folyamatban...' : 'Teszt üzenet küldése 🚀'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block mb-0.5">
                      {testResult.success ? 'Sikeres kommunikációs teszt!' : 'Tesztelési figyelmeztetés'}
                    </strong>
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Email Preferences Toggle */}
            <div className="pt-4 border-t border-[#1E2230] space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center">
                <Mail className="w-4 h-4 mr-1.5 text-amber-400" />
                Email Preferenciák (Témavezetői Konzultációk & Szakdoga Értesítők)
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-[#1E2230]">
                <div>
                  <div className="font-semibold text-white text-xs">Email értesítések fogadása</div>
                  <div className="text-[11px] text-slate-400">
                    Akkor kapok emailt, ha egy mérföldkő szignóra vár, vagy új időpont-szavazás indult
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => {
                    setNotifyEmail(e.target.checked);
                    updateCurrentProfile({ notify_email: e.target.checked });
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-[#1E2230]">
                <div>
                  <div className="font-semibold text-white text-xs">Webhook események bekapcsolása</div>
                  <div className="text-[11px] text-slate-400">
                    Fájlverziók, mérési naplók és konszenzusos szavazások küldése a csapat Discord csatornájára
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={notifyWebhook}
                  onChange={(e) => {
                    setNotifyWebhook(e.target.checked);
                    updateCurrentProfile({ notify_webhook: e.target.checked });
                  }}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TÉMAVEZETŐ / CSAPATTAG MEGHÍVÓ */}
      {/* ========================================================================= */}
      {activeSubTab === 'invite' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Invitation Generator Card */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Témavezető Professzor vagy Csapattag Meghívása</h2>
                  <p className="text-xs text-slate-400">
                    Közvetlen meghívó link generálása automatikus szerepkörrel és jogosultságokkal
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/60">
                1-Kattintásos Csatlakozás
              </span>
            </div>

            <form onSubmit={handleGenerateInvite} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Meghívott Neve *
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="pl. Prof. Dr. Kovács Gergely vagy Új Kutató"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-mono uppercase block mb-1">
                    Meghívott Email Címe *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="pl. prof.kovacs@redlab.bme.hu"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Role Selection with Highlighting */}
              <div>
                <label className="text-slate-400 font-mono uppercase block mb-2">
                  Kiosztott Szerepkör & Jogosultsági Szint *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Supervisor Option */}
                  <div
                    onClick={() => setInviteRole('supervisor')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      inviteRole === 'supervisor'
                        ? 'bg-purple-950/40 border-purple-600 shadow-md ring-1 ring-purple-500/50'
                        : 'bg-slate-900/40 border-[#1E2230] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-white flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1.5 text-purple-400" />
                        Témavezető Professzor (supervisor)
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 font-bold">
                        AJÁNLOTT
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Teljes bírálati jogkör: szakdolgozati mérföldkövek hivatalos szignálása, javítási kérelmek,
                      konzultációs szavazatok és kiemelt szakirodalmi ajánlók.
                    </p>
                  </div>

                  {/* Researcher Option */}
                  <div
                    onClick={() => setInviteRole('researcher')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      inviteRole === 'researcher'
                        ? 'bg-rose-950/40 border-rose-600 shadow-md ring-1 ring-rose-500/50'
                        : 'bg-slate-900/40 border-[#1E2230] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-white flex items-center">
                        <User className="w-4 h-4 mr-1.5 text-rose-400" />
                        Kutató Hallgató (researcher)
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Kanban feladatok mozgatása, kísérleti és szimulációs naplóbejegyzések rögzítése,
                      valamint forrásfájlok és CAD modellek verziózott commitolása.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-mono uppercase block mb-1">
                  Kutatási Fókusz / Csoportosítás
                </label>
                <select
                  value={inviteWorkstream}
                  onChange={(e) => setInviteWorkstream(e.target.value as WorkstreamType)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-[#1E2230] text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  <option value="administration">Adminisztráció & Vezetés (Témavezető)</option>
                  <option value="thesis_writing">Szakdolgozat Kézirat & Bírálat</option>
                  <option value="wet_lab">Wet Lab (Biomikrofluidika & Labor)</option>
                  <option value="dry_lab_code">Dry Lab (CFD & Neurális Háló)</option>
                  <option value="cad_hardware">CAD & Hardware Fabrikáció</option>
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-rose-600 to-rose-700 hover:from-purple-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-purple-950/50 flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Meghívó Link Generálása 🔗</span>
                </button>
              </div>
            </form>

            {/* Generated Invite Box */}
            {generatedInviteLink && (
              <div className="p-4 rounded-xl bg-slate-900 border border-purple-800/60 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                    Készen áll a meghívó: {inviteName} ({inviteRole === 'supervisor' ? 'Témavezető' : 'Kutató'})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Biztonságos token generálva</span>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs select-all"
                  />
                  <button
                    onClick={handleCopyInviteLink}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shrink-0 ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/40'
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{isCopied ? 'Másolva!' : 'Link Másolása 📋'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Küldhetsz közvetlen hivatalos értesítő emailt is a professzor címére:
                  </span>
                  <button
                    type="button"
                    onClick={handleSendInviteEmail}
                    disabled={isSendingInviteEmail}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isSendingInviteEmail ? 'Küldés...' : 'Meghívó Email Kiküldése (Resend) ✉️'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Team Members Directory */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-white">RED Lab Csapattagok & Professzorok ({profiles.length})</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Kattints a névre a profilváltáshoz</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profiles.map((p) => {
                const isCurrent = currentProfile.id === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setCurrentProfileById(p.id);
                      toast.success(`Felhasználó átváltva: ${p.full_name}`);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-rose-950/40 border-rose-600 shadow-md ring-1 ring-rose-500/50'
                        : 'bg-slate-900/60 border-[#1E2230] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20"
                        style={{ backgroundColor: p.badge_color }}
                      >
                        {p.short_code}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center">
                          {p.full_name}
                          {isCurrent && (
                            <span className="ml-2 text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-900 text-rose-200">
                              AKTÍV
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.role === 'supervisor' ? 'Témavezető Professzor' : 'Kutató Hallgató'} • {p.email}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        p.role === 'supervisor'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.role === 'supervisor' ? 'SUPERVISOR' : 'MEMBER'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ADATBÁZIS & REALTIME ÁLLAPOT */}
      {/* ========================================================================= */}
      {activeSubTab === 'database' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Connection Status Card */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2230]">
              <div className="flex items-center space-x-2.5">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-bold text-white text-sm">Supabase & Realtime Adatszinkron</h3>
                  <p className="text-xs text-slate-400">Kapcsolat állapota és élő adatszálak</p>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                  realtimeStatus === 'connected'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : realtimeStatus === 'connecting'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    realtimeStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : realtimeStatus === 'connecting'
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span>
                  {realtimeStatus === 'connected'
                    ? 'Realtime Kapcsolat Aktív'
                    : realtimeStatus === 'connecting'
                    ? 'Kapcsolódás...'
                    : 'Offline / Helyi Mód'}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  Supabase Backend Hitelesítés
                </span>
                <div className="text-sm font-semibold text-white flex items-center space-x-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`}
                  />
                  <span>
                    {isSupabaseLive
                      ? 'Éles Supabase Szerverkapcsolat'
                      : 'Helyi Perzisztens Mód (Supabase URL hiányzik)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isSupabaseLive
                    ? 'A feladatok, fájlok és szavazatok közvetlenül a PostgreSQL adatbázisba íródnak.'
                    : 'Környezeti változók (.env) beállítása után azonnal automatikusan átvált éles szinkronra.'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                <span className="text-[11px] font-mono uppercase text-slate-400">
                  PostgreSQL Triggerek & RLS
                </span>
                <div className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Automatizált SQL Adatbázis Triggerek</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verziószámozás (v2, v3...), Időpont-konszenzus kiértékelés és Mérföldkő % kalkuláció.
                </p>
              </div>
            </div>
          </div>

          {/* Record Counters */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-4">
            <h3 className="font-bold text-white text-sm">Aktuális Tábla Rekordszámok a Munkatérben</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-black text-rose-400 font-mono">{tasks.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Kanban Task</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-black text-amber-400 font-mono">{milestones.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Mérföldkő</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-black text-blue-400 font-mono">{repositoryFiles.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Fájl Verzió</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-black text-emerald-400 font-mono">{researchLogs.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Kutatási Napló</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-black text-purple-400 font-mono">{meetings.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Megbeszélés</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                <div className="text-xl font-black text-pink-400 font-mono">{literatureItems.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">Szakirodalom</div>
              </div>
            </div>
          </div>

          {/* Database Operations & Seed Card */}
          <div className="p-6 rounded-2xl bg-[#12141D] border border-[#1E2230] shadow-sm space-y-4">
            <h3 className="font-bold text-white text-sm">Adatbázis Műveletek & Mintatár Betöltése</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ha friss Supabase adatbázist kapcsoltál a rendszerhez, egyetlen gombnyomással feltöltheted
              a RED Lab kutatócsoport induló mintatárával (Robin, Emma és Domi feladatai, szakdolgozati mérföldkövei,
              CAD fájljai és laboratóriumi mérései).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => seedDatabase(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Kutatási Mintatár Feltöltése (Seed Database)</span>
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-2"
              >
                <span>Kijelentkezés a Fiókból</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

