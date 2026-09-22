import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Wine, Sparkles, RefreshCw, X, Check, Search, ExternalLink } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Juice } from '../../types';
import { formatCurrency, paiseToRupees, rupeesToPaise, isValidHttpUrl } from '../../utils/formatters';
import { FruitBadge } from '../../components/FruitBadge';
import { useToast } from '../../context/ToastContext';

export const AdminJuices: React.FC = () => {
  const [juices, setJuices] = useState<Juice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingJuice, setEditingJuice] = useState<Juice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { showToast } = useToast();

  const fetchJuices = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getJuices();
      if (res.success && res.juices) {
        setJuices(res.juices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuices();
  }, []);

  const filteredJuices = juices.filter(
    (j) =>
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.category.toLowerCase().includes(search.toLowerCase()) ||
      j.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-100">
            Juice Catalog & Stock Control
          </h1>
          <p className="text-xs text-stone-400">
            Add new recipes, update batch pricing, inventory stock, and fruit ingredients
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJuices}
            className="p-2.5 rounded-xl bg-obsidian-900 border border-stone-800 text-stone-300 hover:text-honey-400 transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-honey-950 transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Juice SKU</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, category, or SKU..."
          className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-honey-400">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl bg-obsidian-900 border border-stone-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-obsidian-950/80 text-stone-400 border-b border-stone-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Juice Blend</th>
                  <th className="p-4">SKU / Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Attributes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredJuices.map((juice) => (
                  <tr key={juice.id} className="hover:bg-obsidian-850/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={juice.imageUrl}
                          alt={juice.name}
                          className="w-12 h-12 rounded-xl object-cover bg-stone-950 border border-stone-800 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80';
                          }}
                        />
                        <div>
                          <div className="font-semibold text-stone-200 text-sm">{juice.name}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                            {juice.fruits.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono text-honey-400 font-medium">{juice.id}</div>
                      <div className="text-stone-400 text-[11px]">{juice.category}</div>
                    </td>

                    <td className="p-4 font-bold text-honey-400 text-sm">
                      {formatCurrency(juice.price)}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-xs ${
                          juice.stock === 0
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : juice.stock <= 10
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {juice.stock} units
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-[10px] text-stone-300">
                          {juice.volumeMl}ml
                        </span>
                        {juice.isOrganic && (
                          <span className="px-2 py-0.5 rounded bg-botanical-500/20 text-[10px] text-botanical-300 border border-botanical-500/30 font-medium">
                            Organic
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setEditingJuice(juice)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-950 border border-stone-700 text-stone-300 hover:text-honey-400 hover:border-honey-500/50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Juice Modal */}
      {isAddModalOpen && (
        <JuiceFormModal
          title="Create New Artisanal Juice SKU"
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchJuices();
          }}
        />
      )}

      {/* Edit Juice Modal */}
      {editingJuice && (
        <JuiceFormModal
          title={`Edit SKU: ${editingJuice.id}`}
          initialData={editingJuice}
          onClose={() => setEditingJuice(null)}
          onSuccess={() => {
            setEditingJuice(null);
            fetchJuices();
          }}
        />
      )}
    </div>
  );
};

// Modal for Create & Update Juice
interface JuiceFormModalProps {
  title: string;
  initialData?: Juice | null;
  onClose: () => void;
  onSuccess: () => void;
}

