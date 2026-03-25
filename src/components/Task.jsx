import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskTooltip } from './TaskTooltip';
import { formatDate, isOverdue, isDueSoon } from '../lib/utils';

const TAG_STYLES = {
  'důležité': 'bg-red-100 text-red-700',
  'čeká se': 'bg-yellow-100 text-yellow-700',
  'nízká priorita': 'bg-gray-100 text-gray-600',
};

function detectUrls(text) {
  if (!text) return text;
  const regex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part.match(regex)) {
      let display = part;
      try {
        display = new URL(part).hostname.replace('www.', '');
      } catch {}
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{display}</a>;
    }
    return part;
  });
}

export function Task({ task, projectId, onToggle, onEdit, onDelete }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const overdue = isOverdue(task.deadline) && !task.done;
  const dueSoon = isDueSoon(task.deadline) && !task.done;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start py-1.5 border-b border-gray-100 group last:border-0 ${isDragging ? 'bg-blue-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mr-2 mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ⠿
      </button>

      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
        className="mr-3 mt-1 w-4 h-4 cursor-pointer accent-blue-600"
      />

      <div className="flex-1 min-w-0">
        <div
          onClick={onEdit}
          className={`text-sm leading-relaxed cursor-pointer hover:text-blue-600 transition-colors ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}
        >
          {detectUrls(task.text)}
        </div>

        {(task.people?.length > 0 || task.tag || task.deadline) && (
          <div className="mt-0.5 flex flex-row flex-wrap gap-x-2 gap-y-0.5 items-center text-xs">
            {task.people?.length > 0 && (
              <span className="text-gray-400">👤 {task.people.join(', ')}</span>
            )}
            {task.tag && (
              <span className={`px-1.5 py-0 rounded font-medium ${TAG_STYLES[task.tag] || 'bg-gray-100 text-gray-600'}`}>
                {task.tag}
              </span>
            )}
            {task.deadline && (
              <span className={`flex items-center gap-0.5 ${overdue ? 'text-red-600 font-medium' : dueSoon ? 'text-amber-600' : 'text-gray-400'}`}>
                📅 {formatDate(task.deadline)}
                {overdue && <span>(!!!)</span>}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Upravit">
          ✏️
        </button>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors" title="Smazat">
          🗑️
        </button>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            title="Metadata"
          >
            ℹ️
          </button>
          {showTooltip && (
            <TaskTooltip
              createdAt={task.createdAt}
              createdByName={task.createdByName}
              updatedAt={task.updatedAt}
              updatedByName={task.updatedByName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
