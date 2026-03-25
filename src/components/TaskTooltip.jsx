import { formatDateTime } from '../lib/utils';

export function TaskTooltip({ createdAt, createdByName, updatedAt, updatedByName }) {
  return (
    <div className="absolute right-0 top-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 text-xs">
      <div className="mb-2">
        <span className="text-gray-500">Vytvořeno:</span>
        <div className="text-gray-800 font-medium">
          {createdByName || 'Neznámý'} · {formatDateTime(createdAt)}
        </div>
      </div>
      {updatedAt && (
        <div>
          <span className="text-gray-500">Naposledy upraveno:</span>
          <div className="text-gray-800 font-medium">
            {updatedByName || 'Neznámý'} · {formatDateTime(updatedAt)}
          </div>
        </div>
      )}
    </div>
  );
}
