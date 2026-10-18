export interface DoiMetadataResult {
  title: string;
  authors: string;
  publication_year: number;
  journal: string;
  abstract: string;
  doi: string;
  bibtex_citation: string;
  url?: string;
}

/**
 * Extracts and cleans a DOI string from user inputs:
 * e.g., "https://doi.org/10.1038/s41586-020-2649-2" -> "10.1038/s41586-020-2649-2"
 */
export function cleanDoi(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .replace(/[#?].*$/, '')
    .trim();
}

/**
 * Formats authors and title into standard BibTeX entry:
 * @article{citeKey,
 *   author = {...},
 *   title = {{...}},
 *   journal = {...},
 *   year = {...},
 *   doi = {...}
 * }
 */
export function generateBibTeX(meta: {
  title: string;
  authors: string;
  journal: string;
  year: number | string;
  doi?: string;
}): string {
  const firstAuthor =
    meta.authors.split(',')[0].split(' and ')[0].trim().split(' ').pop()?.toLowerCase() || 'author';
  const cleanTitle = meta.title.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase() || 'paper';
  const citeKey = `${firstAuthor}${meta.year || 2024}${cleanTitle}`;

  return `@article{${citeKey},
  author = {${meta.authors || 'Unknown'}},
  title = {{${meta.title || 'Untitled'}}},
  journal = {${meta.journal || 'Journal'}},
  year = {${meta.year || 2024}},
  doi = {${meta.doi || ''}}
}`;
}

/**
 * Fetches paper metadata from Crossref REST API (or internal API route).
 * Automatically extracts title, authors, publication_year, journal, abstract and generates BibTeX.
 */
export async function fetchDoiMetadata(doiInput: string): Promise<DoiMetadataResult> {
  const cleaned = cleanDoi(doiInput);
  if (!cleaned) {
    throw new Error('Érvénytelen vagy üres DOI azonosító.');
  }

  // 1. Try internal Next.js API route first for caching & rate limit avoidance
  try {
    const apiRes = await fetch(`/api/doi?doi=${encodeURIComponent(cleaned)}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.title) {
        const bibtex = generateBibTeX({
          title: data.title,
          authors: data.authors,
          journal: data.journal,
          year: data.publication_year,
          doi: data.doi,
        });

        return {
          title: data.title,
          authors: data.authors,
          publication_year: data.publication_year,
          journal: data.journal,
          abstract: data.abstract || '',
          doi: data.doi,
          bibtex_citation: bibtex,
          url: data.url,
        };
      }
    }
  } catch (err) {
    console.warn('Internal DOI proxy notice, falling back to direct Crossref:', err);
  }

  // 2. Direct Crossref REST API fallback
  const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(cleaned)}`;
  const response = await fetch(crossrefUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`A Crossref nem talált publikációt a megadott DOI-hoz (${response.status})`);
  }

  const json = await response.json();
  const item = json.message;

  const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled';
  const journal = Array.isArray(item['container-title'])
    ? item['container-title'][0]
    : item['container-title'] || 'Scientific Journal';

  const authors =
    item.author && Array.isArray(item.author)
      ? item.author
          .map((a: any) => {
            if (a.given && a.family) return `${a.family}, ${a.given}`;
            if (a.name) return a.name;
            return a.family || a.given || 'Unknown';
          })
          .join(' and ')
      : 'Unknown Authors';

  let year = new Date().getFullYear();
  const dateParts =
    item.published?.['date-parts']?.[0] ||
    item['issued']?.['date-parts']?.[0] ||
    item['created']?.['date-parts']?.[0];
  if (dateParts && dateParts[0]) {
    year = Number(dateParts[0]);
  }

  let abstract = item.abstract || '';
  if (abstract) {
    abstract = abstract
      .replace(/<jats:[^>]+>/g, '')
      .replace(/<\/jats:[^>]+>/g, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  const bibtex = generateBibTeX({
    title,
    authors,
    journal,
    year,
    doi: item.DOI || cleaned,
  });

  return {
    title,
    authors,
    publication_year: year,
    journal,
    abstract,
    doi: item.DOI || cleaned,
    bibtex_citation: bibtex,
    url: item.URL || `https://doi.org/${cleaned}`,
  };
}
