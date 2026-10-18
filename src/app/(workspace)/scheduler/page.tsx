'use client';

import React, { useState } from 'react';
import { SchedulerView } from '@/components/scheduler/SchedulerView';
import { CreateMeetingModal } from '@/components/scheduler/CreateMeetingModal';

export default function SchedulerPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <SchedulerView openAddPollModal={() => setIsModalOpen(true)} />
      <CreateMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
