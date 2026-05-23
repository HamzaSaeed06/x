import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from '@/hooks/useNextRouter';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  RefreshCw,
  Package,
  Settings2,
  FileText,
  Save,
  Tag,
  Zap,
  List,
  Upload,
  Link as LinkIcon,
  Play,
} from 'lucide-react';
import { AdminSpinner } from '@/components/admin/AdminSpinner';
import { createProduct, updateProduct } from '@/lib/services/productService';
import type { Product, ProductAttribute, ProductVariant } from '@/types';
import toast from 'react-hot-toast';
import { getToken } from '@/lib/api';

interface ImageItem {
  id: string;
  url?: string;
  file?: File;
  previewUrl?: string;
}

interface ProductFormProps {
  initialData?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps = {}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    brand: initialData?.brand || '',
    material: initialData?.material || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    tags: initialData?.tags?.join(', ') || '',
    basePrice: initialData?.price || 0,
    comparePrice: initialData?.comparePrice || 0,
    baseStock: initialData?.stock || 0,
    weight: initialData?.weight || 0,
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    isFlashSale: initialData?.isFlashSale ?? false,
    flashSalePrice: initialData?.flashSalePrice || 0,
    flashSaleEndsAt: initialData?.flashSaleEndsAt
      ? new Date(initialData.flashSaleEndsAt).toISOString().slice(0, 16)
      : '',
  });

  const [attributes, setAttributes] = useState<ProductAttribute[]>(initialData?.attributes || []);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');

  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);

  const [mainImages, setMainImages] = useState<ImageItem[]>(() =>
    (initialData?.images || []).map(url => ({ id: Math.random().toString(36).substring(2, 9), url }))
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [colorImages, setColorImages] = useState<Record<string, ImageItem[]>>(() => {
    const initial: Record<string, ImageItem[]> = {};
    if (initialData?.colorImages) {
      Object.entries(initialData.colorImages).forEach(([color, urls]) => {
        initial[color] = urls.map(url => ({ id: Math.random().toString(36).substring(2, 9), url }));
      });
    }
    return initial;
  });
  const [sizeGuide, setSizeGuide] = useState<Record<string, string>>(initialData?.sizeGuide || {});
  const [activeImageTab, setActiveImageTab] = useState<'main' | string>('main');
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch('/api/upload/image', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let err: any;
      try { err = await res.json(); } catch {}
      throw new Error(err?.error ?? 'Upload failed');
    }

    const data = await res.json() as { url: string };
    return data.url;
  };

  const getVideoData = (url: string) => {
    if (!url) return { type: 'none' as const };
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return { 
        type: 'youtube' as const, 
        id: ytMatch[1], 
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&playlist=${ytMatch[1]}&loop=1&controls=0&modestbranding=1&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}` 
      };
    }
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return { 
        type: 'vimeo' as const, 
        id: vimeoMatch[1], 
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1&controls=0&api=1` 
      };
    }
    return { type: 'direct' as const, url };
  };

  const videoData = getVideoData(videoUrl);

  const togglePlayback = () => {
    if (videoData.type === 'direct' && videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    } else if (videoData.type === 'youtube' && iframeRef.current) {
      const command = isPaused ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: command }), '*');
      setIsPaused(!isPaused);
    } else if (videoData.type === 'vimeo' && iframeRef.current) {
      const command = isPaused ? 'play' : 'pause';
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({ method: command }), '*');
      setIsPaused(!isPaused);
    }
  };

  useEffect(() => {
    setVideoError(false);
    setIsPaused(false);
  }, [videoUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems: ImageItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (activeImageTab === 'main') {
      setMainImages(prev => [...prev, ...newItems]);
    } else {
      setColorImages(prev => ({
        ...prev,
        [activeImageTab]: [...(prev[activeImageTab] || []), ...newItems],
      }));
    }

    toast.success(`${files.length} image${files.length > 1 ? 's' : ''} added to upload queue!`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 50MB for video)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video file is too large. Max size is 50MB.');
      return;
    }

    setLocalVideoFile(file);
    const pUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(pUrl);
    setVideoUrl(pUrl);
    toast.success('Video added to upload queue!');
    if (videoFileInputRef.current) videoFileInputRef.current.value = '';
  };

  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(
    initialData?.specifications || []
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const handleAddAttribute = () => {
    if (!newAttributeName || !newAttributeValues) {
      toast.error('Attribute name and values are required');
      return;
    }
    const values = newAttributeValues.split(',').map((v) => v.trim()).filter(Boolean);
    if (values.length === 0) return;
    setAttributes([...attributes, { name: newAttributeName, values }]);
    setNewAttributeName('');
    setNewAttributeValues('');
  };

  const removeAttribute = (index: number) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  const generateVariants = () => {
    if (attributes.length === 0) {
      toast.error('Add at least one attribute to generate variants');
      return;
    }
    const cartesian = (...a: any[]) =>
      a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
    const combinations = cartesian(...attributes.map((a) => a.values));
    const newVariants: ProductVariant[] = combinations.map((combo: any) => {
      const variantAttrs: Record<string, string> = {};
      const comboArr = Array.isArray(combo) ? combo : [combo];
      attributes.forEach((attr, idx) => {
        variantAttrs[attr.name] = comboArr[idx];
      });
      return {
        id: Math.random().toString(36).substr(2, 9),
        sku: `${generateSlug(basicInfo.name)}-${Object.values(variantAttrs).join('-')}`.toUpperCase(),
        attributes: variantAttrs,
        price: basicInfo.basePrice,
        comparePrice: basicInfo.comparePrice || undefined,
        stock: basicInfo.baseStock,
        images: [],
        isActive: true,
        lowStockThreshold: 5,
      };
    });
    setVariants(newVariants);
    toast.success(`${newVariants.length} variants generated`);
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const addImage = () => {
    if (!newImageUrl) return;
    const newItem: ImageItem = {
      id: Math.random().toString(36).substring(2, 9),
      url: newImageUrl,
    };
    if (activeImageTab === 'main') {
      setMainImages([...mainImages, newItem]);
    } else {
      const current = colorImages[activeImageTab] || [];
      setColorImages({ ...colorImages, [activeImageTab]: [...current, newItem] });
    }
    setNewImageUrl('');
  };

  const removeImage = (item: ImageItem, tab: string) => {
    if (item.previewUrl) {
      URL.revokeObjectURL(item.previewUrl);
    }
    if (tab === 'main') {
      setMainImages(mainImages.filter((img) => img.id !== item.id));
    } else {
      setColorImages({ ...colorImages, [tab]: colorImages[tab].filter((img) => img.id !== item.id) });
    }
  };

  const addSpec = () => {
    if (!newSpecKey || !newSpecValue) return;
    setSpecifications([...specifications, { key: newSpecKey, value: newSpecValue }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicInfo.name || !basicInfo.category) {
      toast.error('Name and Category are required');
      return;
    }
    setIsSubmitting(true);
    try {
      // 1. Upload main images
      const finalMainImages: string[] = [];
      for (const item of mainImages) {
        if (item.file) {
          try {
            const url = await uploadFile(item.file);
            finalMainImages.push(url);
          } catch (err: any) {
            toast.error(`Main image upload failed: ${err.message || err}`);
            setIsSubmitting(false);
            return;
          }
        } else if (item.url) {
          finalMainImages.push(item.url);
        }
      }

      // 2. Upload color images
      const finalColorImages: Record<string, string[]> = {};
      for (const [color, items] of Object.entries(colorImages)) {
        const urls: string[] = [];
        for (const item of items) {
          if (item.file) {
            try {
              const url = await uploadFile(item.file);
              urls.push(url);
            } catch (err: any) {
              toast.error(`Color image upload failed for ${color}: ${err.message || err}`);
              setIsSubmitting(false);
              return;
            }
          } else if (item.url) {
            urls.push(item.url);
          }
        }
        if (urls.length > 0) {
          finalColorImages[color] = urls;
        }
      }

      // 3. Upload video if local video file selected
      let finalVideoUrl = videoUrl;
      if (localVideoFile) {
        try {
          finalVideoUrl = await uploadFile(localVideoFile);
        } catch (err: any) {
          toast.error(`Video upload failed: ${err.message || err}`);
          setIsSubmitting(false);
          return;
        }
      } else if (videoPreviewUrl) {
        finalVideoUrl = '';
      }

      const tags = basicInfo.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const productData: Partial<Product> = {
        name: basicInfo.name,
        slug: basicInfo.slug || generateSlug(basicInfo.name),
        description: basicInfo.description,
        brand: basicInfo.brand || undefined,
        material: basicInfo.material || undefined,
        category: basicInfo.category,
        subcategory: basicInfo.subcategory || '',
        tags,
        price: basicInfo.basePrice,
        comparePrice: basicInfo.comparePrice > 0 ? basicInfo.comparePrice : undefined,
        stock: variants.length > 0
          ? variants.reduce((acc, v) => acc + (v.stock || 0), 0)
          : basicInfo.baseStock,
        weight: basicInfo.weight > 0 ? basicInfo.weight : undefined,
        images: finalMainImages,
        videoUrl: finalVideoUrl || undefined,
        colorImages: finalColorImages,
        sizeGuide,
        specifications,
        attributes,
        variants,
        hasVariants: variants.length > 0,
        isActive: basicInfo.isActive,
        isFeatured: basicInfo.isFeatured,
        isFlashSale: basicInfo.isFlashSale,
        flashSalePrice: basicInfo.isFlashSale && basicInfo.flashSalePrice > 0
          ? basicInfo.flashSalePrice
          : undefined,
        flashSaleEndsAt: basicInfo.isFlashSale && basicInfo.flashSaleEndsAt
          ? new Date(basicInfo.flashSaleEndsAt)
          : undefined,
        lowStockThreshold: 5,
        sold: initialData?.sold ?? 0,
        views: initialData?.views ?? 0,
        rating: initialData?.rating ?? 0,
        reviewCount: initialData?.reviewCount ?? 0,
      };

      // Final safety: Remove any remaining undefined keys
      Object.keys(productData).forEach(key => {
        if ((productData as any)[key] === undefined) {
          delete (productData as any)[key];
        }
      });

      if (isEditing && initialData) {
        await updateProduct(initialData.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/products');
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = useMemo(() => {
    const colorAttr = attributes.find((a) => a.name.toLowerCase() === 'color');
    return colorAttr ? colorAttr.values : [];
  }, [attributes]);

  const sizes = useMemo(() => {
    const sizeAttr = attributes.find((a) => a.name.toLowerCase() === 'size');
    return sizeAttr ? sizeAttr.values : [];
  }, [attributes]);

  const inputClass =
    'w-full px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[13px] focus:ring-2 focus:ring-[var(--admin-accent)]/20 focus:border-[var(--admin-border-strong)] transition-all focus:outline-none';
  const labelClass = 'text-[13px] font-semibold text-[var(--admin-text-primary)]';

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-10">

      {/* ── 1. General Information ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
          <FileText size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">General Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Product Name *</label>
            <input
              type="text"
              required
              className={inputClass}
              value={basicInfo.name}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, name: e.target.value, slug: generateSlug(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Category *</label>
            <input
              type="text"
              required
              className={inputClass}
              value={basicInfo.category}
              onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Subcategory</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. T-Shirts"
              value={basicInfo.subcategory}
              onChange={(e) => setBasicInfo({ ...basicInfo, subcategory: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Brand</label>
            <input
              type="text"
              className={inputClass}
              value={basicInfo.brand}
              onChange={(e) => setBasicInfo({ ...basicInfo, brand: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className={labelClass}>Description *</label>
            <textarea
              rows={4}
              required
              className={inputClass}
              value={basicInfo.description}
              onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Material</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. 100% Cotton"
              value={basicInfo.material}
              onChange={(e) => setBasicInfo({ ...basicInfo, material: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Comma separated: summer, casual, sale"
              value={basicInfo.tags}
              onChange={(e) => setBasicInfo({ ...basicInfo, tags: e.target.value })}
            />
          </div>
        </div>

        {/* Status Toggles */}
        <div className="flex flex-wrap gap-6 pt-2">
          {[
            { key: 'isActive', label: 'Active (visible in store)' },
            { key: 'isFeatured', label: 'Featured Product' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setBasicInfo({ ...basicInfo, [key]: !basicInfo[key as keyof typeof basicInfo] })}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{ background: basicInfo[key as keyof typeof basicInfo] ? 'var(--admin-accent)' : 'var(--admin-border-strong)' }}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    basicInfo[key as keyof typeof basicInfo] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-[13px] font-medium text-[var(--admin-text-secondary)]">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ── 2. Pricing ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
          <Package size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">Pricing & Inventory</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Sale Price (PKR) *</label>
            <input
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={basicInfo.basePrice}
              onChange={(e) => setBasicInfo({ ...basicInfo, basePrice: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Compare Price (MRP)</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Original price (strikethrough)"
              className={inputClass}
              value={basicInfo.comparePrice || ''}
              onChange={(e) => setBasicInfo({ ...basicInfo, comparePrice: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Stock Quantity *</label>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={basicInfo.baseStock}
              onChange={(e) => setBasicInfo({ ...basicInfo, baseStock: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Weight (grams)</label>
            <input
              type="number"
              min="0"
              placeholder="For shipping"
              className={inputClass}
              value={basicInfo.weight || ''}
              onChange={(e) => setBasicInfo({ ...basicInfo, weight: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Flash Sale */}
        <div className="bg-[var(--admin-warning-bg)] border border-[var(--admin-border)] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Zap size={16} style={{ color: 'var(--admin-warning)' }} />
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setBasicInfo({ ...basicInfo, isFlashSale: !basicInfo.isFlashSale })}
                className="w-10 h-5 rounded-full transition-colors relative"
                style={{ background: basicInfo.isFlashSale ? 'var(--admin-warning)' : 'var(--admin-border-strong)' }}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    basicInfo.isFlashSale ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: 'var(--admin-warning)' }}>Enable Flash Sale</span>
            </label>
          </div>
          {basicInfo.isFlashSale && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)]">Flash Sale Price (PKR)</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={basicInfo.flashSalePrice || ''}
                  onChange={(e) => setBasicInfo({ ...basicInfo, flashSalePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)]">Sale Ends At (optional)</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={basicInfo.flashSaleEndsAt || ''}
                  onChange={(e) => setBasicInfo({ ...basicInfo, flashSaleEndsAt: e.target.value })}
                />
                <p className="text-[10px] text-[var(--admin-text-muted)]">Leave blank for no expiry</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Attributes & Variants ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
          <Settings2 size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">Attributes & Variants</h2>
        </div>

        {/* How-to guide */}
        <div className="bg-[var(--admin-info-bg)] border border-[var(--admin-border)] rounded-lg p-4 space-y-2 text-[12px]" style={{ color: 'var(--admin-info)' }}>
          <p className="font-bold">How to add colours and sizes:</p>
          <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--admin-info)' }}>
            <li>
              <span className="font-semibold">Colour with HEX code</span> → Attribute Name: <code className="bg-blue-100 px-1 !rounded-none">Color</code> &nbsp;|&nbsp; Values: <code className="bg-blue-100 px-1 !rounded-none">#1A1A2E, #E94560, #F5A623</code>
              <span className="text-blue-500 ml-1">(circle swatch auto-generated from the code)</span>
            </li>
            <li>
              <span className="font-semibold">Size</span> → Attribute Name: <code className="bg-blue-100 px-1 !rounded-none">Size</code> &nbsp;|&nbsp; Values: <code className="bg-blue-100 px-1 !rounded-none">S, M, L, XL, XXL</code>
            </li>
            <li>
              After adding colours you will see separate <span className="font-semibold">image tabs per colour</span> in the Media section below — upload photos for each colour there.
            </li>
          </ul>
        </div>

        <div className="bg-[var(--admin-surface-2)] p-6 rounded-lg border border-[var(--admin-border)] space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)] tracking-wider">
                  Attribute Name
                </label>
                <input type="text" className={inputClass} placeholder="e.g. Color or Size" value={newAttributeName} onChange={(e) => setNewAttributeName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)] tracking-wider">
                  Values (comma separated)
                </label>
                <input type="text" className={inputClass} placeholder={newAttributeName.toLowerCase() ==='color' ?'#1A1A2E, #E94560, #F5A623' : newAttributeName.toLowerCase() ==='size' ?'S, M, L, XL, XXL' :'Value1, Value2, Value3'} value={newAttributeValues} onChange={(e) => setNewAttributeValues(e.target.value)} />
              </div>
              <button type="button" onClick={handleAddAttribute} className="h-10 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all">
                <Plus size={16} /> Add Attribute
              </button>
            </div>

          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {attributes.map((attr, idx) => {
                const isColorAttr = attr.name.toLowerCase() === 'color';
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm"
                  >
                    <span className="text-[12px] font-semibold text-[var(--admin-text-primary)]">{attr.name}:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {attr.values.map((val) => {
                        const valIsHex = isColorAttr && /^#([0-9A-Fa-f]{3}){1,2}$/.test(val.trim());
                        return (
                          <span
                            key={val}
                            className="flex items-center gap-1 text-[11px] text-[var(--admin-text-secondary)] bg-[var(--admin-surface-2)] px-2 py-0.5 rounded border border-[var(--admin-border)]"
                          >
                            {valIsHex && (
                              <span
                                className="w-3 h-3 rounded-full border border-[var(--admin-border)] flex-shrink-0"
                                style={{ backgroundColor: val }}
                              />
                            )}
                            {val}
                          </span>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(idx)}
                      className="transition-colors ml-1 text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Size Guide */}
          {sizes.length > 0 && (
            <div className="pt-6 border-t border-[var(--admin-border)] space-y-4">
              <h3 className="text-[13px] font-semibold text-[var(--admin-text-primary)] tracking-wider">
                Size Guide Measurements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sizes.map((size) => (
                  <div key={size} className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)]">{size}</label>
                    <input type="text" placeholder="e.g. Chest 40', Length 28'" className={inputClass} value={sizeGuide[size] ||''} onChange={(e) => setSizeGuide({ ...sizeGuide, [size]: e.target.value })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {attributes.length > 0 && (
            <div className="pt-4 border-t border-[var(--admin-border)] flex items-center justify-between">
              <p className="text-[12px] text-[var(--admin-text-muted)] italic">
                Generate all variant combinations from attributes above.
              </p>
              <button type="button" onClick={generateVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text-primary)] text-[13px] font-semibold rounded-lg hover:bg-[var(--admin-surface-2)] transition-all" >
                <RefreshCw size={16} /> Generate Variants
              </button>
            </div>
          )}
        </div>

        {/* Variants Grid */}
        {variants.length > 0 && (
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--admin-surface-2)] border-b border-[var(--admin-border)]">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Variant</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">SKU</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Price</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Compare</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-text-secondary)]">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-[var(--admin-surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(variant.attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 bg-[var(--admin-surface-2)] text-[11px] font-semibold text-[var(--admin-text-secondary)] rounded"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input type="text" className="w-full px-2 py-1 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded text-[12px] focus:outline-none" value={variant.sku} onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-24 px-2 py-1 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded text-[12px] focus:outline-none" value={variant.price} onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" placeholder="MRP" className="w-24 px-2 py-1 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded text-[12px] focus:outline-none" value={variant.comparePrice ||''} onChange={(e) => updateVariant(variant.id, 'comparePrice', Number(e.target.value) || undefined)} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" className="w-20 px-2 py-1 bg-[var(--admin-surface-2)] border border-[var(--admin-border)] rounded text-[12px] focus:outline-none" value={variant.stock} onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 4. Media ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
          <ImageIcon size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">Media</h2>
        </div>

        {/* Image Tabs */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 border-b border-[var(--admin-border)]">
            <button
              type="button"
              onClick={() => setActiveImageTab('main')}
              className={`px-4 py-2 text-[13px] font-semibold transition-all -mb-px border-b-2 ${
                activeImageTab === 'main'
                  ? 'border-[var(--admin-accent)] text-[var(--admin-text-primary)]'
                  : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
              }`}
            >
              Main Images
            </button>
            {colors.map((color) => {
              const isHex = /^#([0-9A-Fa-f]{3}){1,2}$/.test(color.trim());
              const countForColor = (colorImages[color] || []).length;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveImageTab(color)}
                  className={`px-4 py-2 text-[13px] font-semibold transition-all flex items-center gap-2 -mb-px border-b-2 ${
                    activeImageTab === color
                      ? 'border-[var(--admin-accent)] text-[var(--admin-text-primary)]'
                      : 'border-transparent text-[var(--admin-text-muted)] hover:text-[var(--admin-text-secondary)]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-[var(--admin-border)] flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: isHex ? color : color.toLowerCase().replace(/\s+/g, '') }}
                  />
                  <span>{isHex ? color : color}</span>
                  {countForColor > 0 && (
                    <span className="text-[10px] bg-[var(--admin-surface-2)] text-[var(--admin-text-primary)] px-1.5 py-0.5 rounded font-semibold">
                      {countForColor}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-[var(--admin-surface-2)] p-6 rounded-lg border border-[var(--admin-border)] space-y-4">
            {/* Active tab context */}
            <div className="flex items-center gap-2 text-[12px] text-[var(--admin-text-muted)]">
              {activeImageTab !== 'main' && (() => {
                const isHex = /^#([0-9A-Fa-f]{3}){1,2}$/.test(activeImageTab.trim());
                return (
                  <span className="flex items-center gap-1.5 font-medium">
                    Adding images for colour:
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-[var(--admin-border)] shadow-sm"
                      style={{ backgroundColor: isHex ? activeImageTab : activeImageTab.toLowerCase() }}
                    />
                    <code className="bg-[var(--admin-border)] px-1.5 py-0.5 rounded font-semibold text-[var(--admin-text-primary)]">
                      {activeImageTab}
                    </code>
                    — when customer selects this colour, these images will appear in gallery.
                  </span>
                );
              })()}
              {activeImageTab === 'main' && (
                <span>These are the default product images shown before any colour is selected.</span>
              )}
            </div>
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />

            {/* Upload & URL row */}
            <div className="space-y-2">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[var(--admin-border-strong)] rounded-lg text-[13px] font-semibold text-[var(--admin-text-secondary)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface)] transition-all"
              >
                <Upload size={15} />
                Select from computer (uploaded on Save)
              </button>

              {/* URL input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-[var(--admin-border)]" />
                <span className="text-[11px] text-[var(--admin-text-muted)] font-medium">OR paste URL</span>
                <div className="flex-1 h-px bg-[var(--admin-border)]" />
              </div>
              <div className="flex gap-3">
                <input type="text" placeholder="Paste image URL (.jpg, .png, .webp) and press Enter" className={`flex-1 ${inputClass}`} value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button type="button" onClick={addImage} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all">Add</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {(activeImageTab === 'main'
                ? mainImages
                : colorImages[activeImageTab] || []
              ).map((item) => (
                <div
                  key={item.id}
                  className="group aspect-square relative bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg overflow-hidden p-2"
                >
                  <img
                    src={item.url || item.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(item, activeImageTab)}
                    className="absolute top-1 right-1 w-6 h-6 bg-[var(--admin-danger)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Product Cinematic Video ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
          <Video size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">Product Video</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--admin-surface-2)] p-6 rounded-lg border border-[var(--admin-border)]">
          {/* Upload Control */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)] tracking-wider">Upload Video</label>
            <input ref={videoFileInputRef} type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" onChange={handleVideoUpload} />
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              className="w-full h-12 flex items-center justify-center gap-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-[13px] font-semibold text-[var(--admin-text-secondary)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-text-primary)] transition-all shadow-sm"
            >
              <Upload size={16} />
              <span>Choose Local MP4 (uploaded on Save)</span>
            </button>
          </div>

          {/* Link Control */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-[var(--admin-text-secondary)] tracking-wider">Video URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon size={14} style={{ color: 'var(--admin-text-muted)' }} />
              </div>
              <input type="url" placeholder="Paste YouTube, Vimeo or direct link..." className={`${inputClass} h-12 pl-10`} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
            </div>
          </div>

          {/* Preview Area */}
          <div className="md:col-span-2 mt-2">
            <div className={`h-[280px] w-full rounded-lg overflow-hidden border relative flex items-center justify-center transition-all ${
              videoError ? 'border-[var(--admin-danger)] bg-[var(--admin-danger-bg)]' : 'bg-[var(--admin-surface)] border-[var(--admin-border)]'
            }`}>
              {videoData.type === 'none' ? (
                <div className="flex flex-col items-center gap-2" style={{ color: 'var(--admin-text-muted)', opacity: 0.5 }}>
                  <Video size={32} />
                  <span className="text-[10px] font-semibold">Preview Surface</span>
                </div>
              ) : videoError ? (
                <div className="flex flex-col items-center gap-3 text-center px-6">
                  <div className="w-12 h-12 bg-[var(--admin-danger-bg)] rounded-lg flex items-center justify-center">
                    <Video size={24} style={{ color: 'var(--admin-danger)' }} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-semibold text-[var(--admin-danger)]">Unsupported Media</h4>
                    <p className="text-[11px] mt-1 max-w-[200px] text-[var(--admin-text-muted)]">The link provided is not a direct video file or is temporarily unavailable.</p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {videoData.type === 'direct' ? (
                    <video
                      ref={videoRef}
                      key={videoUrl}
                      src={videoUrl}
                      autoPlay
                      muted
                      playsInline
                      loop
                      preload="auto"
                      onError={() => setVideoError(true)}
                      onPlay={() => setIsPaused(false)}
                      onPause={() => setIsPaused(true)}
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe
                      ref={iframeRef}
                      key={videoUrl}
                      src={`${videoData.embedUrl}`}
                      className="w-full h-full border-none pointer-events-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )}

                  <div
                    onClick={togglePlayback}
                    className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center bg-transparent group/player"
                  >
                    {isPaused && (
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl transition-all scale-100 group-hover/player:scale-110">
                        <Play size={32} className="text-white fill-white ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {videoData.type !== 'none' && (
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl('');
                    setVideoError(false);
                    setIsPaused(false);
                    setLocalVideoFile(null);
                    if (videoPreviewUrl) {
                      URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl('');
                    }
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-20"
                  style={{ color: 'var(--admin-danger)' }}
                  title="Remove Video"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Specifications ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--admin-border)]">
          <List size={20} style={{ color: 'var(--admin-text-secondary)' }} />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)]">Specifications</h2>
          <span className="text-[11px] text-[var(--admin-text-muted)] font-normal ml-1">
            Shown as a table on product page
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <input type="text" placeholder="Property (e.g. Country of Origin)" className={`flex-1 ${inputClass}`} value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} />
            <input type="text" placeholder="Value (e.g. Pakistan)" className={`flex-1 ${inputClass}`} value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())} />
            <button type="button" onClick={addSpec} className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] transition-all"><Plus size={16} /></button>
          </div>

          {specifications.length > 0 && (
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
              {specifications.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center px-4 py-2.5 border-b border-[var(--admin-border)] last:border-b-0 hover:bg-[var(--admin-surface-2)] transition-colors"
                >
                  <span className="text-[13px] font-semibold text-[var(--admin-text-secondary)] w-48 flex-shrink-0">
                    {spec.key}
                  </span>
                  <span className="text-[13px] text-[var(--admin-text-primary)] flex-1">{spec.value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="transition-colors text-[var(--admin-text-muted)] hover:text-[var(--admin-danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="pt-10 border-t border-[var(--admin-border)] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] text-[var(--admin-text-primary)] text-sm font-medium rounded-lg border border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-surface-2)] transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--admin-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--admin-accent-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <AdminSpinner size="sm" /> : <Save size={16} />}
          {isEditing ? 'Update Product' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
