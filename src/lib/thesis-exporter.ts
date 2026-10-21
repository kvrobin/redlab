/**
 * RED Lab - Thesis & TDK Studio Exporter
 * Generates LaTeX (Overleaf-ready) and Markdown thesis compilations
 */

import { ResearchLog, RepositoryFile, LiteratureItem, ThesisFigureMapping } from '@/types/database';

interface ThesisExportOptions {
  title?: string;
  subtitle?: string;
  author?: string;
  supervisor?: string;
  institution?: string;
  year?: string;
}

/**
 * Escapes special LaTeX characters in plain text
 */
export function escapeLatex(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([%$&#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Clean BibTeX citation generator
 */
export function generateBibtex(
  linkedLitIds: string[],
  allLiterature: LiteratureItem[]
): string {
  const citedPapers = allLiterature.filter((item) =>
    linkedLitIds.includes(item.id)
  );

  if (citedPapers.length === 0) {
    return `% RED Lab BibTeX Reference Library\n% Nincsenek még csatolt hivatkozások a fejezetekhez.\n`;
  }

  const bibEntries = citedPapers.map((paper) => {
    if (paper.bibtex_citation && paper.bibtex_citation.trim().startsWith('@')) {
      return paper.bibtex_citation.trim();
    }

    // Fallback: construct standard @article entry
    const firstAuthor = (paper.authors || 'Unknown')
      .split(',')[0]
      .split(' ')[0]
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase();
    const year = paper.publication_year || new Date().getFullYear();
    const cleanKey = `${firstAuthor || 'ref'}${year}`;

    return `@article{${cleanKey},
  author    = {${paper.authors || 'Ismeretlen Szerző'}},
  title     = {{${paper.title}}},
  journal   = {${paper.journal || 'RED Lab Research Archive'}},
  year      = {${year}},
  doi       = {${paper.doi || ''}},
  url       = {${paper.external_url || ''}}
}`;
  });

  return `% ==============================================================================
% RED Lab - Thesis & TDK Bibliográfia (BibTeX)
% Generálva: ${new Date().toLocaleDateString('hu-HU')}
% ==============================================================================

${bibEntries.join('\n\n')}
`;
}

/**
 * Generates a complete, Overleaf-ready LaTeX document (Hungarian thesis format)
 */
export function generateLatexThesis(
  chapters: ResearchLog[],
  allFiles: RepositoryFile[],
  allLiterature: LiteratureItem[],
  options: ThesisExportOptions = {}
): string {
  const {
    title = 'Mikrofluidikai Rendszerek és In Vitro Szövetmodellek Numerikus Vizsgálata',
    subtitle = 'Diplomamunka / Tudományos Diákköri (TDK) Dolgozat',
    author = 'Kun Viktor Robin',
    supervisor = 'Prof. Dr. Kovács Gergely',
    institution = 'RED Lab Kutatócsoport • 2026',
    year = '2026',
  } = options;

  // Sort chapters by chapter_number from parameters_json
  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = (a.parameters_json?.chapter_number as number) ?? 99;
    const numB = (b.parameters_json?.chapter_number as number) ?? 99;
    return numA - numB;
  });

  // Collect all unique literature IDs
  const allLinkedLitIds = Array.from(
    new Set(
      sortedChapters.flatMap(
        (c) => (c.parameters_json?.linked_literature_ids as string[]) || []
      )
    )
  );

  let latexBody = '';

  sortedChapters.forEach((ch) => {
    const meta = ch.parameters_json || {};
    const chapterTitle = ch.title.replace(/^\d+[\.\s]*/, ''); // strip leading numbering for LaTeX \chapter
    const figMappings: ThesisFigureMapping[] = meta.figure_mappings || [];
    const content = ch.content_markdown || '';

    latexBody += `\n% ------------------------------------------------------------------------------\n`;
    latexBody += `% FEJEZET: ${ch.title}\n`;
    latexBody += `% ------------------------------------------------------------------------------\n`;
    latexBody += `\\chapter{${chapterTitle || ch.title}}\n`;
    latexBody += `\\label{chap:${(meta.chapter_number || 'ch').toString()}}\n\n`;

    // Process markdown paragraphs into LaTeX text
    const paragraphs = content.split('\n\n');
    paragraphs.forEach((p) => {
      const trimmed = p.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('### ')) {
        latexBody += `\\subsubsection{${trimmed.replace(/^###\s+/, '')}}\n\n`;
      } else if (trimmed.startsWith('## ')) {
        latexBody += `\\subsection{${trimmed.replace(/^##\s+/, '')}}\n\n`;
      } else if (trimmed.startsWith('# ')) {
        latexBody += `\\section{${trimmed.replace(/^#\s+/, '')}}\n\n`;
      } else {
        // Regular paragraph
        latexBody += `${trimmed}\n\n`;
      }
    });

    // Append Figures registered to this chapter
    if (figMappings.length > 0) {
      latexBody += `\n% Csatolt Fejezeti Ábrák\n`;
      figMappings.forEach((fig) => {
        const file = allFiles.find((f) => f.id === fig.file_id || f.file_group_key === fig.file_group_key);
        const fileName = file?.file_name || `${fig.file_group_key || 'abra'}.png`;

        latexBody += `\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.88\\linewidth]{figures/${fileName}}
  \\caption{${fig.caption || 'Ábra leírása.'}}
  \\label{${fig.latex_label || `fig:${fig.figure_number.replace(/\./g, '_')}`}}
\\end{figure}\n\n`;
      });
    }
  });

  return `% ==============================================================================
% RED Lab - Thesis & TDK LaTeX Dokumentum Vázlat
% Készült: ${new Date().toLocaleDateString('hu-HU')}
% Kompatibilitás: TeXLive, Overleaf (pdfLaTeX / XeLaTeX)
% ==============================================================================

\\documentclass[12pt,a4paper,oneside]{report}

% Nyelvi és karakterkódolási csomagok
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[magyar]{babel}

% Tipográfia és grafika
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{geometry}
\\geometry{a4paper, left=35mm, right=25mm, top=25mm, bottom=25mm}
\\usepackage{setspace}
\\onehalfspacing

% Hivatkozások és hivatkozásstílus
\\usepackage[numbers,sort&compress]{natbib}
\\usepackage{hyperref}
\\hypersetup{
    colorlinks=true,
    linkcolor=red!70!black,
    citecolor=blue!70!black,
    urlcolor=teal
}

% Címlap Adatok
\\title{${title}\\\\ \\large ${subtitle}}
\\author{${author}}
\\date{${institution} • ${year}}

\\begin{document}

\\maketitle

% Tartalomjegyzék
\\tableofcontents
\\clearpage

${latexBody}

% Bibliográfia
\\bibliographystyle{unsrtnat}
\\bibliography{references}

\\end{document}
`;
}

