import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawDoi = searchParams.get('doi');

  if (!rawDoi) {
    return NextResponse.json({ error: 'Missing DOI parameter' }, { status: 400 });
  }

  // Clean DOI string
  const cleanDoi = rawDoi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '')
    .trim();

  try {
    const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'REDLab-Platform/1.0 (mailto:Kun.V.Robin@gmail.com; https://redlab.research)',
        Accept: 'application/json',
      },
      next: { revalidate: 86400 }, // cache for 24h
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Crossref API returned ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const item = data.message;

    // Parse authors
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

    // Parse publication year
    let year = new Date().getFullYear();
    const dateParts =
      item.published?.['date-parts']?.[0] ||
      item['issued']?.['date-parts']?.[0] ||
      item['created']?.['date-parts']?.[0];
    if (dateParts && dateParts[0]) {
      year = Number(dateParts[0]);
    }

    // Clean abstract
    let abstract = item.abstract || '';
    if (abstract) {
      abstract = abstract
        .replace(/<jats:[^>]+>/g, '')
        .replace(/<\/jats:[^>]+>/g, '')
        .replace(/<[^>]+>/g, '')
        .trim();
    }

    const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled';
    const journal = Array.isArray(item['container-title'])
      ? item['container-title'][0]
      : item['container-title'] || 'Scientific Journal';

    return NextResponse.json({
      success: true,
      doi: item.DOI || cleanDoi,
      title,
      authors,
      publication_year: year,
      journal,
      abstract,
      url: item.URL || `https://doi.org/${cleanDoi}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch DOI metadata from Crossref' },
      { status: 500 }
    );
  }
}
