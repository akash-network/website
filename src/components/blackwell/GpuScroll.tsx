import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

interface Product {
  title: string;
  description: string;
  imageUrl: string;
}

interface GpuScrollProps {
  products: Product[];
}

export function GpuScroll({ products }: GpuScrollProps) {
  return (
    <div className="md:hidden">
      <Swiper spaceBetween={16} slidesPerView={1.25} className="w-[90vw]">
        {products.map((product, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col gap-4 rounded-lg border p-4">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="size-20 rounded object-cover"
              />

              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold">{product.title}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
