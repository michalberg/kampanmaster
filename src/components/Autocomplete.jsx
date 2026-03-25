import { useState, useRef, useEffect } from 'react';

export function Autocomplete({ members, selected, onChange }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = members.filter(
    m => !selected.includes(m.name) &&
    m.name.toLowerCase().includes(input.toLowerCase())
  );

  const add = (name) => {
    onChange([...selected, name]);
    setInput('');
    setOpen(false);
  };

  const remove = (name) => {
    onChange(selected.filter(n => n !== name));
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap gap-1 p-2 border border-gray-300 rounded-lg min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {selected.map(name => (
          <span key={name} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
            {name}
            <button onClick={() => remove(name)} className="hover:text-blue-600 font-bold">×</button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? 'Přiřadit osobu...' : ''}
          className="flex-1 outline-none text-sm min-w-[120px] bg-transparent"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filtered.map(m => (
            <button
              key={m.email}
              onClick={() => add(m.name)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                {m.name[0]}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