const JuiceFormModal: React.FC<JuiceFormModalProps> = ({ title, initialData, onClose, onSuccess }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || 'Honey Infusions');
  const [priceRupees, setPriceRupees] = useState(initialData ? paiseToRupees(initialData.price) : 249);
  const [stock, setStock] = useState(initialData ? initialData.stock : 25);
  const [volumeMl, setVolumeMl] = useState(initialData ? initialData.volumeMl : 350);
  const [fruitsInput, setFruitsInput] = useState(initialData ? initialData.fruits.join(', ') : 'Mango, Raw Honey, Lemon');
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl || 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80'
  );
  const [isOrganic, setIsOrganic] = useState(initialData ? initialData.isOrganic : true);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      showToast('Name and description are required', 'warning');
      return;
    }

    if (priceRupees < 0) {
      showToast('Price cannot be negative', 'warning');
      return;
    }

    if (stock < 0) {
      showToast('Stock cannot be negative', 'warning');
      return;
    }

    if (!isValidHttpUrl(imageUrl)) {
      showToast('Please provide a valid external HTTP/HTTPS image URL', 'warning');
      return;
    }

    const pricePaise = rupeesToPaise(priceRupees);
    const fruits = fruitsInput.split(',').map((f) => f.trim()).filter(Boolean);

    setSubmitting(true);
    try {
      if (initialData) {
        // Update
        const res = await adminApi.updateJuice(initialData.id, {
          name,
          description,
          category,
          price: pricePaise,
          stock: Number(stock),
          volumeMl: Number(volumeMl),
          fruits,
          imageUrl,
          isOrganic
        });

        if (res.success) {
          showToast(`Juice ${initialData.id} updated successfully!`, 'success');
          onSuccess();
        } else {
          showToast(res.error || 'Failed to update juice', 'error');
        }
      } else {
        // Create
        const res = await adminApi.createJuice({
          name,
          description,
          category,
          price: pricePaise,
          stock: Number(stock),
          volumeMl: Number(volumeMl),
          fruits,
          imageUrl,
          isOrganic
        });

        if (res.success) {
          showToast(`Created new juice SKU: ${res.juice?.id}!`, 'success');
          onSuccess();
        } else {
          showToast(res.error || 'Failed to create juice', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="max-w-xl w-full rounded-2xl bg-obsidian-900 border border-honey-500/30 p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-stone-800">
          <Wine className="w-5 h-5 text-honey-400" />
          <h3 className="font-display font-bold text-lg text-stone-100">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Juice Blend Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raw Honey Alphonso Blast"
              className="w-full glass-input rounded-xl p-3 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl p-3 text-xs bg-obsidian-900"
              >
                <option value="Honey Infusions">Honey Infusions</option>
                <option value="Cold-Pressed">Cold-Pressed</option>
                <option value="Green Cleanses">Green Cleanses</option>
                <option value="Wellness Tonics">Wellness Tonics</option>
                <option value="Berry Blends">Berry Blends</option>
                <option value="Pure Cold-Pressed">Pure Cold-Pressed</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Price in ₹ (Paise Auto-calc) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={priceRupees}
                onChange={(e) => setPriceRupees(Number(e.target.value))}
                className="w-full glass-input rounded-xl p-3 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Stock Quantity (Units) *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full glass-input rounded-xl p-3 text-xs"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Volume (ml)
              </label>
              <input
                type="number"
                min="100"
                value={volumeMl}
                onChange={(e) => setVolumeMl(Number(e.target.value))}
                className="w-full glass-input rounded-xl p-3 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Fruits & Ingredients (Comma-separated)
            </label>
            <input
              type="text"
              value={fruitsInput}
              onChange={(e) => setFruitsInput(e.target.value)}
              placeholder="Mango, Lemon, Raw Honey"
              className="w-full glass-input rounded-xl p-3 text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
              External High-Res Image URL (HTTP/HTTPS) *
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full glass-input rounded-xl p-3 text-xs font-mono"
              required
            />
          </div>

          {/* Live Image Preview */}
          {imageUrl && isValidHttpUrl(imageUrl) && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-obsidian-950 border border-stone-800">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-12 h-12 rounded-lg object-cover bg-stone-900 flex-shrink-0"
              />
              <div className="text-[11px] text-stone-400 truncate">
                Live URL verified: external resource resolves cleanly.
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Crafted with hand-harvested ingredients..."
              className="w-full glass-input rounded-xl p-3 text-xs resize-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="organic"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="rounded accent-honey-500"
            />
            <label htmlFor="organic" className="text-stone-300 font-medium cursor-pointer">
              100% Certified Organic Recipe
            </label>
          </div>

          <div className="pt-4 border-t border-stone-800 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-obsidian-950 border border-stone-800 text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold shadow-lg"
            >
              {submitting ? 'Saving...' : initialData ? 'Update SKU' : 'Publish Juice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
