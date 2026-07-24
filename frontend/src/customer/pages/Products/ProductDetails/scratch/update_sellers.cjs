const fs = require('fs');

const filePath = 'd:\\Mani\\Code with Zosh\\UI version\\source code\\frontend\\src\\customer\\pages\\Products\\ProductDetails\\ProductDetails.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = "{/* SELLER OFFERS */}";
const endMarker = "{/* PRODUCT BENEFITS */}";

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find markers");
    process.exit(1);
}

const newSellerJsx = `{/* SELLER OFFERS */}
                {sellerOffers.length > 0 && selectedVariantId && (
                  <div className="my-8 text-sm space-y-3">
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
                          className={\`
                            border rounded-lg p-4 transition-all duration-300 ease-out cursor-pointer
                            \${isSelected ? "border-orange-500 bg-[#fffaf0] shadow-md" : "border-gray-200 bg-white hover:shadow-sm hover:border-gray-300"}
                          \`}
                          onClick={() => setSelectedSellerOffer(offer)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                checked={isSelected}
                                readOnly
                                className="accent-orange-600 w-4 h-4 mt-1 cursor-pointer"
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-[600] text-[15px] text-gray-800 uppercase" onClick={(e) => handleNavigateToSeller(offer, e)}>
                                    {sellerName}
                                  </span>
                                  {sellerAvgRating && (
                                    <span 
                                      className="bg-[#FF5A00] text-white text-[11px] font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                      onClick={(e) => handleOpenReviewDrawer(offer, sellerReviews, sellerName, e)}
                                    >
                                      {sellerAvgRating} ★
                                    </span>
                                  )}
                                  <span className="text-green-600 text-[11px] font-medium bg-green-50 px-1.5 py-0.5 rounded border border-green-100 flex items-center gap-1">
                                    ✔ Verified
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[13px] text-gray-500 mt-1.5">
                                  <span>₹{variant.sellingPrice?.toLocaleString()}</span>
                                  <span className="text-gray-300">|</span>
                                  <span>Delivery: 3 Days</span>
                                  <span className="text-gray-300">|</span>
                                  <span>Stock: <span className={variant.stock > 2 ? 'text-gray-500' : 'text-red-500 font-medium'}>{variant.stock}</span></span>
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
                              className="flex items-center gap-1 text-gray-500 text-xs font-medium hover:text-gray-800 transition py-1"
                              onClick={(e) => { e.stopPropagation(); setExpandedSellerId(isExpanded ? null : offer._id); }}
                            >
                              <span>{isExpanded ? "Hide details" : "View details"}</span>
                              <FiChevronDown className={\`transition-transform duration-300 \${isExpanded ? "rotate-180" : "rotate-0"}\`} size={14} />
                            </button>
                          </div>

                          <div className={\`overflow-hidden transition-all duration-300 ease-in-out \${isExpanded ? "max-h-[800px] opacity-100 mt-4 pt-4 border-t border-gray-300" : "max-h-0 opacity-0"}\`}>
                            <div className="text-gray-700 space-y-3 text-[14px]">
                              <p>
                                <span className="font-medium text-gray-600 mr-2">Price:</span> 
                                ₹{variant.sellingPrice} 
                                {variant.mrpPrice && <del className="text-gray-400 mx-2">₹{variant.mrpPrice}</del>}
                                {discount > 0 && <span className="text-green-600 font-medium ml-1">Save {discount}%</span>}
                              </p>
                              <p>
                                <span className="font-medium text-gray-600 mr-2">Delivery:</span> 
                                Standard Delivery <span className="text-green-600 ml-1">(Free Shipping)</span>
                              </p>
                              <p><span className="font-medium text-gray-600 mr-2">Returns:</span> 10 Days Return</p>
                              <p><span className="font-medium text-gray-600 mr-2">Warranty:</span> Not Applicable</p>
                              <p><span className="font-medium text-gray-600 mr-2">Ships From:</span> Seller Location</p>
                              <p><span className="font-medium text-gray-600 mr-2">GST Invoice:</span> Available</p>
                              <p><span className="font-medium text-gray-600 mr-2">Max Order:</span> {variant.stock > 0 ? Math.min(variant.stock, 5) : 0}</p>
                            </div>
                            
                            <div className="mt-6">
                                <button
                                  disabled={variant.stock === 0}
                                  onClick={(e) => { e.stopPropagation(); setSelectedSellerOffer(offer); handleAddCart(); }}
                                  className="border border-orange-500 text-orange-600 px-6 py-1.5 rounded text-[13px] hover:bg-orange-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                                >
                                  Add to Cart
                                </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                `;

const newContent = content.substring(0, startIdx) + newSellerJsx + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf-8');
console.log("Updated seller offers successfully!");
