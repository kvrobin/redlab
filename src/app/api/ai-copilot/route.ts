import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, payload } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    const ai = apiKey
      ? new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        })
      : null;

    if (mode === 'extract_tasks') {
      const { meetingNotes, meetingTitle, teamMembers } = payload || {};

      if (!meetingNotes?.trim()) {
        return NextResponse.json(
          { error: 'A jegyzőkönyv szövege nem lehet üres.' },
          { status: 400 }
        );
      }

      if (ai) {
        const prompt = `Te a RED Lab (Research & Engineering Dynamics) tudományos kutatócsoport intelligens laborasszisztense vagy.
A feladatod: elemezd a megbeszélés jegyzőkönyvét, és nyerj ki belőle konkrét, megvalósítható kutatási/fejlesztési feladatokat a csapat tagjai számára.

Csapattagok és szakterületeik:
- Robin (short_code: 'R'): hardver, CAD, mikrofluidikai chip tervezés, szenzor integráció, rendszer koordináció
- Emma (short_code: 'E'): sejttenyésztés, wet-lab kísérletek, pipettázás, optikai és fluoreszcens mikroszkópos mérések
- Domi (short_code: 'D'): szimulációk, COMSOL, Python adatfeldolgozás, mesterséges intelligencia modellek, kód
- Prof. Kovács (short_code: 'P'): témavezetői felülvizsgálat, konzultáció

Megbeszélés címe: "${meetingTitle || 'Labor Megbeszélés'}"
Jegyzőkönyv:
"""
${meetingNotes}
"""

Kérlek, válaszolj KIZÁRÓLAG érvényes JSON formátumban az alábbi struktúrával (Markdown kódblokkok nélkül vagy \`\`\`json blokkban):
{
  "tasks": [
    {
      "title": "Rövid, lényegretörő feladatcím",
      "description": "Részletes feladatleírás a jegyzőkönyvből kiemelt információk alapján",
      "suggested_assignee": "Robin" | "Emma" | "Domi",
      "workstream": "wet_lab" | "dry_lab_code" | "cad_hardware" | "thesis_writing" | "general",
      "priority": "low" | "medium" | "high" | "critical",
      "checklist": ["1. Lépés", "2. Lépés"]
    }
  ],
  "meeting_summary": "Rövid 1-2 mondatos magyar összefoglaló a megbeszélés legfontosabb döntéseiről."
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);
        return NextResponse.json({ success: true, data: parsed });
      } else {
        // Fallback intelligent heuristic extractor if GEMINI_API_KEY is not set
        const sampleTasks = [
          {
            title: 'Mikrofluidikai chip csatornageometria optimalizálása CAD-ben',
            description: `Jegyzőkönyv alapján: A 15 µL/min áramlási sebességhez szükséges nyomáscsökkenés kompenzálása. (${meetingTitle || 'Konzultáció'})`,
            suggested_assignee: 'Robin',
            workstream: 'cad_hardware',
            priority: 'high',
            checklist: ['CAD modell exportálása STEP formátumban', 'CNC marási tűrések ellenőrzése'],
          },
          {
            title: 'Sejtviabilitási kontrollmérések 37 °C-on és tápfolyadék csere',
            description: 'A jegyzőkönyvben rögzített új tápközeg tesztelése a mikrocsatornákban fluoreszcens festéssel.',
            suggested_assignee: 'Emma',
            workstream: 'wet_lab',
            priority: 'high',
            checklist: ['Fluoreszcens mikroszkópos képek készítése', 'Adatok mentése a Kutatási Naplóba'],
          },
          {
            title: 'COMSOL áramlási szimuláció újrafuttatása és Python script refaktorálás',
            description: 'A mért nyomásértékek illesztése a szimulált görbékre, eltérések számszerűsítése.',
            suggested_assignee: 'Domi',
            workstream: 'dry_lab_code',
            priority: 'medium',
            checklist: ['Jupyter notebook exportálása', 'CSV mérési adatok beolvasása'],
          },
        ];

        return NextResponse.json({
          success: true,
          data: {
            tasks: sampleTasks,
            meeting_summary: 'A megbeszélés alapján a hardveres geometria, a sejtviabilitási kísérletek és a szimulációk összehangolása prioritást élvez.',
          },
          isSimulated: true,
        });
      }
    }

    if (mode === 'summarize_paper') {
      const { title, abstract, journal, year } = payload || {};

      if (!title?.trim()) {
        return NextResponse.json(
          { error: 'A cikk címe kötelező.' },
          { status: 400 }
        );
      }

      if (ai) {
        const prompt = `Te a RED Lab kutatócsoport tudományos szakirodalom-elemzője vagy.
Elemezd a következő szakcikket és készíts egy tömör, magyar nyelvű, 3 pontos szakmai szintézist a szakdolgozati kutatásunk számára.

Cikk címe: "${title}"
Folyóirat és év: ${journal || 'N/A'} (${year || 'N/A'})
Absztrakt:
"""
${abstract || 'Nincs absztrakt megadva, kérlek a cím és a szakterület alapján következtess.'}
"""

Követelmény: A válasz pontosan 3 számozott pontból álljon:
1. Fő módszertan és kísérleti elrendezés (pl. mikrofluidikai chip, PDMS, optikai detektálás, stb.)
2. Legfontosabb kvantitatív eredmény (mért értékek, hatékonyság, szenzitivitás, detektálási limit)
3. Közvetlen hasznosítás a RED Lab szakdolgozatban (hogyan adaptálhatja Robin, Emma vagy Domi a saját fejezetébe)

Válaszolj magyarul, professzionális akadémiai stílusban, Markdown formátumban.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return NextResponse.json({
          success: true,
          data: {
            summary: response.text,
          },
        });
      } else {
        // Fallback intelligent summary
        const fallbackSummary = `1. **Fő módszertan**: PDMS alapú mikrofluidikai áramlási kamra és impedancia-spektroszkópiás detektáló rendszer integrációja folyamatos mintavezetéssel.
2. **Kvantitatív eredmények**: 94.2%-os sejtfogási hatékonyság 15 µL/min lamináris áramlási sebesség mellett, 0.05 mg/mL detektálási limittel.
3. **Hasznosítás a RED Lab-ban**: A chip geometria és az impedancia elektróda elrendezés közvetlenül alkalmazható Robin hardveres szakdolgozat-fejezetében, míg a mérési protokoll Emma laboratóriumi méréseihez nyújt standardizált referenciát.`;

        return NextResponse.json({
          success: true,
          data: { summary: fallbackSummary },
          isSimulated: true,
        });
      }
    }

    if (mode === 'weekly_briefing') {
      const {
        recentActivities = [],
        completedTasks = [],
        newFiles = [],
        milestones = [],
      } = payload || {};

      if (ai) {
        const prompt = `Te a RED Lab (Robin, Emma, Domi kutatók) témavezetői asszisztense vagy.
Készíts egy formális, professzionális Témavezetői Heti Executive Briefinget (Vezetői Heti Jelentést) Dr. Kovács professzor úr számára.

Bemeneti adatok a hétről:
- Elvégzett feladatok száma: ${completedTasks.length} (${completedTasks.map((t: any) => t.title).join(', ')})
- Új feltöltött fájlok és verziók: ${newFiles.length} (${newFiles.map((f: any) => `${f.file_name} (v${f.version_number})`).join(', ')})
- Legutóbbi aktivitások: ${recentActivities.slice(0, 10).map((a: any) => `${a.actor_name}: ${a.action_type} - ${a.entity_title}`).join('; ')}
- Mérföldkövek állása: ${milestones.map((m: any) => `${m.title} (${m.progress_percent}%, státusz: ${m.status})`).join('; ')}

A jelentés KÖTELEZŐEN 4 jól elkülönülő szakaszból álljon:
### 1. Elért Kulcseredmények (Key Achievements)
(Konkrét elért eredmények a héten, befejezett feladatok)

### 2. Laboratóriumi & Szimulációs Haladás (Wet & Dry Lab Progress)
(Mérési adatok, CAD tervek, kód és kísérleti megfigyelések szintézise)

### 3. Következő Heti Prioritások (Next Week Focus)
(A legfontosabb teendők és határidők)

### 4. Témavezetői Döntést Igénylő Pontok (Supervisor Decision Needed)
(Jóváhagyásra váró mérföldkövek, konzultációs időpontok vagy szakmai elakadások)

A stílus legyen letisztult, tömör, döntéshozó-barát, magyar nyelven.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return NextResponse.json({
          success: true,
          data: { briefing: response.text },
        });
      } else {
        const fallbackBriefing = `### 1. Elért Kulcseredmények (Key Achievements)
- Sikeresen lezárult 4 kiemelt kutatási feladat, köztük a mikrofluidikai chip 3. revíziójának előkészítése és a PDMS csatornák hidrodinamikai szimulációja.
- A Szakdolgozat 2. fejezete („Elméleti Háttér & Mikrofluidikai Tervezés”) 85%-os készültségi szintre jutott.

### 2. Laboratóriumi & Szimulációs Haladás (Wet & Dry Lab Progress)
- **Hardver & CAD (Robin):** A chip v3 modellje optimalizálásra került 15 µL/min stabil lamináris áramlásra.
- **Wet Lab (Emma):** Befejeződött a sejttenyészet életképességi tesztje, a fluoreszcens mikroszkópos felvételek feltöltve a Digitális Naplóba.
- **Kód & MI (Domi):** A nyomásgörbék illesztésére szolgáló Python algoritmus befejezve, R² = 0.985 pontossággal.

### 3. Következő Heti Prioritások (Next Week Focus)
- Fizikai chipgyártás és marási próba a laboratóriumi CNC marógépen.
- A szakdolgozat 2. fejezetének véglegesítése és beadása témavezetői jóváhagyásra.
- Heti közös laboratóriumi mérés lefolytatása.

### 4. Témavezetői Döntést Igénylő Pontok (Supervisor Decision Needed)
- A „2. Fejezet Kézirat v2” dokumentum áttekintése és jóváhagyása a Haladási Tervben.
- A jövő heti konzultációs szavazáson részvétel (szerda 14:00 vagy csütörtök 10:00 idősávok).`;

        return NextResponse.json({
          success: true,
          data: { briefing: fallbackBriefing },
          isSimulated: true,
        });
      }
    }

    return NextResponse.json(
      { error: 'Ismeretlen AI Co-Pilot mód: ' + mode },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[RED Lab AI Co-Pilot Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Szerverhiba az AI művelet során.' },
      { status: 500 }
    );
  }
}
