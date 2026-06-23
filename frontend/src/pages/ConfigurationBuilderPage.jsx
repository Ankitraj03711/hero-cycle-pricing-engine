import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { partsApi, configurationsApi } from '../api/client';

const CATEGORIES = [
  { key: 'frame', label: 'Frame', icon: '🖼️' },
  { key: 'gearSet', label: 'Gear Set', icon: '⚙️' },
  { key: 'tyres', label: 'Tyres', icon: '🔘' },
  { key: 'brakes', label: 'Brakes', icon: '🛑' },
  { key: 'handlebars', label: 'Handlebars', icon: '🦯' },
  { key: 'seat', label: 'Seat', icon: '💺' },
  { key: 'chain', label: 'Chain', icon: '🔗' },
  { key: 'wheels', label: 'Wheels', icon: '◎' },
];

function ConfigurationBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parts, setParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState({});
  const [configName, setConfigName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const allParts = await partsApi.getAll();
      setParts(allParts);

      // If editing, load existing configuration
      if (id) {
        const config = await configurationsApi.getById(id);
        setConfigName(config.name);
        const selected = {};
        config.parts.forEach(p => {
          selected[p.category] = p.id;
        });
        setSelectedParts(selected);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePartSelect(category, partId) {
    setSelectedParts(prev => ({ ...prev, [category]: Number(partId) }));
  }

  function getTotal() {
    return Object.values(selectedParts).reduce((total, partId) => {
      const part = parts.find(p => p.id === partId);
      return total + (part ? part.price : 0);
    }, 0);
  }

  function getSelectedCount() {
    return Object.keys(selectedParts).length;
  }

  async function handleSave() {
    setError('');
    if (!configName.trim()) {
      setError('Please enter a configuration name');
      return;
    }
    if (getSelectedCount() !== 8) {
      setError('Please select a part from each category');
      return;
    }

    try {
      setSaving(true);
      const partIds = CATEGORIES.map(cat => selectedParts[cat.key]);

      if (id) {
        await configurationsApi.update(id, { name: configName.trim(), partIds });
      } else {
        await configurationsApi.create({ name: configName.trim(), partIds });
      }
      navigate('/configurations');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  const partsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = parts.filter(p => p.category === cat.key);
    return acc;
  }, {});

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {id ? 'Edit Configuration' : 'New Configuration'}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Configuration Name */}
      <div className="mb-6">
        <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 mb-1">
          Configuration Name
        </label>
        <input
          id="config-name"
          type="text"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          placeholder="e.g., Hero Sprint Pro 2024"
          className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 text-lg"
        />
      </div>

      {/* Category Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {CATEGORIES.map(cat => {
          const catParts = partsByCategory[cat.key] || [];
          const selectedPartId = selectedParts[cat.key];
          const selectedPart = catParts.find(p => p.id === selectedPartId);

          return (
            <div
              key={cat.key}
              className={`bg-white rounded-xl border-2 p-4 transition-colors ${
                selectedPartId ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cat.icon}</span>
                <h3 className="font-semibold text-gray-800">{cat.label}</h3>
              </div>
              <select
                value={selectedPartId || ''}
                onChange={(e) => handlePartSelect(cat.key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                aria-label={`Select ${cat.label}`}
              >
                <option value="">-- Select --</option>
                {catParts.map(part => (
                  <option key={part.id} value={part.id}>
                    {part.name} — {formatPrice(part.price)}
                  </option>
                ))}
              </select>
              {selectedPart && (
                <p className="mt-2 text-right font-bold text-accent-600">
                  {formatPrice(selectedPart.price)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Total & Save */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-4 px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-lg rounded-t-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-gray-600 text-sm">{getSelectedCount()}/8 categories selected</span>
            <div className="text-3xl font-bold text-gray-900">
              Total: <span className="text-accent-600">{formatPrice(getTotal())}</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || getSelectedCount() !== 8 || !configName.trim()}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-lg transition-colors"
          >
            {saving ? 'Saving...' : (id ? '💾 Update Configuration' : '💾 Save Configuration')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationBuilderPage;