/**
 * Generates formatted combined Markdown document for Word / Typora export
 */
export function generateMarkdownThesis(
  chapters: ResearchLog[],
  allFiles: RepositoryFile[],
  allLiterature: LiteratureItem[],
  options: ThesisExportOptions = {}
): string {
  const {
    title = 'RED Lab – Szakdolgozat és TDK Kézirat',
    subtitle = 'Mikrofluidikai Rendszerek & Vér-Agy Gát Chip Elemzés',
    author = 'Kun Viktor Robin',
    supervisor = 'Prof. Dr. Kovács Gergely',
    year = '2026',
  } = options;

  const sortedChapters = [...chapters].sort((a, b) => {
    const numA = (a.parameters_json?.chapter_number as number) ?? 99;
    const numB = (b.parameters_json?.chapter_number as number) ?? 99;
    return numA - numB;
  });

  let md = `# ${title}\n\n## ${subtitle}\n\n`;
  md += `**Szerző:** ${author}  \n`;
  md += `**Témavezető:** ${supervisor}  \n`;
  md += `**Intézmény & Év:** RED Lab • ${year}  \n`;
  md += `**Generálás Dátuma:** ${new Date().toLocaleDateString('hu-HU')}  \n\n`;
  md += `---\n\n## Tartalomjegyzék\n\n`;

  sortedChapters.forEach((ch, idx) => {
    const num = ch.parameters_json?.chapter_number ?? idx + 1;
    md += `${num}. [${ch.title}](#${ch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')})\n`;
  });

  md += `\n---\n\n`;

  sortedChapters.forEach((ch) => {
    const meta = ch.parameters_json || {};
    const figMappings: ThesisFigureMapping[] = meta.figure_mappings || [];
    const litIds: string[] = meta.linked_literature_ids || [];

    md += `\n# ${ch.title}\n\n`;
    md += `*Felelős: ${meta.assigned_to_code || 'R'} • Státusz: ${meta.status || 'in_progress'} • Célszó: ${meta.target_word_count || 2000}*\n\n`;
    md += `${ch.content_markdown || '_Ehhez a fejezethez még nem készült vázlat._'}\n\n`;

    if (figMappings.length > 0) {
      md += `### Csatolt Ábrák:\n\n`;
      figMappings.forEach((fig) => {
        const file = allFiles.find((f) => f.id === fig.file_id || f.file_group_key === fig.file_group_key);
        md += `> **${fig.figure_number}. Ábra:** ${fig.caption}  \n`;
        md += `> *Fájl:* \`${file?.file_name || fig.file_group_key}\` (rögzített verzió: v${fig.pinned_version}) — *LaTeX címke:* \`\\label{${fig.latex_label}}\`\n\n`;
      });
    }

    if (litIds.length > 0) {
      md += `### Hivatkozott Szakirodalom:\n\n`;
      litIds.forEach((id) => {
        const lit = allLiterature.find((l) => l.id === id);
        if (lit) {
          md += `- **${lit.authors} (${lit.publication_year || 'é.n.'})**: *${lit.title}*. ${lit.journal || ''}${lit.doi ? ` DOI: [${lit.doi}](https://doi.org/${lit.doi})` : ''}\n`;
        }
      });
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Browser download helper for text files
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
