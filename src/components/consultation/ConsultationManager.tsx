'use client';

import React from 'react';
import { SchedulerView } from '@/components/scheduler/SchedulerView';

interface ConsultationManagerProps {
  openAddPollModal?: () => void;
}

export function ConsultationManager({ openAddPollModal }: ConsultationManagerProps) {
  return <SchedulerView openAddPollModal={openAddPollModal} />;
}
