import { Routes, Route, NavLink } from 'react-router-dom';
import PartsPage from './pages/PartsPage';
import ConfigurationsPage from './pages/ConfigurationsPage';
import ConfigurationBuilderPage from './pages/ConfigurationBuilderPage';
import ConfigurationDetailPage from './pages/ConfigurationDetailPage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-primary-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚲</span>
              <span className="font-bold text-lg">Hero Cycles Pricing Engine</span>
            </div>
            <div className="flex space-x-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-900 text-white' : 'text-primary-100 hover:bg-primary-700'
                  }`
                }
              >
                Parts
              </NavLink>
              <NavLink
                to="/configurations"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-900 text-white' : 'text-primary-100 hover:bg-primary-700'
                  }`
                }
              >
                Configurations
              </NavLink>
              <NavLink
                to="/builder"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-900 text-white' : 'text-primary-100 hover:bg-primary-700'
                  }`
                }
              >
                + New Config
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<PartsPage />} />
          <Route path="/configurations" element={<ConfigurationsPage />} />
          <Route path="/builder" element={<ConfigurationBuilderPage />} />
          <Route path="/builder/:id" element={<ConfigurationBuilderPage />} />
          <Route path="/configurations/:id" element={<ConfigurationDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
