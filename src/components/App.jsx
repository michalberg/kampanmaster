import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { Login } from './Login';
import { Header } from './Header';
import { Alerts } from './Alerts';
import { FilterBar } from './FilterBar';
import { ProjectList } from './ProjectList';
import { ProjectForm } from './ProjectForm';

export default function App() {
  const { user, loading, accessDenied, isAdmin, login, logout } = useAuth();
  const { projects, addProject, updateProject, deleteProject, reorderProjects } = useProjects(user);
  const { members } = useTeamMembers();
  const [filterPerson, setFilterPerson] = useState(() => localStorage.getItem('filterPerson') || null);
  const [showDone, setShowDone] = useState(() => localStorage.getItem('showDone') === 'true');

  const handleSetFilterPerson = (val) => {
    setFilterPerson(val);
    if (val) localStorage.setItem('filterPerson', val);
    else localStorage.removeItem('filterPerson');
  };

  const handleSetShowDone = (val) => {
    setShowDone(val);
    localStorage.setItem('showDone', val);
  };
  const [showProjectForm, setShowProjectForm] = useState(false);

  const currentUserName = members.find(m => m.email === user?.email?.toLowerCase())?.name || user?.displayName || '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-sm">Načítání...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} accessDenied={accessDenied} />;
  }

  return (
    <div className="min-h-screen bg-[#ede8dc]">
      <Header user={user} onLogout={logout} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Alerts user={user} />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <FilterBar
            members={members}
            filterPerson={filterPerson}
            setFilterPerson={handleSetFilterPerson}
            showDone={showDone}
            setShowDone={handleSetShowDone}
            currentUserName={currentUserName}
          />

          {isAdmin && (
            <button
              onClick={() => setShowProjectForm(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Nový projekt
            </button>
          )}
        </div>

        {showProjectForm && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Nový projekt</h3>
            <ProjectForm
              onSave={(data) => { addProject(data.name, data.description, data.links); setShowProjectForm(false); }}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-sm">{isAdmin ? 'Zatím žádné projekty. Vytvoř první.' : 'Zatím žádné projekty.'}</p>
          </div>
        ) : (
          <ProjectList
            projects={projects}
            members={members}
            filterPerson={filterPerson}
            showDone={showDone}
            user={user}
            isAdmin={isAdmin}
            onUpdate={updateProject}
            onDelete={deleteProject}
            onReorder={reorderProjects}
          />
        )}
      </main>
    </div>
  );
}
