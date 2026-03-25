import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Project } from './Project';

export function ProjectList({ projects, members, filterPerson, showDone, user, isAdmin, onUpdate, onDelete, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    onReorder(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {projects.map(project => (
            <Project
              key={project.id}
              project={project}
              members={members}
              filterPerson={filterPerson}
              showDone={showDone}
              user={user}
              isAdmin={isAdmin}
              onUpdate={(data) => onUpdate(project.id, data)}
              onDelete={() => onDelete(project.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
