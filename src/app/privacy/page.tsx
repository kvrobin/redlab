'use client';

import React from 'react';
import Link from 'next/link';
import { RedLabLogo } from '@/components/brand/RedLabLogo';
import {
  ShieldCheck,
  ArrowLeft,
  Printer,
  Mail,
  User,
  Building,
  Server,
  Lock,
  Calendar,
  FileText,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function PrivacyPage() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col justify-between relative selection:bg-rose-500/30 selection:text-rose-200 font-sans">
      {/* Background ambient lighting and micro-grid */}
      <div className="fixed inset-0 pointer-events-none bg-scientific-grid opacity-60" />
      <div className="fixed top-[-10rem] left-1/2 -translate-x-1/2 w-[70rem] h-[35rem] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(225,29,72,0.18),transparent)] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full border-b border-[#1E2230]/80 bg-[#0E1017]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/login" className="flex items-center space-x-3 group">
            <RedLabLogo variant="full" size="md" />
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all shadow-sm"
              title="Nyomtatás vagy mentés PDF formátumban"
            >
              <Printer className="w-3.5 h-3.5 text-rose-400" />
              <span>Nyomtatás / PDF</span>
            </button>

            <Link
              href="/login"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Vissza a belépéshez</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 my-4 flex-1">
        <div className="red-glass-card p-6 sm:p-10 border border-[#1E2230] shadow-2xl space-y-8">
          {/* Header Title Banner */}
          <div className="border-b border-slate-800 pb-6 space-y-3">
            <div className="flex items-center space-x-2.5">
              <span className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-400">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                  EU GDPR & Infotv. Megfelelőségi Dokumentum
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  ADATKEZELÉSI TÁJÉKOZTATÓ ÉS FELHASZNÁLÁSI FELTÉTELEK
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono">
              RED Lab — Tudományos Kutatási és Szakdolgozat Kollaborációs Platform
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
              <span>Hatályos: 2026. január 1-től visszavonásig</span>
              <span>•</span>
              <span>Verzió: Béta</span>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm tracking-wide uppercase">
              <User className="w-4 h-4" />
              <h2>1. Az Adatkezelő (Weboldal Üzemeltetője) Adatai</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Jelen Adatkezelési Tájékoztató a <strong>RED Lab</strong> zártkörű tudományos kutatási platform
              használatára és az ahhoz kapcsolódó adatkezelési folyamatokra terjed ki, az Európai Parlament és a
              Tanács (EU) 2016/679 rendelete (Általános Adatvédelmi Rendelet, a továbbiakban: <strong>GDPR</strong>),
              valamint az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII.
              törvény (<strong>Infotv.</strong>) alapján.
            </p>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2 text-xs sm:text-sm font-mono">
              <div>
                <span className="text-slate-400">Üzemeltető és Adatkezelő neve: </span>
                <strong className="text-white">Kun Viktor Robin</strong> (magánszemély / kutató hallgató)
              </div>
              <div>
                <span className="text-slate-400">Kapcsolattartási és adatvédelmi e-mail cím: </span>
                <a
                  href="mailto:kv.robin@yahoo.com"
                  className="text-rose-400 hover:text-rose-300 underline font-bold"
                >
                  kv.robin@yahoo.com
                </a>
              </div>
              <div>
                <span className="text-slate-400">A platform jellege: </span>
                <span className="text-slate-200">
                  Zártkörű, nem kereskedelmi célú tudományos kutatási és szakdolgozat-menedzsment
                  webalkalmazás.
                </span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm tracking-wide uppercase">
              <FileText className="w-4 h-4" />
              <h2>2. A Kezelt Személyes Adatok Köre, Célja és Jogalapja (GDPR 6. cikk)</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Az Adatkezelő kizárólag a kutatócsoporti együttműködés megvalósításához és a szakdolgozati munka
              dokumentálásához szükséges minimális adatmennyiséget kezeli (adattakarékosság elve).
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    A) Regisztrációs és profiladatok
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    GDPR 6. cikk (1) a) & b)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Kezelt adatok:</strong> Teljes név, e-mail cím, titkosított jelszó (bcrypt/argon2 hash),
                  kutatói vagy témavezetői szerepkör (<code>researcher</code> / <code>supervisor</code>), rövid
                  monogram-jelvénykód (pl. R, E, D, P), választott jelvényszín, valamint szakterület (pl. wet-lab,
                  hardver, szimuláció).
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Adatkezelés célja:</strong> A felhasználók zártkörű azonosítása, a munkatér jogosultságainak
                  érvényesítése, a kutatói és témavezetői feladatmegosztás koordinációja.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                    B) Kollaborációs és kutatási tevékenység adatai
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    GDPR 6. cikk (1) f) Jogos érdek
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Kezelt adatok:</strong> Létrehozott Kanban feladatok, feltöltött kézirat- és forráskód
                  fájlok verziótörténete, mérföldkövek teljesülési százaléka, konzultációs időpont-szavazatok és
                  jegyzőkönyvek, kutatási mérési naplóbejegyzések és időbélyegek.
                </p>
                <p className="text-xs text-slate-400">
                  <strong>Adatkezelés célja:</strong> A kutatási projekt transzparens, valós idejű közös haladása és a
                  szakdolgozati eredmények szisztematikus archiválása.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    C) Technikai munkamenet-adatok és Sütik (Cookies)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Kizárólag funkcionális
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A RED Lab platform <strong>nem alkalmaz</strong> harmadik féltől származó reklám-, marketing- vagy
                  viselkedésalapú profilozó nyomkövető sütiket (tracking cookies). Kizárólag a bejelentkezett
                  állapot fenntartásához szükséges titkosított munkamenet-sütiket (Supabase Auth JWT tokenek) és
                  a választott vizuális téma tárolását használja.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm tracking-wide uppercase">
              <Server className="w-4 h-4" />
              <h2>3. Igénybe Vett Adatfeldolgozók (Tárhely és Infrastruktúra)</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A platform megbízható, iparági szabványú felhőszolgáltatókat vesz igénybe, amelyek garantálják az
              Európai Unió adatvédelmi elvárásainak való maradéktalan megfelelést (Standard Contractual Clauses / Data
              Privacy Framework):
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Vercel Inc.</span>
                  <span className="text-[10px] font-mono text-slate-400">Frontend & Edge</span>
                </div>
                <p className="text-slate-300">
                  <strong>Székhely:</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA
                </p>
                <p className="text-slate-400">
                  <strong>Feladat:</strong> Webalkalmazás kiszolgálása, Next.js hoszting és SSL titkosítás.
                </p>
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  Adatvédelmi Nyilatkozat <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">Supabase Inc.</span>
                  <span className="text-[10px] font-mono text-slate-400">Adatbázis & Auth</span>
                </div>
                <p className="text-slate-300">
                  <strong>Székhely:</strong> 970 Toa Payoh North #07-04, Singapore 318992 (Adatközpont: AWS EU-Central)
                </p>
                <p className="text-slate-400">
                  <strong>Feladat:</strong> Relációs adatbázis, valós idejű WebSocket szinkron és hitelesítés.
                </p>
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                >
                  Adatvédelmi Nyilatkozat <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm tracking-wide uppercase">
              <Calendar className="w-4 h-4" />
              <h2>4. Adatmegőrzési Időtartam</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Az Adatkezelő a személyes adatokat kizárólag a kutatási feladatok végrehajtásáig, a diplomamunka /
              szakdolgozat sikeres egyetemi megvédéséig, illetve legkésőbb a felhasználói fiók törlésének kérelmezéséig
              őrzi meg. A projekt lezárultával a nem archiválandó személyes adatok véglegesen törlésre vagy
              anonimizálásra kerülnek.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm tracking-wide uppercase">
              <Lock className="w-4 h-4" />
              <h2>5. Az Érintettek Jogai és Jogorvoslati Lehetőségek</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A GDPR rendelkezései szerint Ön mint érintett bármikor jogosult az alábbi jogok gyakorlására:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>• Hozzáférés és tájékoztatás (GDPR 15. cikk):</strong> Tájékoztatást kérhet arról, milyen
                adatait kezeljük.
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>• Helyesbítés joga (GDPR 16. cikk):</strong> Pontatlan adatainak azonnali kijavítását kérheti.
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>• Törléshez való jog („elfeledtetés”, GDPR 17. cikk):</strong> Fiókja és adatai végleges
                törlését kérheti.
              </li>
              <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                <strong>• Adathordozhatóság (GDPR 20. cikk):</strong> Kérheti a feltöltött kutatási adatainak géppel
                olvasható (JSON/CSV) exportját.
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs sm:text-sm mt-3">
              <h3 className="font-bold text-white flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-rose-400" />
                Kérelmek benyújtása és intézkedési határidő:
              </h3>
              <p className="text-slate-300">
                A fenti jogok bármelyikének érvényesítését közvetlenül a{' '}
                <a href="mailto:kv.robin@yahoo.com" className="text-rose-400 underline font-bold">
                  kv.robin@yahoo.com
                </a>{' '}
                e-mail címre küldött nyilatkozattal kezdeményezheti. Az Adatkezelő a kérelmet indokolatlan késedelem
                nélkül, legfeljebb <strong>15 naptári napon belül</strong> teljesíti és visszaigazolja.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-400 mt-2">
              <h3 className="font-bold text-slate-200">Felügyeleti Hatósági Jogorvoslat:</h3>
              <p>
                Amennyiben úgy ítéli meg, hogy az adatkezelés megsértette a hatályos jogszabályokat, panasszal fordulhat a
                Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH):
              </p>
              <div className="font-mono text-[11px] text-slate-300 space-y-0.5">
                <div>Cím: 1055 Budapest, Falk Miksa utca 9-11.</div>
                <div>Postacím: 1363 Budapest, Pf.: 9.</div>
                <div>Web: https://www.naih.hu | E-mail: ugyfelszolgalat@naih.hu</div>
              </div>
            </div>
          </section>

          {/* Bottom Call to Action */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/login"
              className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Visszatérés a bejelentkező felületre
            </Link>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-700"
            >
              <Printer className="w-4 h-4 text-rose-400" />
              <span>Nyomtatás / Mentés PDF-ként</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-[#1E2230]/70 py-6 text-center text-xs font-mono text-slate-500">
        <p>© 2026 RED Lab</p>
      </footer>
    </div>
  );
}
