'use client';

import React from 'react';
import { CreateMeetingModal } from '@/components/scheduler/CreateMeetingModal';

interface AddPollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPollModal({ isOpen, onClose }: AddPollModalProps) {
  return <CreateMeetingModal isOpen={isOpen} onClose={onClose} />;
}
