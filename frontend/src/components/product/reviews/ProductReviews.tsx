import React, { useState, useEffect, useMemo } from 'react';
import { Star, ThumbsUp, ThumbsDown, SlidersHorizontal, X } from 'lucide-react';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { getReviewsByProduct, markReviewHelpful } from '@/lib/services/reviewService';
import type { Review } from '@/types';

interface ProductReviewsProps {
  productId: string;
  initialRating?: number;
  initialReviewCount?: number;
}

const REVIEWS_PER_PAGE = 5;
const TOPICS = ['Product Quality', 'Seller Services', 'Product Price', 'Shipment', 'Match with Description'];
const VOTE_KEY = 'zest_review_votes';

function getVotes(): Record<string, 'up' | 'down'> {
  try { return JSON.parse(localStorage.getItem(VOTE_KEY) || '{}'); } catch { return {}; }
}
function saveVote(reviewId: string, vote: 'up' | 'down') {
  try {
    const v = getVotes(); v[reviewId] = vote;
    localStorage.setItem(VOTE_KEY, JSON.stringify(v));
  } catch {}
}
function removeVote(reviewId: string) {
  try {
    const v = getVotes(); delete v[reviewId];
    localStorage.setItem(VOTE_KEY, JSON.stringify(v));
  } catch {}
}

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={14} className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-neutral-300'} />
      ))}
    </div>
  );
}

