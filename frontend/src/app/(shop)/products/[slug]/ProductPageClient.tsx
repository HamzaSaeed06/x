import { useState, useMemo } from 'react';
import type { Product, StoreSettings } from '@/types';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductDetailClient } from './ProductDetailClient';
import { discountPercent } from '@/utils/formatters';

export function ProductPageClient({
  product,
  settings,
}: {
  product: Product;
  settings?: Pick<StoreSettings, 'deliveryEstimate' | 'returnPolicy' | 'returnPolicyDays' | 'warrantyPolicy' | 'freeDeliveryThreshold'>;
}) {
  const [displayImages, setDisplayImages] = useState<string[]>(product.images);

  const isFlashSale = !!(product.isFlashSale && product.flashSalePrice);
  const displayPrice = isFlashSale ? product.flashSalePrice! : product.price;
  const comparePrice = isFlashSale ? product.price : product.comparePrice;
  const discount = comparePrice ? discountPercent(comparePrice, displayPrice) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 mb-12 sm:mb-16 lg:mb-24">
      <ProductGallery
        images={displayImages}
        videoUrl={product.videoUrl}
        productName={product.name}
        isFlashSale={isFlashSale}
        discount={discount}
      />
      <ProductDetailClient
        product={product}
        settings={settings}
        onDisplayImagesChange={setDisplayImages}
      />
    </div>
  );
}
