import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RED Lab Research OS',
    short_name: 'RED Lab',
    description: 'Zártkörű tudományos kutatócsoporti kollaborációs és szakdolgozat-menedzsment platform',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#090A0F',
    theme_color: '#E11D48',
    orientation: 'any',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
