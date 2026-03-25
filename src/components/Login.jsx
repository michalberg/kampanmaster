export function Login({ onLogin, accessDenied }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🗳️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Kampanmaster</h1>
        <p className="text-gray-500 text-sm mb-8">Kampaňový úkolovník</p>

        {accessDenied && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            Tento e-mail nemá přístup do aplikace. Kontaktuj administrátora.
          </div>
        )}

        <button
          onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.88v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.53c-.16-.48-.25-.98-.25-1.53s.09-1.06.25-1.53V5.4H1.88A8 8 0 0 0 .98 9c0 1.29.31 2.51.9 3.6l2.63-2.07z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8.98 1a8 8 0 0 0-7.1 4.4l2.63 2.07c.63-1.89 2.39-3.29 4.47-3.29z"/>
          </svg>
          Přihlásit se přes Google
        </button>
      </div>
    </div>
  );
}
