import os
import sys

file_path = r'd:\Mani\Code with Zosh\UI version\source code\frontend\src\customer\pages\Products\ProductDetails\ProductDetails.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find `return (` at the bottom of the component.
# There is a `return (` for `ProductDetails = () => {`. It starts at line 1225.
# Let's search for "return (" after "renderSellerOffers = () => {"
marker = "const renderSellerOffers = () => {"
idx = content.find(marker)
if idx == -1:
    print("Could not find marker")
    sys.exit(1)

return_idx = content.find("return (", idx)
if return_idx == -1:
    print("Could not find return (")
    sys.exit(1)

# Now we construct the new JSX
new_jsx = """return (
    <>
      <div className="!py-2">
        <div className="container px-5 lg:px-20 mx-auto">
          <Breadcrumbs aria-label="breadcrumb">
            <Typography
              component="span"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              color="inherit"
              onClick={() => navigate("/")}
              className="link transition !text-[14px]"
            >
              Home
            </Typography>
            <Typography
              component="span"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              color="inherit"
              onClick={() => navigate("/products")}
              className="link transition !text-[14px]"
            >
              Fashion
            </Typography>
            <Typography
              component="span"
              color="inherit"
              className="link transition !text-[14px]"
            >
              {product?.title || 'Product Details'}
            </Typography>
          </Breadcrumbs>
        </div>
      </div>

      <section className="bg-white !py-5 px-5 lg:px-20 mx-auto">
        <div className="container mx-auto">
          {products.loading || catalogLoading ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : !product ? (
            <Alert severity="error">Product not found</Alert>
          ) : (
            <div className="flex !gap-1 flex-col lg:flex-row">
              
              {/* IMAGE GALLERY (LEFT COLUMN) */}
              <div className="productZoomContainer w-full lg:w-[40%] flex flex-col gap-3">
                <div className="w-full">
                  {displayImages.length > 0 && displayImages[selectedImage] ? (
                    <img
                      onClick={handleOpen}
                      className="w-full rounded-md cursor-zoom-in object-cover max-h-[500px]"
                      src={displayImages[selectedImage]}
                      alt={product.title}
                      onError={(e) => handleImageError(e, '600')}
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={PLACEHOLDER_600}
                      alt="No image"
                      className="w-full rounded-md object-cover max-h-[500px]"
                    />
                  )}
                </div>
                
                <div className="w-full flex gap-3 overflow-x-auto no-scrollbar py-2">
                  {displayImages.length > 0 ? (
                    displayImages.map((item: string, index: number) => (
                      <img
                        key={`${item}-${index}`}
                        onClick={() => setSelectedImage(index)}
                        className={`w-[60px] h-[60px] lg:h-[80px] lg:w-[80px] cursor-pointer rounded-md object-cover border-2 flex-shrink-0 ${selectedImage === index ? 'border-orange-600' : 'border-gray-200 hover:border-orange-400'}`}
                        src={item}
                        alt={`${product.title} - ${index + 1}`}
                        onError={(e) => handleImageError(e, '50')}
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <img
                      src={PLACEHOLDER_50}
                      alt="No image"
                      className="w-[60px] h-[60px] lg:h-[80px] lg:w-[80px] rounded-md object-cover border-gray-200"
                    />
                  )}
                </div>

                {/* MODAL FOR IMAGE ZOOM */}
                <Modal open={open} onClose={handleClose}>
                  <Box sx={style}>
                    {displayImages.length > 0 && displayImages[selectedImage] ? (
                      <ZoomableImage
                        src={displayImages[selectedImage]}
                        alt={product.title}
                      />
                    ) : (
                      <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
                        <Typography color="text.secondary">No image available</Typography>
                      </Box>
                    )}
                  </Box>
                </Modal>
              </div>

              {/* PRODUCT CONTENT (RIGHT COLUMN) */}
              <div className="productContent w-full lg:w-[60%] md:pr-10 md:pl-10 lg:pl-14">
                <h1 className="text-[18px] sm:text-[22px] font-[600] mb-2 text-gray-800">
                  {product.title}
                </h1>
                
                <div className="flex items-start sm:items-center flex-col sm:flex-row md:flex-row lg:flex-row gap-3 justify-start">
                  {product.brand && (
                    <span className="text-gray-500 text-[13px]">
                      Brand: <span className="font-[600] text-gray-800 opacity-90">{product.brand}</span>
                    </span>
                  )}
                  {(() => {
                    const totalReviews = review.reviews?.length || 0;
                    const totalStars = review.reviews?.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) || 0;
                    const averageRating = totalReviews > 0 ? (totalStars / totalReviews).toFixed(1) : '0';
                    return (
                      <div className="flex items-center gap-2">
                        <Rating value={Number(averageRating)} size="small" readOnly sx={{ color: '#FFB800' }} />
                        <span 
                          className="text-[13px] cursor-pointer text-gray-600 hover:text-orange-600 transition"
                          onClick={() => { setActiveTab(2); setTimeout(() => window.scrollBy({top: 800, behavior: 'smooth'}), 100); }}
                        >
                          Review({totalReviews})
                        </span>
                      </div>
                    );
                  })()}
                </div>

                {/* PRICE SECTION */}
                <div className="price mt-5 flex flex-col sm:flex-row md:flex-row lg:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[24px] font-[700] text-orange-600">
                      ₹{currentVariant?.sellingPrice?.toLocaleString() || product.sellingPrice?.toLocaleString() || 'N/A'}
                    </span>
                    {((currentVariant?.mrpPrice && currentVariant.mrpPrice > currentVariant.sellingPrice) || (!currentVariant && product.mrpPrice && product.mrpPrice > product.sellingPrice)) && (
                      <>
                        <span className="oldPrice text-[15px] text-gray-500 line-through">
                          ₹{currentVariant?.mrpPrice?.toLocaleString() || product.mrpPrice?.toLocaleString()}
                        </span>
                        <span className="text-green-600 font-bold text-sm ml-2">
                          {calculateDiscount(currentVariant?.mrpPrice || product.mrpPrice, currentVariant?.sellingPrice || product.sellingPrice)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-gray-600">
                      Available In Stock:
                      <span className={`text-[14px] ml-1 font-bold ${currentVariant?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {currentVariant?.stock || 0}
                      </span>
                    </span>
                  </div>
                </div>

                {/* COLOR VARIANTS */}
                {colorsWithImages.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-800">Color</h4>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      {colorsWithImages.map((colorData, index) => {
                        const firstVariant = sellerIdFromProfile
                          ? colorData.variants.find((variant: any) =>
                            variant.offers?.some((o: any) => String(o.seller?._id || o.seller) === String(sellerIdFromProfile) && o.isActive !== false && (o.stock ?? 0) > 0)
                          )
                          : colorData.variants[0];
                        const isSelected = selectedColor === colorData.color;
                        const imageSrc = colorData.images[0] || PLACEHOLDER_50;

                        return (
                          <Tooltip key={colorData.color} title={colorData.color} placement="top" arrow>
                            <div
                              className={`group relative min-w-[60px] w-[60px] h-[60px] lg:h-[70px] lg:min-w-[70px] lg:w-[70px] border rounded cursor-pointer overflow-hidden transition-all duration-200
                                ${isSelected ? "border-orange-600 shadow-md transform scale-105" : "border-gray-300 hover:border-orange-400"}
                              `}
                              onClick={() => handleColorSelect(colorData.color, firstVariant?._id)}
                            >
                              <img src={imageSrc} alt={colorData.color} className="w-full h-full object-cover rounded" onError={(e) => handleImageError(e, '50')} />
                              {isSelected && <div className="absolute inset-0 bg-orange-600/10 rounded border-[2px] border-orange-600"></div>}
                            </div>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SIZE VARIANTS */}
                {availableVariantsForColor.length > 0 && variantAttributes.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3 w-max gap-8">
                      <h4 className="text-sm font-semibold text-gray-800">Variant ({variantAttributes.map(a => a.name).join(' + ')})</h4>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {availableVariantsForColor.map((variant: ProductVariant) => {
                        const isSelected = selectedVariantId === variant._id;
                        const variantLabels = variantAttributes.map((attr) => variant.specifications?.[attr.name]).filter(Boolean);
                        const combinedLabel = variantLabels.join(' + ');
                        const isInOtherColors = checkIsInOtherColors(variant, selectedColor);
                        const hasActiveOffer = variant.offers?.some((o: any) => o.isActive !== false && (o.stock ?? 0) > 0);

                        return (
                          <button
                            key={variant._id}
                            disabled={!hasActiveOffer && !isInOtherColors}
                            onClick={() => { if (hasActiveOffer || isInOtherColors) handleVariantSelect(variant); }}
                            className={`
                              px-4 py-2 text-sm md:text-[15px] font-medium border rounded transition-all duration-200
                              ${isSelected ? "border-orange-600 bg-orange-50 text-orange-600 shadow-sm transform scale-[1.02]" : "border-gray-300 text-gray-700 hover:border-gray-500 bg-white"}
                              ${!hasActiveOffer && !isInOtherColors ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer"}
                            `}
                          >
                            {combinedLabel}
                            {!hasActiveOffer && isInOtherColors && <span className="block text-[10px] text-gray-500 mt-0.5">Other colors</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SELLER OFFERS */}
                {isCatalogProduct && sellerOffers.length > 0 && selectedVariantId && (
                  <div className="my-8 text-sm space-y-3">
                    <h3 className="font-semibold text-gray-800 text-sm mb-3">Select Seller ({sellerOffers.length} offers)</h3>
                    {sellerOffers.map((offer) => {
                      const variant = offer.variants.find((v: any) => v._id === selectedVariantId);
                      if (!variant) return null;
                      
                      const isSelected = selectedSellerOffer?._id === offer._id;
                      const isExpanded = expandedSellerId === offer._id;
                      const sellerName = offer.seller?.businessDetails?.businessName || offer.seller?.sellerName || 'Seller';
                      
                      const currentSellerId = typeof offer?.seller === 'string' ? offer.seller : offer?.seller?._id;
                      const sellerReviews = currentSellerId ? sellerReviewState.reviewsBySeller[currentSellerId] || [] : [];
                      const sellerAvgRating = sellerReviews.length > 0 ? (sellerReviews.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / sellerReviews.length).toFixed(1) : null;
                      
                      const discount = variant.mrpPrice && variant.mrpPrice > variant.sellingPrice ? Math.round(((variant.mrpPrice - variant.sellingPrice) / variant.mrpPrice) * 100) : 0;

                      return (
                        <div
                          key={offer._id}
                          className={`
                            border rounded-lg p-4 transition-all duration-300 ease-out cursor-pointer
                            ${isSelected ? "border-orange-500 bg-[#fffaf0] shadow-md scale-[1.01]" : "border-gray-200 bg-white hover:shadow-sm hover:border-gray-300"}
                          `}
                          onClick={() => setSelectedSellerOffer(offer)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                checked={isSelected}
                                readOnly
                                className="accent-orange-600 w-4 h-4 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-[600] text-[15px] text-gray-800 hover:text-orange-600 transition" onClick={(e) => handleNavigateToSeller(offer, e)}>
                                    {sellerName}
                                  </span>
                                  {sellerAvgRating && (
                                    <span 
                                      className="bg-[#0a8f08] text-white text-[11px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                      onClick={(e) => handleOpenReviewDrawer(offer, sellerReviews, sellerName, e)}
                                    >
                                      {sellerAvgRating} ★
                                    </span>
                                  )}
                                  <span className="text-green-600 text-[11px] font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                    ✔ Verified
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[13px] text-gray-600">
                                  <span className="font-bold text-gray-900">₹{variant.sellingPrice?.toLocaleString()}</span>
                                  {discount > 0 && <span className="text-green-600 font-medium">({discount}% OFF)</span>}
                                  <span className="text-gray-300">|</span>
                                  <span>Stock: <span className={variant.stock > 2 ? 'text-gray-700' : 'text-red-500 font-medium'}>{variant.stock}</span></span>
                                  {locationFilter?.type === 'current' && offer.distance !== null && offer.distance !== undefined && !isNaN(offer.distance) && (
                                    <>
                                      <span className="text-gray-300">|</span>
                                      <span className="text-orange-600">{formatDistance(offer.distance)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <button
                              className="flex items-center gap-1 text-gray-500 text-xs font-medium hover:text-orange-600 transition bg-gray-50 hover:bg-orange-50 px-2 py-1.5 rounded-full"
                              onClick={(e) => { e.stopPropagation(); setExpandedSellerId(isExpanded ? null : offer._id); }}
                            >
                              <span>{isExpanded ? "Hide" : "Details"}</span>
                              <FiChevronDown className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`} size={14} />
                            </button>
                          </div>

                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100 mt-4 pt-3 border-t border-gray-100" : "max-h-0 opacity-0"}`}>
                            <div className="text-gray-600 space-y-2 text-[13px] grid grid-cols-2 gap-x-4">
                              <p><span className="font-medium text-gray-800">Price:</span> ₹{variant.sellingPrice} {variant.mrpPrice && <del className="text-gray-400 ml-1">₹{variant.mrpPrice}</del>}</p>
                              <p><span className="font-medium text-gray-800">Delivery:</span> Standard Delivery</p>
                              <p><span className="font-medium text-gray-800">Returns:</span> 10 Days Return</p>
                              <p><span className="font-medium text-gray-800">Warranty:</span> Not Applicable</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* PRODUCT BENEFITS */}
                <div className="mt-7 py-4 border-y border-gray-100">
                  <div className="flex gap-4 justify-between sm:justify-start sm:gap-8 overflow-x-auto no-scrollbar">
                    {[
                      { icon: FaUndoAlt, label: "10 Days Return" },
                      { icon: FaMoneyBillWave, label: "Pay on Delivery" },
                      { icon: FaTruck, label: "Free Delivery" },
                      { icon: FaStar, label: "Top Brand" },
                      { icon: FaLock, label: "Secure Payment" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center min-w-[75px] text-center group cursor-pointer">
                        <div className="w-11 h-11 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          <item.icon className="text-lg" />
                        </div>
                        <p className="text-[11px] mt-2 text-gray-700 font-medium leading-tight px-1 group-hover:text-orange-600 transition-colors">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADD TO CART ACTION BAR */}
                <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-4 py-6 w-full">
                  <div className="flex items-center justify-between border border-gray-300 rounded-full px-4 py-2 bg-white w-full sm:w-[140px] shadow-sm">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="text-gray-500 hover:text-orange-600 disabled:opacity-30 transition cursor-pointer p-1"
                    >
                      <FiMinus size={18} />
                    </button>
                    <span className="font-semibold text-[16px] text-gray-800 min-w-[20px] text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      disabled={currentVariant && currentVariant.stock !== undefined && quantity >= currentVariant.stock}
                      className="text-gray-500 hover:text-orange-600 disabled:opacity-30 transition cursor-pointer p-1"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>

                  <button
                    disabled={!currentVariant || currentVariant.stock === 0 || (sellerOffers.length > 0 && !selectedSellerOffer)}
                    onClick={handleAddCart}
                    className="flex items-center justify-center gap-2 rounded-full w-full py-3.5 px-6 font-bold text-[15px] uppercase tracking-wide transition-all duration-300 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    style={{ background: (!currentVariant || currentVariant.stock === 0 || (sellerOffers.length > 0 && !selectedSellerOffer)) ? '#ccc' : 'linear-gradient(to right, #FF7E00, #FF5A00)' }}
                  >
                    <MdOutlineShoppingCart className="text-[20px]" />
                    {(!currentVariant || currentVariant.stock === 0) ? 'Out of Stock' : (sellerOffers.length > 0 && !selectedSellerOffer) ? 'Select a Seller' : 'Add to Cart'}
                  </button>
                </div>

                <div className="flex items-center gap-6 my-2 pb-5 border-b border-gray-100">
                  <button className="flex items-center gap-2 text-[14px] text-gray-600 hover:text-orange-600 transition font-medium group">
                    <FaRegHeart className="text-[18px] text-gray-400 group-hover:text-orange-600 transition" /> Add to Wishlist
                  </button>
                  <button className="flex items-center gap-2 text-[14px] text-gray-600 hover:text-orange-600 transition font-medium group">
                    <LuGitCompareArrows className="text-[18px] text-gray-400 group-hover:text-orange-600 transition" /> Add to Compare
                  </button>
                </div>

                {/* ACCORDIONS FOR MOBILE */}
                {context.windowWidth < 992 && (
                  <div className="mt-4">
                    <Accordion expanded={productDetailsOpen} onChange={() => setProductDetailsOpen(!productDetailsOpen)} elevation={0} className="border border-gray-200 rounded-lg mb-3 overflow-hidden !shadow-none before:hidden">
                      <AccordionSummary expandIcon={productDetailsOpen ? <FiMinus className="text-orange-600" /> : <FiPlus className="text-gray-500" />} className="bg-gray-50/50 hover:bg-gray-50">
                        <h3 className="font-semibold text-[15px] text-gray-800">Product Details</h3>
                      </AccordionSummary>
                      <AccordionDetails className="bg-white border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                          {highlightAttributes.map((attr: CategoryAttribute) => {
                            const value = (product.highlights || {})[attr.name] || currentVariant?.specifications?.[attr.name];
                            if (!value) return null;
                            return (
                              <div className="flex border-b border-gray-50 pb-2" key={attr.name}>
                                <span className="w-32 sm:w-40 text-gray-500 font-medium">{attr.label}</span>
                                <span className="text-gray-800 flex-1">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionDetails>
                    </Accordion>

                    <Accordion expanded={discriptionOpen} onChange={() => setdiscriptionOpen(!discriptionOpen)} elevation={0} className="border border-gray-200 rounded-lg mb-3 overflow-hidden !shadow-none before:hidden">
                      <AccordionSummary expandIcon={discriptionOpen ? <FiMinus className="text-orange-600" /> : <FiPlus className="text-gray-500" />} className="bg-gray-50/50 hover:bg-gray-50">
                        <h3 className="font-semibold text-[15px] text-gray-800">Description</h3>
                      </AccordionSummary>
                      <AccordionDetails className="bg-white border-t border-gray-100 pt-4">
                        <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {product.description}
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DESKTOP TABS */}
          {product && context.windowWidth >= 992 && (
            <div className="pt-16 pb-10 border-t border-gray-100 mt-10">
              <div className="flex items-center gap-10 mb-8 border-b border-gray-200">
                {['Description', 'Product Details', `Reviews (${review.reviews?.length || 0})`].map((tab, idx) => (
                  <button
                    key={idx}
                    className={`text-[16px] font-[600] pb-3 transition-all relative ${activeTab === idx ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {tab}
                    {activeTab === idx && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-600 rounded-t-md"></span>}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg min-h-[200px]">
                {activeTab === 0 && (
                  <div className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap max-w-4xl">
                    {product.description}
                  </div>
                )}

                {activeTab === 1 && (
                  <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-[14px] max-w-4xl">
                    {highlightAttributes.map((attr: CategoryAttribute) => {
                      const value = (product.highlights || {})[attr.name] || currentVariant?.specifications?.[attr.name];
                      if (!value) return null;
                      return (
                        <div className="flex border-b border-gray-100 pb-3" key={attr.name}>
                          <span className="w-48 text-gray-500 font-medium">{attr.label}</span>
                          <span className="text-gray-800 flex-1">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 2 && (
                  <div className="max-w-4xl">
                    <div className="space-y-6">
                      {(review.reviews || []).slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                          <ProductReviewCard item={item} />
                        </div>
                      ))}
                      {review.reviews?.length > 0 && (
                        <button 
                          onClick={() => navigate(`/reviews/${productId}`)}
                          className="mt-4 px-6 py-2.5 border border-orange-600 text-orange-600 font-medium rounded-full hover:bg-orange-50 transition"
                        >
                          View All {review.reviews?.length || 0} Reviews
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SIMILAR PRODUCTS */}
          {product && (
            <section className="mt-16 pt-10 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
                <Typography variant="h5" fontWeight="bold" className="text-gray-800">
                  Similar Products
                </Typography>
              </div>
              <SmilarProduct />
            </section>
          )}

        </div>
      </section>

      {/* SELLER REVIEW DRAWER */}
      <Drawer anchor="right" open={openSellerDrawer} onClose={() => setOpenSellerDrawer(false)}>
        <Box sx={{ width: 580, p: 3, bgcolor: '#f8f8f8', height: '100%' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography fontWeight="bold" fontSize={20}>Ratings and reviews</Typography>
            <IconButton onClick={() => setOpenSellerDrawer(false)}><CloseIcon /></IconButton>
          </Box>
          {(() => {
            const avg = selectedSellerReviews.length ? selectedSellerReviews.reduce((sum, r) => sum + r.rating, 0) / selectedSellerReviews.length : 0;
            let text = 'Poor';
            if (avg >= 4) text = 'Very Good';
            else if (avg >= 3) text = 'Good';
            else if (avg >= 2) text = 'Average';
            return (
              <>
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <Typography fontSize={28} fontWeight="700" lineHeight={1} display="flex" alignItems="center" gap={0.5}>
                    {avg.toFixed(1)} <StarIcon sx={{ color: '#0a8f08', fontSize: 28 }} />
                  </Typography>
                  <Chip label={text} sx={{ bgcolor: '#dff5ec', color: 'green', fontWeight: 'bold' }} />
                </Box>
                <Typography color="#777" fontSize={14} mt={1}>based on {selectedSellerReviews.length} ratings by verified buyers</Typography>
              </>
            );
          })()}
          <Box display="grid" gridTemplateColumns="2fr 1fr 1fr" gap={1} mt={3}>
            {selectedSellerReviews.flatMap((r) => r.images || []).slice(0, 5).map((img, i) => (
              <img key={i} src={img} style={{ width: '100%', height: i === 0 ? 220 : 105, objectFit: 'cover', borderRadius: 12 }} />
            ))}
          </Box>
          <Typography mt={4} mb={2} fontWeight="500" fontSize={16}>Features customers loved</Typography>
          <Box ref={reviewScrollRef} sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 2, scrollBehavior: 'smooth', position: 'relative', '&::-webkit-scrollbar': { display: 'none' } }}>
            {[...selectedSellerReviews].reverse().map((rev: any, i: number) => (
              <Card key={i} sx={{ minWidth: 350, maxWidth: 350, borderRadius: '16px', bgcolor: '#f5f5f5', border: '1px solid #eee', boxShadow: 'none', position: 'relative', flexShrink: 0, overflow: 'visible' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label={`${rev.rating} ★`} size="small" sx={{ bgcolor: '#0a8f08', color: 'white', fontWeight: 'bold', height: 24 }} />
                      <Typography fontWeight="700" fontSize={16}>{rev.rating >= 5 ? 'Awesome' : rev.rating >= 4 ? 'Very Good' : rev.rating >= 3 ? 'Good' : 'Poor'}</Typography>
                    </Box>
                    <Typography fontSize={13} color="#777">{new Date(rev.createdAt).toLocaleDateString()}</Typography>
                  </Box>
                  <Typography mt={2} fontSize={16}>{rev.reviewText}</Typography>
                  <Box mt={6}>
                    <Typography fontWeight="500" fontSize={15}>{rev.user?.fullName}</Typography>
                    <Typography fontSize={14} color="#777">Verified Buyer</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
          {showLeftBtn && <IconButton onClick={() => scrollReviews('left')} sx={{ position: 'absolute', left: 15, top: '70%', transform: 'translateY(-50%)', width: 52, height: 52, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 20, '&:hover': { bgcolor: '#fff' } }}>‹</IconButton>}
          {showRightBtn && <IconButton onClick={() => scrollReviews('right')} sx={{ position: 'absolute', right: 15, top: '70%', transform: 'translateY(-50%)', width: 52, height: 52, bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 20, '&:hover': { bgcolor: '#fff' } }}>›</IconButton>}
        </Box>
      </Drawer>

      {/* SNACKBAR */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>{snackbarMessage}</Alert>
      </Snackbar>
    </>
  );
};

export default ProductDetails;
"""

new_content = content[:return_idx] + new_jsx

# Let's save the new_content to ProductDetails.tsx
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced successfully!")
