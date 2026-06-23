import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { configurationsApi } from '../api/client';

function ConfigurationsPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'name', 'price'

  useEffect(() => {
    loadConfigurations();
  }, []);

  async function loadConfigurations() {
    try {
      setLoading(true);
      const data = await configurationsApi.getAll();
      setConfigs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await configurationsApi.delete(id);
      loadConfigurations();
    } catch (err) {
      setError(err.message);
    }
  }

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  const filteredConfigs = configs
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price') return b.totalPrice - a.totalPrice;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Cycle Configurations</h1>
        <Link
          to="/builder"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
        >
          + New Configuration
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search configurations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
          aria-label="Search configurations"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          aria-label="Sort by"
        >
          <option value="updated">Recently Updated</option>
          <option value="name">Name (A-Z)</option>
          <option value="price">Price (High to Low)</option>
        </select>
      </div>

      {/* Configurations List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading configurations...</div>
      ) : filteredConfigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No configurations found.</p>
          <Link to="/builder" className="text-primary-600 hover:text-primary-800 font-medium mt-2 inline-block">
            Create your first configuration →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConfigs.map(config => (
            <div key={config.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 text-lg">{config.name}</h3>
                <span className="text-2xl font-bold text-accent-600">{formatPrice(config.totalPrice)}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Updated: {new Date(config.updated_at).toLocaleDateString('en-IN')}
              </p>
              <div className="flex gap-2">
                <Link
                  to={`/configurations/${config.id}`}
                  className="flex-1 text-center bg-primary-50 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-100 text-sm font-medium"
                >
                  View Details
                </Link>
                <Link
                  to={`/builder/${config.id}`}
                  className="flex-1 text-center bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium"
                  aria-label={`Delete ${config.name}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConfigurationsPage;
