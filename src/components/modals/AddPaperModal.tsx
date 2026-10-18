'use client';

import React from 'react';
import { AddLiteratureModal } from '@/components/literature/AddLiteratureModal';

interface AddPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPaperModal({ isOpen, onClose }: AddPaperModalProps) {
  return <AddLiteratureModal isOpen={isOpen} onClose={onClose} />;
}
