import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Minus,
  MessageSquarePlus,
  Droplet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { juicesApi } from '../services/api';
import { Juice } from '../types';
import { FruitBadge } from '../components/FruitBadge';
import { ReviewModal } from '../components/ReviewModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [juice, setJuice] = useState<Juice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchJuice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await juicesApi.getJuiceById(id);
      if (res.success && res.juice) {
        setJuice(res.juice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJuice();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-honey-400">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!juice) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-300 font-display text-xl mb-4">Juice SKU not found</p>
        <Link to="/" className="text-xs text-honey-400 hover:underline">
          Return to Boutique Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = juice.stock <= 0;
  const isLowStock = juice.stock > 0 && juice.stock <= 10;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(juice, quantity);
  };

  const handleReviewClick = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to share a review for this blend.', 'info', 'Sign In Required');
      navigate('/login');
      return;
    }
    setShowReviewModal(true);
  };

  return (
    <div className="space-y-12">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-honey-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Boutique Menu</span>
      </Link>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Product Imagery */}
        <div className="lg:col-span-6">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-obsidian-900 border border-honey-500/20 shadow-2xl">
            <img
              src={juice.imageUrl}
              alt={juice.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-obsidian-900/90 text-honey-400 border border-honey-500/30 backdrop-blur-md">
                {juice.category}
              </span>
              {juice.isOrganic && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-botanical-500/20 text-botanical-300 border border-botanical-500/40 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  100% Organic
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-black/70 text-stone-200 border border-white/10 backdrop-blur-md">
                {juice.volumeMl} ml Artisanal Glass Bottle
              </span>
            </div>
          </div>
        </div>

        {/* Right: Details & Purchase Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div>
            {/* Title & SKU */}
            <div className="flex items-center gap-2 text-xs text-honey-400 font-mono mb-2">
              <span>SKU: {juice.id}</span>
              <span>•</span>
              <span>Cold-Chain 4°C</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-100 mb-3">
              {juice.name}
            </h1>

            {/* Rating Stars & Count */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1 text-honey-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      (juice.averageRating || 0) >= star
                        ? 'fill-honey-400 text-honey-400'
                        : 'text-stone-700'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-bold text-honey-300">
                  {juice.averageRating ? juice.averageRating.toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-xs text-stone-500">
                ({juice.reviewCount || 0} customer {juice.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-extrabold text-honey-400 mb-4">
              {formatCurrency(juice.price)}
            </div>

            {/* Description */}
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              {juice.description}
            </p>

            {/* Ingredients / Fruits */}
            <div className="space-y-2 mb-6">
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                Fruit & Botanical Composition:
              </span>
              <div className="flex flex-wrap gap-2">
                {juice.fruits.map((fruit, idx) => (
                  <FruitBadge key={idx} name={fruit} />
                ))}
              </div>
            </div>

            {/* Stock Level Indicator */}
            <div className="p-3.5 rounded-xl bg-obsidian-900 border border-stone-800 text-xs mb-6">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Currently Out of Stock. Join waitlist or check back soon.</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-2 text-citrus-400 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Limited Batch Remaining: Only {juice.stock} bottles left!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In Stock & Ready for Cold-Chain Dispatch ({juice.stock} units)</span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-6 border-t border-stone-800">
            <div className="flex items-center gap-4">
              {/* Stepper */}
              <div className="flex items-center gap-3 bg-obsidian-900 border border-stone-800 rounded-2xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold text-sm px-3 text-stone-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(juice.stock, quantity + 1))}
                  disabled={quantity >= juice.stock || isOutOfStock}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isOutOfStock
                    ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                    : 'bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 shadow-xl shadow-honey-950 active:scale-[0.99]'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {isOutOfStock
                    ? 'Sold Out'
                    : `Add ${quantity} to Cart • ${formatCurrency(juice.price * quantity)}`}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
              <ShieldCheck className="w-4 h-4 text-honey-400" />
              <span>Free returns on unopened cold-chain seal • 100% Raw</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-10 border-t border-stone-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-stone-100">
              Customer Taste Reviews
            </h2>
            <p className="text-xs text-stone-400">
              Honest feedback from juice enthusiasts
            </p>
          </div>

          <button
            onClick={handleReviewClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-900 border border-honey-500/30 text-xs font-semibold text-honey-300 hover:bg-honey-500/15 transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4 text-honey-400" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {!juice.reviews || juice.reviews.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-obsidian-900/60 border border-stone-800 text-stone-400 text-xs">
              No reviews yet for this juice blend. Be the first to share your tasting experience!
            </div>
          ) : (
            juice.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-obsidian-900 border border-stone-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-honey-500/20 text-honey-300 font-bold text-xs flex items-center justify-center">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-200 block">
                        {rev.userName}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {formatDate(rev.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 text-honey-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          rev.rating >= s ? 'fill-honey-400 text-honey-400' : 'text-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Scenario 3: Raw Feedback Rendering */}
                <div
                  className="text-xs text-stone-300 leading-relaxed pt-1"
                  dangerouslySetInnerHTML={{ __html: rev.comment }}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <ReviewModal
          juiceId={juice.id}
          juiceName={juice.name}
          onClose={() => setShowReviewModal(false)}
          onSuccess={fetchJuice}
        />
      )}
    </div>
  );
};
