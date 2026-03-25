import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskList } from './TaskList';
import { ProjectForm } from './ProjectForm';

export function Project({ project, members, filterPerson, showDone, user, isAdmin, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (editing) {
    return (
      <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <ProjectForm
          initialData={project}
          onSave={(data) => { onUpdate(data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${isDragging ? 'ring-2 ring-blue-400' : ''}`}>

      {/* Hlavička projektu */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-start gap-2">
          {isAdmin && (
            <button
              {...attributes}
              {...listeners}
              className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing mt-0.5"
              title="Přetáhnout"
            >
              ⠿
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-600 mt-0.5 text-xs transition-transform shrink-0"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            ▶
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-gray-900 text-base leading-snug">{project.name}</h2>
              <div className="flex items-center gap-1 shrink-0">
                {isAdmin && (
                  <>
                    <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Upravit projekt">
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Smazat projekt "${project.name}" a všechny jeho úkoly?`)) onDelete();
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                      title="Smazat projekt"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>

            {project.description && (
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{project.description}</p>
            )}

            {project.links?.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {project.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline hover:text-blue-800 transition-colors"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seznam úkolů */}
      {expanded && (
        <div className="bg-white px-4 py-3">
          <TaskList
            projectId={project.id}
            members={members}
            filterPerson={filterPerson}
            showDone={showDone}
            user={user}
          />
        </div>
      )}
    </div>
  );
}
