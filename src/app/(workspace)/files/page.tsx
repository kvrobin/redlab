'use client';

import React, { useState } from 'react';
import { FileManager } from '@/components/files/FileManager';
import { AddFileModal } from '@/components/modals/AddFileModal';

export default function FilesPage() {
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  return (
    <>
      <FileManager openAddFileModal={() => setIsFileModalOpen(true)} />
      <AddFileModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
      />
    </>
  );
}
