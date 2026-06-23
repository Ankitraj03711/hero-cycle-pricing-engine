import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { configurationsApi } from '../api/client';

const CATEGORY_LABELS = {
  frame: { label: 'Frame', icon: '🖼️' },
  gearSet: { label: 'Gear Set', icon: '⚙️' },
  tyres: { label: 'Tyres', icon: '🔘' },
  brakes: { label: 'Brakes', icon: '🛑' },
  handlebars: { label: 'Handlebars', icon: '🦯' },
  seat: { label: 'Seat', icon: '💺' },
  chain: { label: 'Chain', icon: '🔗' },
  wheels: { label: 'Wheels', icon: '◎' },
};

function ConfigurationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfiguration();
  }, [id]);

  async function loadConfiguration() {
    try {
      setLoading(true);
      const data = await configurationsApi.getById(id);
      setConfig(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await configurationsApi.delete(id);
      navigate('/configurations');
    } catch (err) {
      setError(err.message);
    }
  }

  const formatPrice = (price) => `₹${price.toLocaleString('en-IN')}`;

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading configuration...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/configurations" className="text-primary-600 hover:text-primary-800">
          ← Back to configurations
        </Link>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <Link to="/configurations" className="text-primary-600 hover:text-primary-800 text-sm mb-1 inline-block">
            ← Back to Configurations
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(config.created_at).toLocaleDateString('en-IN')} | 
            Updated: {new Date(config.updated_at).toLocaleDateString('en-IN')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/builder/${config.id}`}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 font-medium"
          >
            ✏️ Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 font-medium"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Price Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 text-lg">Price Breakdown</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 uppercase">Category</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 uppercase">Part</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500 uppercase">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {config.parts.map(part => {
              const catInfo = CATEGORY_LABELS[part.category] || { label: part.category, icon: '📦' };
              return (
                <tr key={part.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="mr-2">{catInfo.icon}</span>
                    <span className="font-medium text-gray-700">{catInfo.label}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{part.name}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatPrice(part.price)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary-50 border-t-2 border-primary-200">
              <td className="px-6 py-4 font-bold text-gray-900 text-lg" colSpan={2}>
                TOTAL
              </td>
              <td className="px-6 py-4 text-right font-bold text-2xl text-accent-600">
                {formatPrice(config.totalPrice)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default ConfigurationDetailPage;
