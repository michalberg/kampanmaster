import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatDate } from '../lib/utils';

export function Alerts({ user }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const loadAlerts = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDays = new Date(today);
      threeDays.setDate(today.getDate() + 3);

      const todayStr = today.toISOString().split('T')[0];
      const threeDaysStr = threeDays.toISOString().split('T')[0];

      try {
        // We need to query all tasks across all projects
        // Use collectionGroup query
        const q = query(
          collectionGroup(db, 'tasks'),
          where('done', '==', false),
          where('deadline', '>=', todayStr),
          where('deadline', '<=', threeDaysStr)
        );
        const snapshot = await getDocs(q);
        const myAlerts = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(t => t.peopleEmails?.includes(user.email));
        setAlerts(myAlerts);
      } catch (e) {
        console.error('Alerts error:', e);
      }
    };

    loadAlerts();
  }, [user]);

  if (alerts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-amber-800 mb-2">
        ⚠️ Blíží se termíny ({alerts.length})
      </h3>
      <div className="space-y-1">
        {alerts.map(t => (
          <div key={t.id} className="text-sm text-amber-700">
            • <strong>{t.text?.substring(0, 60)}{t.text?.length > 60 ? '...' : ''}</strong> — {formatDate(t.deadline)}
          </div>
        ))}
      </div>
    </div>
  );
}
