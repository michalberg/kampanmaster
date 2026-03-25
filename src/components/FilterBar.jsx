export function FilterBar({ members, filterPerson, setFilterPerson, showDone, setShowDone, currentUserName }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() => setFilterPerson(filterPerson === currentUserName ? null : currentUserName)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          filterPerson === currentUserName
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        Jen moje úkoly
      </button>

      <select
        value={filterPerson || ''}
        onChange={e => setFilterPerson(e.target.value || null)}
        className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Všichni</option>
        {members.map(m => (
          <option key={m.email} value={m.name}>{m.name}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
        <input
          type="checkbox"
          checked={showDone}
          onChange={e => setShowDone(e.target.checked)}
          className="w-4 h-4"
        />
        Zobrazit i hotové
      </label>
    </div>
  );
}
