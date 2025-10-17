import { useState } from 'react';
import { Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';

export default function AuthenticatedLayout({ user, header, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chiffrageOpen, setChiffrageOpen] = useState(false);
  const [selectedChiffrage, setSelectedChiffrage] = useState(null);

  if (!user) return <div>Utilisateur non authentifié</div>;

  const getUserInitial = () => user?.nom?.charAt(0)?.toUpperCase() || 'U';
  const getFullName = () => `${user?.nom || ''} ${user?.prenom || ''}`.trim() || 'Utilisateur';

  // 🔹 Sous-catégories de Chiffrage
  const typesChiffrage = [
    { label: 'Air ambiant', value: 'air-ambiant' },
    { label: 'Rejets atmosphériques', value: 'rejets-atmospheriques' },
    { label: 'Amiante', value: 'amiante' },
    { label: 'Bruit ambiant', value: 'bruit-ambiant' },
    { label: "Bruit à l'exposition", value: 'bruit-exposition' },
    { label: 'Co.opacité', value: 'co-opacite' },
    { label: 'Rejets liquides', value: 'rejets-liquides' },
    { label: 'Eau propre', value: 'eau-propre' },
    { label: 'Éclairage', value: 'eclairage' },
    { label: "Qualité de l'air intérieur", value: 'qualite-air-interieur' },
    { label: 'Vibration', value: 'vibration' },
    { label: 'Température et humidité', value: 'temperature-humidite' },
    { label: 'Sol', value: 'sol' },
  ];

  // 🔹 Définition des items du menu
  const getSidebarItems = () => {
    const base = [{ label: 'Dashboard', href: '/dashboard', icon: '📊' }];

    if (user.role === 'user') {
      return [
        ...base,
        { label: 'Chiffrage', icon: '💼', subMenu: typesChiffrage },
        { label: 'Résultats', href: '/resultats', icon: '📈' },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...base,
        { label: 'Analyses', href: '/analyses', icon: '🔬' },
        { label: 'Patients', href: '/patients', icon: '👥' },
        { label: 'Rapports', href: '/reporting', icon: '📋' },
        { label: 'Échantillons', href: '/samples', icon: '🧪' },
        { label: 'Utilisateurs', href: '/users', icon: '👨‍💼' },
        { label: 'Paramètres', href: '/settings', icon: '⚙️' },
      ];
    }

    if (user.role === 'technicien') {
      return [
        ...base,
        { label: 'Analyses', href: '/analyses', icon: '🔬' },
        { label: 'Échantillons', href: '/samples', icon: '🧪' },
        { label: 'Rapports', href: '/reporting', icon: '📋' },
        { label: 'Planning', href: '/planning', icon: '📅' },
      ];
    }

    return base;
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔸 NAVBAR */}
      <nav className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center">
                <img src="/images/logo-sm.png" alt="Laboratory Logo" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-[#26658C]">Hse-Lab online</h1>
                <p className="text-xs text-gray-600">Management System</p>
              </div>
            </div>

            {/* Utilisateur + menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 🔸 SIDEBAR */}
      <aside
        className={`bg-white shadow-lg border-r border-gray-200 w-64 fixed top-16 bottom-0 flex flex-col justify-between transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Partie principale du menu */}
        <div className="p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, i) => (
            <div key={i}>
              {item.subMenu ? (
                <div className="mb-1">
                  <button
                    onClick={() => setChiffrageOpen(!chiffrageOpen)}
                    className="flex justify-between items-center w-full py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform ${chiffrageOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {chiffrageOpen && (
                    <div className="ml-6 mt-2 space-y-1 border-l border-gray-200 pl-3">
                      {item.subMenu.map((type) => (
                        <div key={type.value}>
                          <button
                            className="w-full text-left py-2 px-3 text-sm rounded-md text-gray-600 hover:bg-blue-100"
                            onClick={() =>
                              setSelectedChiffrage(selectedChiffrage === type.value ? null : type.value)
                            }
                          >
                            {type.label}
                          </button>

                          {selectedChiffrage === type.value && (
                            <div className="ml-4 mt-1 space-y-1">
                              <Link
                                href={`/chiffrage/nouveau?type=${type.value}`}
                                className="block py-2 px-3 bg-green-50 text-green-700 text-xs rounded-md hover:bg-green-100"
                                onClick={() => setSidebarOpen(false)}
                              >
                                Nouveau
                              </Link>
                              <Link
                                href={`/chiffrage/modifier?type=${type.value}`}
                                className="block py-2 px-3 bg-yellow-50 text-yellow-700 text-xs rounded-md hover:bg-yellow-100"
                                onClick={() => setSidebarOpen(false)}
                              >
                                Modifier
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-blue-50"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* 🔹 Profil / Déconnexion (collé en bas) */}
        <div className="border-t p-4 bg-gray-50">
          <Link
            href={route('profile.edit')}
            className="flex items-center space-x-3 py-2 px-3 rounded-lg text-gray-700 hover:bg-blue-50"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-lg">👤</span>
            <span className="font-medium text-sm">Mon Profil</span>
          </Link>

          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="flex items-center space-x-3 py-2 px-3 rounded-lg text-gray-700 hover:bg-red-50 w-full text-left"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium text-sm">Déconnexion</span>
          </Link>

          <div className="mt-4 flex items-center space-x-3 p-3 bg-blue-100 rounded-lg">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#26658C] text-white font-bold">
              {getUserInitial()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{getFullName()}</p>
              <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 🔸 Contenu principal */}
      <main
        className={`pt-20 p-6 transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        } bg-gradient-to-br from-gray-50 to-white`}
      >
        {header && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#26658C]">{header}</h1>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">{children}</div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <i className="fas fa-shield-alt text-green-500 mr-1"></i>
          Système sécurisé de gestion de laboratoire • Protégé par chiffrement avancé
        </div>
      </main>
    </div>
  );
}
