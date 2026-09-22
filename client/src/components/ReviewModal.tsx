import React, { useState } from 'react';
import { X, Star, Send, Sparkles } from 'lucide-react';
import { juicesApi } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ReviewModalProps {
  juiceId: string;
  juiceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ juiceId, juiceName, onClose, onSuccess }) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Please share a few words about your experience.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await juicesApi.submitReview(juiceId, { rating, comment });
      if (res.success) {
        showToast('Thank you for your valuable feedback!', 'success', 'Review Submitted');
        onSuccess();
        onClose();
      } else {
        showToast(res.error || 'Failed to submit review', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-md w-full rounded-2xl bg-obsidian-900 border border-honey-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-honey-500/15 text-honey-400 border border-honey-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-stone-100">
              Taste Feedback
            </h3>
            <p className="text-xs text-stone-400 truncate max-w-[260px]">
              {juiceName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-stone-600 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-honey-400 text-honey-400'
                        : 'text-stone-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-honey-400 ml-2">
                {hoverRating || rating} / 5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Tasting Notes & Impression
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the honey balance, fruit freshness, or texture?"
              className="w-full glass-input rounded-xl p-3.5 text-sm placeholder-stone-600 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-honey-500 to-amber-600 hover:from-honey-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-honey-950 transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Post Customer Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
