'use client';

import React, { useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { AddTaskModal } from '@/components/modals/AddTaskModal';

export default function KanbanPage() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <>
      <KanbanBoard openAddTaskModal={() => setIsTaskModalOpen(true)} />
      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
    </>
  );
}
