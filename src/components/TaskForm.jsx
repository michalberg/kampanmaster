import { useState } from 'react';
import { Autocomplete } from './Autocomplete';

const TAGS = ['', 'důležité', 'čeká se', 'nízká priorita'];

export function TaskForm({ members, onSave, onCancel, initialData = {} }) {
  const [text, setText] = useState(initialData.text || '');
  const [people, setPeople] = useState(initialData.people || []);
  const [tag, setTag] = useState(initialData.tag || '');
  const [deadline, setDeadline] = useState(initialData.deadline || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const peopleEmails = people.map(name => {
      const member = members.find(m => m.name === name);
      return member?.email || '';
    }).filter(Boolean);

    onSave({ text: text.trim(), people, peopleEmails, tag, deadline: deadline || null });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Popis úkolu..."
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />

      <Autocomplete members={members} selected={people} onChange={setPeople} />

      <div className="flex gap-2">
        <select
          value={tag}
          onChange={e => setTag(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TAGS.map(t => (
            <option key={t} value={t}>{t || 'Bez priority'}</option>
          ))}
        </select>

        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
          Zrušit
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Uložit
        </button>
      </div>
    </form>
  );
}
