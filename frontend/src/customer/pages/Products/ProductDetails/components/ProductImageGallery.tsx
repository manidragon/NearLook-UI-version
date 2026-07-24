import { FaHeart, FaRegHeart } from 'react-icons/fa';
import React from 'react';
import { Box, Modal, Typography } from '@mui/material';
import ZoomableImage from '../ZoomableImage';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'auto',
  height: '100%',
  boxShadow: 24,
  outline: 'none',
};

const PLACEHOLDER_50 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50'%3E%3Crect width='50' height='50' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='8' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
const PLACEHOLDER_600 = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Crect width='600' height='600' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23999'%3ENo Image Available%3C/text%3E%3C/svg%3E";

const lumenCss = `
.lumen-gallery {
  font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
  color: rgba(10,22,40,.88);
}
.lumen-gallery__main {
  padding: 14px;
  border-radius: 24px;
  border: 1px solid rgba(18,36,66,.12);
  background: linear-gradient(180deg, rgba(18,36,66,.06), transparent);
  box-shadow: 0 12px 32px rgba(12,24,44,.12);
}
.lumen-mediaFrame {
  position: relative;
  border-radius: 20px;
  border: 1px solid rgba(18,36,66,.12);
  overflow: hidden;
  background:
    radial-gradient(420px 220px at 20% 20%, rgba(121,242,223,.14), transparent 60%),
    radial-gradient(380px 220px at 80% 10%, rgba(79,160,255,.12), transparent 55%),
    linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
  background-color: #f4f6f8; /* fallback */
  aspect-ratio: 1 / 1;
}
.lumen-mediaFrame__img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transform: scale(1.02); filter: saturate(1.05) contrast(1.05);
  transition: transform .38s ease, filter .38s ease;
}
.lumen-mediaFrame:hover .lumen-mediaFrame__img {
  transform: scale(1.06); filter: saturate(1.12) contrast(1.08);
}
.lumen-mediaFrame__shine {
  position: absolute; inset: -2px;
  background: radial-gradient(520px 220px at 20% 10%, rgba(255,255,255,.18), transparent 55%);
  opacity: .55; pointer-events: none; mix-blend-mode: overlay;
}
.lumen-cornerTag {
  position: absolute; left: 14px; top: 14px;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 999px;
  border: 1px solid rgba(10,22,40,.14);
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  font-weight: 700; font-size: 13px;
  color: #0a1628;
  z-index: 10;
}
.lumen-cornerTag svg {
  width: 14px; height: 14px; fill: currentColor;
}
.lumen-zoomBtn {
  position: absolute; right: 12px; bottom: 12px;
  display: flex; align-items: center; gap: 8px;
  height: 40px; padding: 0 16px; border-radius: 14px;
  border: 1px solid rgba(18,36,66,.12);
  background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(255,255,255,.65));
  color: #0a1628; cursor: pointer;
  transition: transform .18s ease, border-color .18s ease, background .18s ease;
  font-family: inherit; font-weight: 700; font-size: 14px;
  z-index: 10;
}
.lumen-zoomBtn:hover { transform: translateY(-1px); border-color: rgba(18,36,66,.18); }
.lumen-zoomBtn:active { transform: translateY(0) scale(.98); }

.lumen-thumbs {
  margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
}
.lumen-thumb {
  border: 1px solid rgba(18,36,66,.12);
  background: linear-gradient(180deg, rgba(18,36,66,.06), transparent);
  border-radius: 16px; cursor: pointer; padding: 8px;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.lumen-thumb:hover { transform: translateY(-1px); border-color: rgba(18,36,66,.18); box-shadow: 0 12px 32px rgba(12,24,44,.12); }
.lumen-thumb.is-active {
  border-color: rgba(42,102,255,.55);
  box-shadow: 0 0 0 4px rgba(42,102,255,.14);
}
.lumen-thumb__frame {
  display: block; border-radius: 12px; overflow: hidden; aspect-ratio: 1 / 1;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
}
.lumen-thumb img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform .35s ease, filter .35s ease;
}
.lumen-thumb:hover img { transform: scale(1.06); filter: saturate(1.12); }

.heart-container {
  --heart-color: rgb(255, 91, 137);
  position: relative;
  width: 40px;
  height: 40px;
  transition: .3s;
}

.heart-container .checkbox {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 20;
  cursor: pointer;
}

.heart-container .svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.heart-container .svg-outline,
.heart-container .svg-filled {
  fill: var(--heart-color);
  position: absolute;
  width: 24px;
  height: 24px;
}

.heart-container .svg-filled {
  animation: keyframes-svg-filled 1s;
  display: none;
}

.heart-container .svg-celebrate {
  position: absolute;
  animation: keyframes-svg-celebrate .5s;
  animation-fill-mode: forwards;
  display: none;
  stroke: var(--heart-color);
  fill: var(--heart-color);
  stroke-width: 2px;
}

.heart-container .checkbox:checked ~ .svg-container .svg-filled {
  display: block;
}

.heart-container .checkbox:checked ~ .svg-container .svg-celebrate {
  display: block;
}

@keyframes keyframes-svg-filled {
  0% { transform: scale(0); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); filter: brightness(1.5); }
}

@keyframes keyframes-svg-celebrate {
  0% { transform: scale(0); }
  50% { opacity: 1; filter: brightness(1.5); }
  100% { transform: scale(1.4); opacity: 0; display: none; }
}

`;

