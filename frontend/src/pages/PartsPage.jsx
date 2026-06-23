import { useState, useEffect } from 'react';
import { partsApi } from '../api/client';

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

function PartsPage() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: 'frame', price: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadParts();
  }, [filter]);

  async function loadParts() {
    try {
      setLoading(true);
      const data = await partsApi.getAll(filter || undefined);
      setParts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { name: formData.name, category: formData.category, price: Number(formData.price) };
      if (editingPart) {
        await partsApi.update(editingPart.id, payload);
      } else {
        await partsApi.create(payload);
      }
      setShowForm(false);
      setEditingPart(null);
      setFormData({ name: '', category: 'frame', price: '' });
      loadParts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this part?')) return;
    try {
      await partsApi.delete(id);
      loadParts();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(part) {
    setEditingPart(part);
    setFormData({ name: part.name, category: part.category, price: String(part.price) });
    setShowForm(true);
  }

  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const groupedParts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.key] = filteredParts.filter(p => p.category === cat.key);
    return acc;
  }, {});

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Parts Management</h1>
        <button
          onClick={() => { setShowForm(true); setEditingPart(null); setFormData({ name: '', category: 'frame', price: '' }); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          + Add New Part
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.key} value={cat.key}>{cat.icon} {cat.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1"
          aria-label="Search parts"
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingPart ? 'Edit Part' : 'Add New Part'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="part-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  id="part-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Carbon Fiber Frame"
                />
              </div>
              <div>
                <label htmlFor="part-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  id="part-category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="part-price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  id="part-price"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 2500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 font-medium">
                  {editingPart ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingPart(null); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parts List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading parts...</div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.filter(cat => !filter || filter === cat.key).map(cat => {
            const catParts = groupedParts[cat.key];
            if (!catParts || catParts.length === 0) return null;
            return (
              <div key={cat.key} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">
                    {cat.icon} {cat.label}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {catParts.map(part => (
                    <div key={part.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <span className="font-medium text-gray-900">{part.name}</span>
                        <span className="ml-3 text-sm text-gray-500">
                          Updated: {new Date(part.updated_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-accent-600 text-lg">{formatPrice(part.price)}</span>
                        <button
                          onClick={() => startEdit(part)}
                          className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          aria-label={`Edit ${part.name}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(part.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                          aria-label={`Delete ${part.name}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PartsPage;
