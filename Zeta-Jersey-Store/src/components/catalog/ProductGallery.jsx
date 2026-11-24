/**
 * Product image gallery with thumbnail strip and main preview frame.
 */
export default function ProductGallery({
  images,
  selectedImg,
  onSelectImg,
  productName,
}) {
  const currentImg = selectedImg || images?.[0];

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-4">
      <div className="order-2 flex min-w-0 gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible">
        {images?.map((imgUrl, index) => (
          <button
            key={index}
            onClick={() => onSelectImg(imgUrl)}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 transition sm:w-full ${
              currentImg === imgUrl
                ? "ring-2 ring-zeta-sub"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={imgUrl}
              alt={productName}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <div className="order-1 aspect-[4/5] w-full min-w-0 overflow-hidden rounded-3xl bg-slate-50 sm:order-2 sm:max-h-[720px]">
        <img
          src={currentImg}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