interface ProductImageGalleryProps {
  displayImages: string[];
  selectedImage: number;
  setSelectedImage: (index: number) => void;
  productTitle: string;
  open: boolean;
  handleOpen: () => void;
  handleClose: () => void;
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>, size: '50' | '600') => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  displayImages,
  selectedImage,
  setSelectedImage,
  productTitle,
  open,
  handleOpen,
  handleClose,
  handleImageError,
  isWishlisted,
  onToggleWishlist
}) => {
  const viewerRef = React.useRef<HTMLDivElement>(null);
  const [zoomTransform, setZoomTransform] = React.useState('');
  const [isZooming, setIsZooming] = React.useState(false);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const handleMouseMove = (evt: React.MouseEvent) => {
    if (!viewerRef.current) return;
    setIsZooming(true);
    const rect = viewerRef.current.getBoundingClientRect();
    const x = clamp(evt.clientX - rect.left, 0, rect.width);
    const y = clamp(evt.clientY - rect.top, 0, rect.height);
    const rx = rect.width ? x / rect.width : 0.5;
    const ry = rect.height ? y / rect.height : 0.5;

    const z = 2.2;
    const maxX = (rect.width * (z - 1)) / 2;
    const maxY = (rect.height * (z - 1)) / 2;

    const dx = (rx - 0.5) * 2;
    const dy = (ry - 0.5) * 2;

    const tx = clamp(-dx * maxX, -maxX, maxX);
    const ty = clamp(-dy * maxY, -maxY, maxY);

    setZoomTransform(`translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${z.toFixed(2)})`);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomTransform('');
  };

  return (
    <div className="w-full lg:w-[40%] flex flex-col gap-3">
      <style>{lumenCss}</style>
      
      <div className="lumen-gallery">
        <div className="lumen-gallery__main">
          <div 
            className="lumen-mediaFrame" 
            id="mainMediaFrame"
            ref={viewerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseMove}
          >
            {displayImages.length > 0 && displayImages[selectedImage] ? (
              <img
                id="mainImg"
                className="lumen-mediaFrame__img"
                alt={productTitle}
                loading="eager"
                src={displayImages[selectedImage]}
                onError={(e) => handleImageError(e, '600')}
                style={isZooming ? {
                  transform: zoomTransform,
                  transition: 'transform 0.1s ease-out',
                  transformOrigin: 'center center',
                  willChange: 'transform'
                } : undefined}
              />
            ) : (
               <img
                id="mainImg"
                className="lumen-mediaFrame__img"
                alt="No image"
                loading="eager"
                src={PLACEHOLDER_600}
              />
            )}
            <div className="lumen-mediaFrame__shine" aria-hidden="true"></div>

            
            <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all hover:scale-110 active:scale-95 flex items-center justify-center" style={{ width: '44px', height: '44px' }}>
              <div className="heart-container" title="Like">
              <input 
                type="checkbox" 
                className="checkbox" 
                id="wishlist-checkbox"
                checked={isWishlisted} 
                onChange={onToggleWishlist} 
              />
              <div className="svg-container">
                  <svg viewBox="0 0 24 24" className="svg-outline" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                      </path>
                  </svg>
                  <svg viewBox="0 0 24 24" className="svg-filled" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                      </path>
                  </svg>
                  <svg className="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="10,10 20,20"></polygon>
                      <polygon points="10,50 20,50"></polygon>
                      <polygon points="20,80 30,70"></polygon>
                      <polygon points="90,10 80,20"></polygon>
                      <polygon points="90,50 80,50"></polygon>
                      <polygon points="80,80 70,70"></polygon>
                  </svg>
              </div>
              </div>
            </div>
          </div>

          <div className="lumen-thumbs" id="thumbs" aria-label="Product thumbnails">
            {displayImages.length > 0 ? (
              displayImages.map((item: string, index: number) => (
                <button 
                  key={index}
                  className={`lumen-thumb ${selectedImage === index ? 'is-active' : ''}`} 
                  type="button" 
                  onClick={() => setSelectedImage(index)}
                >
                  <span className="lumen-thumb__frame">
                    <img alt={`Thumb ${index + 1}`} loading="lazy" src={item} onError={(e) => handleImageError(e, '50')} />
                  </span>
                </button>
              ))
            ) : (
               <button className="lumen-thumb is-active" type="button">
                  <span className="lumen-thumb__frame">
                    <img alt="Thumb 1" loading="lazy" src={PLACEHOLDER_50} />
                  </span>
                </button>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FOR IMAGE ZOOM */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          {displayImages.length > 0 && displayImages[selectedImage] ? (
            <ZoomableImage
              src={displayImages[selectedImage]}
              alt={productTitle}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
              <Typography color="text.secondary">No image available</Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default ProductImageGallery;
