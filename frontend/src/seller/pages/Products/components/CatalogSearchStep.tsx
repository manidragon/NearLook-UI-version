// frontend/src/seller/pages/Products/components/CatalogSearchStep.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import CustomLoader from '../../../../components/CustomLoader';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


interface CatalogSearchStepProps {
  searchQuery: string;
  results: any[];
  isSearching: boolean;
  selectedCatalog: any | null;
  selectedVariants?: any[];
  isCatalogProduct?: boolean; 

  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onPreviewCatalog: (catalog: any) => void;
  onSelectCatalog: (catalog: any, variants?: any[]) => void;
  onSkip: () => void;
  onNext: () => void;
}

export const CatalogSearchStep: React.FC<CatalogSearchStepProps> = ({
  searchQuery,
  results,
  isSearching,
  selectedCatalog,
  selectedVariants = [],
    isCatalogProduct = false,
  onSearchQueryChange,
  onSearch,
  onPreviewCatalog,
  onSelectCatalog,
  onSkip,
  onNext,
}) => {
  // ✅ NEW: State to track which variants are selected for the selected catalog
  const [variantSelection, setVariantSelection] = useState<Record<number, boolean>>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const prevIsSearchingRef = useRef<boolean>(false);

  // ✅ Auto-search while typing (Debounced)
  useEffect(() => {
    if (searchQuery.trim().length > 0 && showDropdown) {
      const timer = setTimeout(() => {
        onSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showDropdown]);

  // ✅ Debug log ONLY when search is initiated (button click)
  useEffect(() => {
    // Check if isSearching just changed from false → true (search started)
    if (isSearching && !prevIsSearchingRef.current) {
      console.log('🔍 [CatalogSearchStep] Search initiated:', {
        query: searchQuery,
        timestamp: new Date().toISOString()
      });
    }

    // Update ref for next render
    prevIsSearchingRef.current = isSearching;

    // ✅ Also log when results arrive (search completed)
    if (!isSearching && prevIsSearchingRef.current && results?.length >= 0) {
      console.log('📦 [CatalogSearchStep] Search completed:', {
        resultsLength: results?.length,
        firstResult: results?.[0]?.title,
        query: searchQuery
      });
    }

    // Update ref again after potential state changes
    prevIsSearchingRef.current = isSearching;

  }, [isSearching, results, searchQuery]);

 // ✅ Sync variantSelection when selectedVariants prop changes (from parent)
useEffect(() => {
  if (selectedVariants && Array.isArray(selectedVariants) && selectedCatalog?.variantTemplate) {
    const newSelection: Record<number, boolean> = {};

    selectedVariants.forEach((selectedVar: any) => {
      const idx = selectedCatalog.variantTemplate?.findIndex(
        (v: any) => v._id === selectedVar._id || v._id === selectedVar
      );
      if (idx !== undefined && idx >= 0) {
        newSelection[idx] = true;
      }
    });

    if (Object.keys(newSelection).length > 0) {
      setVariantSelection(newSelection);
    }
  }
}, [selectedVariants, selectedCatalog?.variantTemplate]);  // ✅ Updated dependencies

  // ✅ Helper: Get unique colors from variants
  const getUniqueColors = (catalog: any) => {
    if (!catalog.variantTemplate || !Array.isArray(catalog.variantTemplate)) return [];
    const colors = new Set<string>();
    catalog.variantTemplate.forEach((v: any) => {
      if (v.color && typeof v.color === 'string') {
        colors.add(v.color);
      }
    });
    return Array.from(colors);
  };

  // ✅ Helper: Get variant count
  const getVariantCount = (catalog: any) => {
    return catalog.variantTemplate?.length || 0;
  };

  // ✅ Helper: Get price range
  const getPriceRange = (catalog: any) => {
    if (!catalog.lowestPrice && !catalog.highestPrice) return 'N/A';
    if (catalog.lowestPrice === catalog.highestPrice) {
      return `₹${catalog.lowestPrice?.toLocaleString()}`;
    }
    return `₹${catalog.lowestPrice?.toLocaleString()} - ₹${catalog.highestPrice?.toLocaleString()}`;
  };

  // ✅✅✅ UPDATED: Get unique specs - FILTER OUT HIGHLIGHTS
  const getUniqueSpecs = (catalog: any): Record<string, string[]> => {
    if (!catalog.variantTemplate || !Array.isArray(catalog.variantTemplate)) return {};

    // ✅ List of highlight attribute names to exclude
    const highlightAttributes = [
      'brand', 'processor', 'processorbrand', 'gpu', 'operatingsystem',
      'displaysize', 'displaytype', 'resolution', 'refreshrate',
      'rearcamera', 'frontcamera', 'battery', 'waterresistance',
      'wifisupport', 'bluetoothversion', 'headphonejack', 'fingerprinttype',
      'screenprotection', 'networktype', 'simtype', 'esimsupport'
    ];

    const specs: Record<string, Set<string>> = {};
    catalog.variantTemplate.forEach((variant: any) => {
      if (variant.specifications && typeof variant.specifications === 'object') {
        Object.entries(variant.specifications).forEach(([key, value]: [string, any]) => {
          // ✅ Skip highlight attributes - only show variant-specific fields
          if (highlightAttributes.includes(key.toLowerCase())) return;

          if (!specs[key]) specs[key] = new Set<string>();
          if (value !== undefined && value !== null) {
            specs[key].add(String(value));
          }
        });
      }
    });

    return Object.fromEntries(
      Object.entries(specs).map(([key, value]) => [key, Array.from(value)])
    ) as Record<string, string[]>;
  };

  // ✅✅✅ NEW: Handle variant selection toggle
  const handleVariantToggle = (variantIndex: number) => {
    setVariantSelection(prev => ({
      ...prev,
      [variantIndex]: !prev[variantIndex]
    }));
  };

  // ✅✅✅ NEW: Get selected variants count
  const getSelectedVariantsCount = (catalog: any) => {
    if (!catalog.variantTemplate) return 0;
    return catalog.variantTemplate.filter((_: any, idx: number) => variantSelection[idx]).length;
  };

  // ✅✅✅ NEW: Handle "Select All" variants
  const handleSelectAllVariants = (catalog: any, selectAll: boolean) => {
    if (!catalog.variantTemplate) return;
    const newSelection: Record<string, boolean> = {};
    catalog.variantTemplate.forEach((_: any, idx: number) => {
      newSelection[idx] = selectAll;
    });
    setVariantSelection(newSelection);
  };

  // ✅✅✅ UPDATED: Handle catalog selection with selected variants
  const handleSelectCatalogWithVariants = (catalog: any) => {
    // Get selected variants from the catalog
    const selectedVars = catalog.variantTemplate?.filter((_: any, idx: number) => variantSelection[idx]) || [];

    if (selectedVars.length === 0) {
      setSnackbarMessage('Please select at least one variant to continue');
      setSnackbarOpen(true);
      return;
    }

    onSelectCatalog(catalog, selectedVars);
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid size={{ xs: 12 }}>
        <Paper className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Typography variant="h6" className="font-semibold text-blue-800">
            🔍 Search Existing Products
          </Typography>
          <Typography variant="body2" className="text-blue-600 mt-1">
            Check if this product already exists in our catalog. Select specific variants to add your prices.
          </Typography>
        </Paper>
      </Grid>

      {/* Search Input */}
      <Grid size={{ xs: 12 }} sx={{ position: 'relative' }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            placeholder="Search by product name, brand, or model (e.g., 'iPhone 15', 'Samsung Galaxy')"
            value={searchQuery}
            onChange={(e) => {
              onSearchQueryChange(e.target.value);
              setHasSearched(false);
              if (e.target.value.trim().length > 0) {
                setShowDropdown(true);
              } else {
                setShowDropdown(false);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                setShowDropdown(false);
                setHasSearched(true);
                onSearch();
              }
            }}
            onFocus={() => {
              if (searchQuery.trim() && results.length > 0) {
                setShowDropdown(true);
              }
            }}
            InputProps={{
              endAdornment: isSearching && !showDropdown ? <CustomLoader size={20} /> : null
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setShowDropdown(false);
              setHasSearched(true);
              onSearch();
            }}
            disabled={!searchQuery.trim() || (isSearching && !showDropdown)}
            sx={{ minWidth: { xs: '100%', sm: 100 }, py: { xs: 1.5, sm: 1 } }}
          >
            {isSearching && !showDropdown ? 'Searching...' : 'Search'}
          </Button>
        </Box>

        {/* Suggestions Dropdown */}
        {showDropdown && searchQuery.trim() && (results.length > 0 || isSearching) && (
          <Paper 
            sx={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: { xs: 0, sm: 116 }, 
              zIndex: 10, 
              mt: 0.5, 
              maxHeight: 300, 
              overflowY: 'auto',
              boxShadow: 3
            }}
          >
            {isSearching ? (
               <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                 <CustomLoader size={24} />
               </Box>
            ) : results.length > 0 ? (
               results.slice(0, 8).map((catalog: any, index: number) => (
                 <Box 
                   key={catalog._id || index}
                   sx={{ 
                     display: 'flex', 
                     alignItems: 'center', 
                     p: 1.5, 
                     borderBottom: '1px solid #eee',
                     cursor: 'pointer',
                     '&:hover': { bgcolor: 'grey.50' }
                   }}
                   onClick={() => {
                     setShowDropdown(false);
                     setHasSearched(true);
                     onPreviewCatalog(catalog);
                   }}
                 >
                    <Box sx={{ width: 40, height: 40, bgcolor: 'grey.100', borderRadius: 1, mr: 2, overflow: 'hidden' }}>
                      {(catalog.images?.[0] || catalog.variantTemplate?.[0]?.images?.[0]) && <img src={catalog.images?.[0] || catalog.variantTemplate?.[0]?.images?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </Box>
                   <Box sx={{ flex: 1 }}>
                     <Typography variant="body2" fontWeight="bold">{catalog.title}</Typography>
                     <Typography variant="caption" color="text.secondary">in {catalog.category?.name || 'Unknown'}</Typography>
                   </Box>
                 </Box>
               ))
            ) : null}
          </Paper>
        )}
      </Grid>

      {/* Results Section */}
      {(() => {
        const displayedResults = showDropdown || !hasSearched ? [] : (selectedCatalog ? [selectedCatalog] : results);
        return displayedResults && displayedResults.length > 0 ? (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            {selectedCatalog ? 'Selected Product' : `Search Results (${displayedResults.length})`}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {displayedResults.map((catalog: any, index: number) => {
              const colors = getUniqueColors(catalog);
              const variantCount = getVariantCount(catalog);
              const priceRange = getPriceRange(catalog);
              const specs = getUniqueSpecs(catalog);  // ✅ Now filtered (no highlights)
              const isSelected = selectedCatalog?._id === catalog._id;
              const selectedCount = getSelectedVariantsCount(catalog);

              return (
                <Paper
                  key={catalog._id || index}
                  sx={{
                    p: 0,
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      boxShadow: 2
                    },
                    transition: 'all 0.2s'
                  }}
                  onClick={() => { }}  // ✅ Prevent card click - use Select button only
                >
                  {/* Main Info */}
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 } }}>
                      {/* Product Image */}
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          flexShrink: 0,
                          bgcolor: 'grey.100',
                          borderRadius: 2,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {catalog.images?.[0] || catalog.variantTemplate?.[0]?.images?.[0] ? (
                          <img
                            src={catalog.images?.[0] || catalog.variantTemplate?.[0]?.images?.[0]}
                            alt={catalog.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect width="120" height="120" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <Box
                            component="img"
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='120' height='120' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
                            alt="No image"
                          />
                        )}
                      </Box>

                      {/* Product Details */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {catalog.title}
                        </Typography>

                        {/* Seller Info */}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Sellers:</strong> {catalog.totalOffers || 1}
                        </Typography>

                        {/* Price Range */}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Price Range:</strong> {priceRange}
                        </Typography>

                        {/* Variant Count */}
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          <strong>Total Variants:</strong> {variantCount} options
                        </Typography>

                        {/* Created By */}
                        <Typography variant="caption" color="text.secondary">
                          Created by: {catalog.createdBy?.businessDetails?.businessName || catalog.createdBy?.sellerName || 'Unknown'}
                        </Typography>
                      </Box>

                      {/* Select Button */}
                      <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, mt: { xs: 1, sm: 0 } }}>
                        <Button
                          variant="outlined"
                          size="large"
                          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: 100 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSelected || selectedCount === 0) {
                              handleSelectCatalogWithVariants(catalog);
                            }
                          }}
                        >
                          {selectedCount > 0 ? '✓ Selected' : 'Select'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* ✅✅✅ EXPANDABLE: Variant Selection Table */}
                  <Divider />
                  <Accordion disableGutters elevation={0} sx={{ border: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        bgcolor: 'grey.50',
                        py: 1,
                        px: 2,
                        '& .MuiAccordionSummary-content': {
                          my: 1
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="body2" fontWeight="500" color="text.secondary">
                          📋 Select Variants to Offer ({selectedCount}/{variantCount})
                        </Typography>
                        {selectedCount > 0 && (
                          <Chip
                            label={`${selectedCount} selected`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'grey.50', p: 0 }}>
                      {/* Select All Checkbox */}
                      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedCount === variantCount && variantCount > 0}
                              indeterminate={selectedCount > 0 && selectedCount < variantCount}
                              onChange={(e) => handleSelectAllVariants(catalog, e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2" fontWeight="500">Select All Variants</Typography>}
                        />
                      </Box>

                      {/* Variants Table */}
                      <TableContainer sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 2, mx: { xs: 0, sm: 2 }, my: 2, width: { xs: '100%', sm: 'auto' }, bgcolor: 'background.paper', overflowX: 'auto' }}>
                        <Table size="medium">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell padding="checkbox" sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary">Select</Typography>
                              </TableCell>
                              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary">Color</Typography>
                              </TableCell>
                              {/* Dynamic spec columns */}
                              {Object.keys(specs).map(specName => (
                                <TableCell key={specName} sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                                  <Typography variant="caption" fontWeight="600" color="text.secondary">
                                    {specName.charAt(0).toUpperCase() + specName.slice(1)}
                                  </Typography>
                                </TableCell>
                              ))}
                              <TableCell sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="caption" fontWeight="600" color="text.secondary">Images</Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {catalog.variantTemplate?.map((variant: any, idx: number) => {
                              const isSelected = variantSelection[idx] || false;
                              return (
                                <TableRow
                                  key={idx}
                                  hover
                                  sx={{
                                    bgcolor: isSelected ? 'primary.50' : 'inherit',
                                    transition: 'background-color 0.2s',
                                    '& td': { borderBottom: '1px solid', borderColor: 'grey.100' },
                                    '&:last-child td, &:last-child th': { border: 0 }
                                  }}
                                >
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={() => handleVariantToggle(idx)}
                                      color="primary"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {variant.color ? (
                                      <Chip size="small" label={variant.color} sx={{ fontWeight: 500, bgcolor: 'grey.100' }} />
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">-</Typography>
                                    )}
                                  </TableCell>
                                  {/* Dynamic spec values */}
                                  {Object.keys(specs).map(specName => (
                                    <TableCell key={specName}>
                                      <Typography variant="body2" fontWeight={500}>
                                        {variant.specifications?.[specName] || '-'}
                                      </Typography>
                                    </TableCell>
                                  ))}
                                  <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                      {variant.images?.length || 0} image(s)
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Selected variants info */}
                      {selectedCount > 0 && (
                        <Box sx={{ p: 2, bgcolor: 'success.50', borderTop: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="success.main" fontWeight="500">
                            ✅ {selectedCount} variant(s) selected. Click "Continue" to add your prices.
                          </Typography>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              );
            })}
          </Box>
        </Grid>
      ) : isSearching && !showDropdown ? (
        <Grid size={{ xs: 12 }} className="flex justify-center py-8">
          <CustomLoader size={40} />
        </Grid>
      ) : searchQuery && !showDropdown && hasSearched ? (
        <Grid size={{ xs: 12 }}>
          <Paper className="p-8 text-center bg-gray-50 border border-gray-100">
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              No catalog products found for "{searchQuery}"
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You can create a new independent product instead.
            </Typography>
          </Paper>
        </Grid>
      ) : null;
      })()}

      {/* Action Buttons */}
      <Grid size={{ xs: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
          <Button
            variant="contained"
            onClick={onSkip}
            sx={{ width: { xs: '100%', sm: 'auto' }, py: { xs: 1, sm: 1 }, fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            color="warning"
          >
            Skip Search & Create New
          </Button>
        </Box>
      </Grid>

      {/* Snackbar for alerts */}
      <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={4000} 
          onClose={() => setSnackbarOpen(false)}
        >
        <Alert onClose={() => setSnackbarOpen(false)} severity="warning" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Grid>
  );
};