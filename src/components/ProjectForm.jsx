import { useState } from 'react';

export function ProjectForm({ onSave, onCancel, initialData = {} }) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [links, setLinks] = useState(initialData.links || []);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const addLink = () => {
    if (linkTitle && linkUrl) {
      setLinks([...links, { title: linkTitle, url: linkUrl }]);
      setLinkTitle('');
      setLinkUrl('');
    }
  };

  const removeLink = (i) => setLinks(links.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    // Automaticky přidej nedokončený odkaz pokud má alespoň URL
    const finalLinks = [...links];
    if (linkUrl.trim()) {
      finalLinks.push({ title: linkTitle.trim() || linkUrl.trim(), url: linkUrl.trim() });
    }
    onSave({ name: name.trim(), description: description.trim(), links: finalLinks });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Název projektu *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Název projektu"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Krátký popis projektu..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Odkazy</label>
        {links.map((link, i) => (
          <div key={i} className="flex items-center gap-2 mb-1 text-sm">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex-1 truncate">
              {link.title}
            </a>
            <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={linkTitle}
            onChange={e => setLinkTitle(e.target.value)}
            placeholder="Název odkazu"
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={addLink} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm">+ Přidat</button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Zrušit</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Uložit</button>
      </div>
    </form>
  );
}