export function ProductReviews({ productId, initialRating = 0, initialReviewCount = 0 }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'description'>('all');
  const [page, setPage] = useState(1);
  const [votes, setVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setVotes(getVotes());
    async function fetchReviews() {
      try {
        setLoading(true);
        const data = await getReviewsByProduct(productId, 'recent');
        setReviews(data);
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  const distribution = useMemo(() => {
    const d: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { const rounded = Math.round(r.rating); if (rounded >= 1 && rounded <= 5) d[rounded]++; });
    return d;
  }, [reviews]);

  const totalReviews = reviews.length || initialReviewCount;
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : initialRating;

  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (selectedRatings.length > 0) result = result.filter(r => selectedRatings.includes(Math.round(r.rating)));
    if (activeTab === 'description') result = result.filter(r => r.body && r.body.length > 10);
    return result;
  }, [reviews, selectedRatings, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = filteredReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  const toggleRating = (star: number) => {
    setPage(1);
    setSelectedRatings(prev => prev.includes(star) ? prev.filter(r => r !== star) : [...prev, star]);
  };
  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const formatDate = (createdAt: any) => {
    try {
      const ts = typeof createdAt === 'number' ? createdAt : (createdAt?.seconds ? createdAt.seconds * 1000 : undefined);
      return new Date(ts ?? createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const handleVote = async (reviewId: string, type: 'up' | 'down') => {
    const current = votes[reviewId];
    if (current === type) {
      removeVote(reviewId);
      setVotes(prev => { const n = { ...prev }; delete n[reviewId]; return n; });
      setReviews(prev => prev.map(r => r.id !== reviewId ? r : {
        ...r,
        helpful: type === 'up' ? Math.max(0, (r.helpful || 0) - 1) : r.helpful,
        unhelpful: type === 'down' ? Math.max(0, (r.unhelpful || 0) - 1) : r.unhelpful,
      }));
      return;
    }
    const prevType = current;
    saveVote(reviewId, type);
    setVotes(prev => ({ ...prev, [reviewId]: type }));
    setReviews(prev => prev.map(r => r.id !== reviewId ? r : {
      ...r,
      helpful: type === 'up' ? (r.helpful || 0) + 1 : prevType === 'up' ? Math.max(0, (r.helpful || 0) - 1) : r.helpful,
      unhelpful: type === 'down' ? (r.unhelpful || 0) + 1 : prevType === 'down' ? Math.max(0, (r.unhelpful || 0) - 1) : r.unhelpful,
    }));
    try { await markReviewHelpful(reviewId, type); } catch {}
  };

  const activeFiltersCount = selectedRatings.length + selectedTopics.length;

  return (
    <div>
      {/* ── Rating Summary ───────────────────────────────────── */}
      <div className="border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12">
          {/* Big score */}
          <div className="flex-shrink-0 text-center">
            <div className="text-6xl font-black text-neutral-900 tabular-nums leading-none">
              {avgRating.toFixed(1)}
            </div>
            <StarRow rating={avgRating} />
            <p className="text-xs font-bold text-neutral-500 mt-1.5 tracking-wide">
              {totalReviews.toLocaleString()} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = distribution[star] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const isActive = selectedRatings.includes(star);
              return (
                <button
                  key={star}
                  onClick={() => toggleRating(star)}
                  className={`flex items-center gap-3 w-full group transition-all ${selectedRatings.length > 0 && !isActive ? 'opacity-40' : ''}`}
                >
                  <span className="text-xs font-bold text-neutral-600 w-3 flex-shrink-0 text-right">{star}</span>
                  <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2.5 bg-neutral-100 border border-neutral-200 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-500 w-6 text-right flex-shrink-0">{count}</span>
                </button>
              );
            })}
            {selectedRatings.length > 0 && (
              <button
                onClick={() => { setSelectedRatings([]); setPage(1); }}
                className="text-[11px] font-bold text-neutral-400 hover:text-neutral-700 flex items-center gap-1 mt-1"
              >
                <X size={11} /> Clear filter
              </button>
            )}
          </div>

          {/* Write a review */}
          <div className="flex-shrink-0 hidden sm:block">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-2 h-10 px-5 text-xs font-bold border-2 border-neutral-900 bg-neutral-900 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap"
            >
              <Star size={13} className="fill-white" />
              Write a Review
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          {[
            { key: 'all', label: 'All Reviews' },
            { key: 'description', label: 'With Description' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setPage(1); }}
              className={`h-8 px-4 text-[12px] font-bold border-2 border-neutral-900 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                activeTab === tab.key
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`h-8 px-3 text-[12px] font-bold border-2 border-neutral-900 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${showFilters ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'}`}
          >
            <SlidersHorizontal size={12} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 w-4 h-4 text-[10px] bg-amber-400 text-neutral-900 font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Write review (mobile) */}
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="sm:hidden flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold border-2 border-neutral-900 bg-neutral-900 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Star size={11} className="fill-white" /> Review
        </button>
      </div>

      {/* ── Filter Panel ─────────────────────────────────────── */}
      {showFilters && (
        <div className="border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 mb-6 bg-neutral-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-3">By Rating</p>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <label
                    key={star}
                    className="flex items-center gap-2.5 cursor-pointer group"
                    onClick={() => toggleRating(star)}
                  >
                    <div className={`w-4 h-4 border-2 border-neutral-900 flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedRatings.includes(star) ? 'bg-neutral-900' : 'bg-white group-hover:bg-neutral-100'
                    }`}>
                      {selectedRatings.includes(star) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: star }, (_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-neutral-500 font-semibold">({distribution[star] || 0})</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black text-neutral-900 uppercase tracking-widest mb-3">By Topic</p>
              <div className="space-y-2">
                {TOPICS.map(topic => (
                  <label
                    key={topic}
                    className="flex items-center gap-2.5 cursor-pointer group"
                    onClick={() => toggleTopic(topic)}
                  >
                    <div className={`w-4 h-4 border-2 border-neutral-900 flex-shrink-0 flex items-center justify-center transition-all ${
                      selectedTopics.includes(topic) ? 'bg-neutral-900' : 'bg-white group-hover:bg-neutral-100'
                    }`}>
                      {selectedTopics.includes(topic) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-700 font-semibold group-hover:text-neutral-900 transition-colors">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t-2 border-neutral-200 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 font-semibold">{activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active</span>
              <button
                onClick={() => { setSelectedRatings([]); setSelectedTopics([]); setPage(1); }}
                className="text-[11px] font-bold text-neutral-700 hover:text-neutral-900 flex items-center gap-1"
              >
                <X size={11} /> Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Review list ──────────────────────────────────────── */}
      {loading ? (
        <div className="py-16 text-center border-2 border-neutral-200">
          <div className="inline-block w-6 h-6 border-2 border-neutral-200 border-t-neutral-900 animate-spin mb-3" />
          <p className="text-sm text-neutral-500 font-semibold">Loading reviews...</p>
        </div>
      ) : paginatedReviews.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-neutral-300">
          <Star size={32} className="text-neutral-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-neutral-700 mb-1">No reviews yet</p>
          <p className="text-xs text-neutral-400 mb-5">Be the first to share your experience!</p>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="inline-flex items-center gap-2 h-10 px-6 text-xs font-bold border-2 border-neutral-900 bg-neutral-900 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <Star size={13} className="fill-white" /> Write a Review
          </button>
        </div>
      ) : (
        <div className="border-2 border-neutral-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {paginatedReviews.map((review, idx) => {
            const myVote = votes[review.id];
            return (
              <div
                key={review.id}
                className={`p-5 sm:p-6 ${idx < paginatedReviews.length - 1 ? 'border-b-2 border-neutral-900' : ''}`}
              >
                {/* Top: stars + date */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <StarRow rating={review.rating} />
                    <h4 className="font-black text-neutral-900 text-sm sm:text-base mt-1.5 leading-snug">{review.title}</h4>
                  </div>
                  <span className="text-[11px] font-semibold text-neutral-400 whitespace-nowrap flex-shrink-0">{formatDate(review.createdAt)}</span>
                </div>

                {review.body && (
                  <p className="text-[13px] text-neutral-600 leading-relaxed mb-4">{review.body}</p>
                )}

                {/* Bottom: user + helpful */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 border-2 border-neutral-900 flex items-center justify-center text-[12px] font-black text-neutral-600 bg-neutral-100 flex-shrink-0 overflow-hidden">
                      {review.userImage ? (
                        <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
                      ) : (
                        review.userName?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <span className="text-[12px] font-bold text-neutral-700">{review.userName}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-400 font-semibold mr-0.5">Helpful?</span>
                    <button
                      onClick={() => handleVote(review.id, 'up')}
                      className={`flex items-center gap-1 h-7 px-2.5 text-[11px] font-bold border-2 transition-all ${
                        myVote === 'up'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
                      }`}
                    >
                      <ThumbsUp size={11} />
                      <span>{review.helpful || 0}</span>
                    </button>
                    <button
                      onClick={() => handleVote(review.id, 'down')}
                      className={`flex items-center gap-1 h-7 px-2.5 text-[11px] font-bold border-2 transition-all ${
                        myVote === 'down'
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900'
                      }`}
                    >
                      <ThumbsDown size={11} />
                      <span>{(review as any).unhelpful || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center border-2 border-neutral-900 text-neutral-700 font-bold hover:bg-neutral-900 hover:text-white disabled:opacity-30 transition-all text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            if (totalPages > 7 && p !== 1 && p !== totalPages && (p < page - 1 || p > page + 1)) {
              if (p === page - 2 || p === page + 2) return <span key={p} className="text-neutral-400 px-1 font-bold">…</span>;
              return null;
            }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center border-2 border-neutral-900 text-[12px] font-bold transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  page === p ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-700'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center border-2 border-neutral-900 text-neutral-700 font-bold hover:bg-neutral-900 hover:text-white disabled:opacity-30 transition-all text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            ›
          </button>
        </div>
      )}

      {isReviewModalOpen && (
        <ReviewModal
          productId={productId}
          productName="This Product"
          productImage=""
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => { setIsReviewModalOpen(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}
