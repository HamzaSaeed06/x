import { useState, useRef } from 'react';
import { X, Star, Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { addReview } from '@/lib/services/reviewService';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const MAX_PHOTOS = 4;

interface ReviewModalProps {
  productId: string;
  productName: string;
  productImage?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ productId, productName, productImage, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuthStore();
  const [hoverStar, setHoverStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [form, setForm] = useState({ rating: 0, title: '', body: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toUpload = files.slice(0, remaining);
    setUploadingPhoto(true);
    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${localStorage.getItem('auth-token') ?? ''}` },
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json() as { url: string };
        uploaded.push(data.url);
      }
      setPhotos(prev => [...prev, ...uploaded]);
    } catch {
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in to submit a review.'); return; }
    if (form.rating === 0) { toast.error('Please select a star rating.'); return; }
    if (form.body.trim().length < 10) { toast.error('Please write at least 10 characters.'); return; }

    setSubmitting(true);
    try {
      await addReview(productId, {
        rating: form.rating,
        title: form.title.trim() || `${form.rating}-star review`,
        body: form.body.trim(),
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || '',
        images: photos,
      });
      toast.success('Review submitted! Thank you.');
      onSuccess();
    } catch {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div
      className="fixed inset-0 z-[998] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-[15px] font-extrabold text-gray-900">Rate Your Purchase</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Product info */}
        {(productImage || productName) && (
          <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
            {productImage && (
              <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                <img src={productImage} alt={productName} className="w-full h-full object-contain p-1 mix-blend-multiply" />
              </div>
            )}
            <p className="text-[13px] font-bold text-gray-800 line-clamp-1">{productName}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Star Rating */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rating: star }))}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={30}
                    fill={star <= (hoverStar || form.rating) ? 'currentColor' : 'none'}
                    className={star <= (hoverStar || form.rating) ? 'text-amber-400' : 'text-gray-200'}
                  />
                </button>
              ))}
            </div>
            {(hoverStar || form.rating) > 0 && (
              <p className="text-[12px] text-amber-600 font-semibold">
                {ratingLabels[hoverStar || form.rating]}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5">Review Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="How was the quality, fit, or performance? Share details..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">{form.body.length} chars (min. 10)</p>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-2">
              Add Photos <span className="text-gray-400 font-normal">(up to {MAX_PHOTOS})</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={url} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {uploadingPhoto
                    ? <Loader2 size={16} className="animate-spin text-gray-400" />
                    : <ImagePlus size={16} className="text-gray-400" />
                  }
                  {!uploadingPhoto && <span className="text-[9px] text-gray-400 font-medium">Add</span>}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoAdd}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-[12px] font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all active:scale-[0.99]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || form.rating === 0}
              className="flex-1 py-3 bg-black text-white text-[12px] font-bold rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
