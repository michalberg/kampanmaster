import { useState } from 'react';
import { getElectionCountdown } from '../lib/utils';
import { useQuickLinks } from '../hooks/useQuickLinks';

function formatCountdown(days) {
  const today = new Date();
  const day = today.getDate();
  const monthNames = ['ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'];
  const monthName = monthNames[today.getMonth()];
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  return { day, monthName, months, remainingDays };
}

export function Header({ user, onLogout }) {
  const [showLinks, setShowLinks] = useState(true);
  const { links } = useQuickLinks();
  const daysLeft = getElectionCountdown();
  const { day, monthName, months, remainingDays } = formatCountdown(daysLeft);

  return (
    <div className="bg-[#ede8dc] pt-4 pb-0 px-4">
      <div className="max-w-5xl mx-auto space-y-3">

        {/* Countdown card */}
        <div className="bg-blue-50 rounded-xl px-5 py-3 flex items-center">
          <div className="flex-1 text-center text-gray-700 text-sm">
            Dnes je {day}. {monthName}. Do voleb zbývá{' '}
            <strong>{daysLeft} dnů</strong>{' '}
            <span className="text-gray-500">({months} měsíců a {remainingDays} dnů)</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
            )}
            <span className="text-sm text-gray-600 hidden sm:block">{user.displayName}</span>
            <button
              onClick={onLogout}
              className="text-sm text-blue-600 underline hover:text-blue-800 transition-colors ml-1"
            >
              Odhlásit
            </button>
          </div>
        </div>

        {/* Rozcestník card */}
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3.5">
          <button
            onClick={() => setShowLinks(!showLinks)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
              📌 Rozcestník
            </span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {showLinks && links.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-1">
              {links.map((group, gi) => (
                <div key={gi} className="flex items-center flex-wrap gap-x-2 gap-y-1.5">
                  {group.category && (
                    <span className="text-sm font-semibold text-gray-700">{group.category}:</span>
                  )}
                  {group.links.map((link, li) => (
                    <a
                      key={li}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline hover:text-blue-800 transition-colors whitespace-nowrap"
                    >
                      {link.title}
                    </a>
                  ))}
                  {gi < links.length - 1 && (
                    <span className="text-gray-300 mx-1 select-none">|</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
