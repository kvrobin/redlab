import { Metadata } from 'next';
import { ThesisStudioClient } from '@/components/thesis/ThesisStudioClient';

export const metadata: Metadata = {
  title: 'Thesis & TDK Studio | RED Lab',
  description: 'Interaktív fejezet-építő, ábra/cikk mátrix és LaTeX/Overleaf exportáló',
};

export default function ThesisStudioPage() {
  return <ThesisStudioClient />;
}
