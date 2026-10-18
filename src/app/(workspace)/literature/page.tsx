'use client';

import React, { useState } from 'react';
import { LiteratureManager } from '@/components/literature/LiteratureManager';
import { AddLiteratureModal } from '@/components/literature/AddLiteratureModal';

export default function LiteraturePage() {
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  return (
    <>
      <LiteratureManager openAddPaperModal={() => setIsPaperModalOpen(true)} />
      <AddLiteratureModal
        isOpen={isPaperModalOpen}
        onClose={() => setIsPaperModalOpen(false)}
      />
    </>
  );
}
