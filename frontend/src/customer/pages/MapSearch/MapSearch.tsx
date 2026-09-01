import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { api } from "../../../Config/Api";
import { useNavigate } from "react-router-dom";
import ProductCard from "../../pages/Products/ProductCard/ProductCard";
import CustomLoader from "../../../components/CustomLoader";

// Fix for default marker icon in react-leaflet is not needed here 
// since we use customMarkerIcon and userMarkerIcon explicitly.

const customMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2775/2775994.png", // shop icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const userMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1077/1077114.png", // user icon
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Component to recenter map when user location changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 13);
  return null;
}

export default function MapSearch() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(50); // Default 50km
  const navigate = useNavigate();

  const defaultCenter: [number, number] = [28.6139, 77.2090]; // Default to New Delhi
  const mapCenter = userLocation || defaultCenter;

  useEffect(() => {
    // 1. Get User Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          fetchNearbyProducts(latitude, longitude, radius);
        },
        (error) => {
          setError("Location access denied or unavailable. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  }, []);

  const fetchNearbyProducts = async (lat: number, lng: number, rad: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/nearby?lat=${lat}&lng=${lng}&radius=${rad}`);
      setProducts(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch nearby products");
    } finally {
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    if (userLocation) {
      fetchNearbyProducts(userLocation[0], userLocation[1], newRadius);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  // Group products by seller location for the map markers
  const sellerGroups = products.reduce((acc, product) => {
    if (product.seller && product.seller.location && product.seller.location.coordinates) {
      const lng = product.seller.location.coordinates[0];
      const lat = product.seller.location.coordinates[1];
      const key = `${lat},${lng}`;
      if (!acc[key]) {
        acc[key] = {
          lat,
          lng,
          sellerName: product.seller.sellerName,
          businessName: product.seller.businessDetails?.businessName,
          sellerId: product.seller._id,
          products: []
        };
      }
      acc[key].products.push(product);
    }
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)]">
      {/* LEFT PANEL: Map */}
      <div className="w-full lg:w-2/3 h-1/2 lg:h-full relative">
        <MapContainer 
          center={mapCenter} 
          zoom={userLocation ? 13 : 5} 
          style={{ height: "100%", width: "100%", zIndex: 1 }}
        >
          {userLocation && <ChangeView center={userLocation} />}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* User Marker */}
          {userLocation && (
            <Marker position={userLocation} icon={userMarkerIcon}>
              <Popup>
                <strong>You are here</strong>
              </Popup>
            </Marker>
          )}

          {/* Seller Markers */}
          {Object.values(sellerGroups).map((group: any, idx) => (
            <Marker key={idx} position={[group.lat, group.lng]} icon={customMarkerIcon}>
              <Popup className="custom-popup">
                <div className="p-2">
                  <h3 className="font-bold text-[#FF5A00]">{group.businessName || group.sellerName}</h3>
                  <p className="text-xs text-gray-600 mb-2">{group.products.length} products available here</p>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => navigate(`/seller-profile/${group.sellerId}`)}
                    sx={{ borderColor: '#FF5A00', color: '#FF5A00', width: '100%' }}
                  >
                    Visit Store
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {!userLocation && loading && (
          <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-white/40 backdrop-blur-sm">
            <CustomLoader sx={{ color: '#c24100' }} />
          </div>
        )}

        {/* Radius Controls Overlay */}
        <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-md flex gap-2">
           <Button 
             size="small" 
             variant={radius === 10 ? "contained" : "outlined"}
             onClick={() => handleRadiusChange(10)}
             sx={{ bgcolor: radius === 10 ? '#c24100' : 'transparent', color: radius === 10 ? 'white' : '#c24100', borderColor: '#c24100' }}
           >
             10 km
           </Button>
           <Button 
             size="small" 
             variant={radius === 50 ? "contained" : "outlined"}
             onClick={() => handleRadiusChange(50)}
             sx={{ bgcolor: radius === 50 ? '#c24100' : 'transparent', color: radius === 50 ? 'white' : '#c24100', borderColor: '#c24100' }}
           >
             50 km
           </Button>
        </div>
      </div>

      {/* RIGHT PANEL: Products Feed */}
      <div className="w-full lg:w-1/3 h-1/2 lg:h-full bg-gray-50 overflow-y-auto border-l border-gray-200 products-page-wrapper">
        <div className="p-5 bg-white/95 backdrop-blur-md sticky top-0 z-10 shadow-sm border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Nearby Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Found <span className="font-semibold text-[#c24100]">{products.length}</span> products within {radius}km
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <CustomLoader sx={{ color: '#FF5A00' }} />
          </div>
        ) : products.length > 0 ? (
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-transparent transition-all duration-300 transform hover:-translate-y-1 relative group cursor-pointer overflow-hidden">
                  <ProductCard item={product} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <img src="/empty-cart.png" alt="No products" className="w-32 opacity-50 mb-4" />
            <p>No products found in your area.</p>
            <p className="text-sm mt-2">Try increasing the search radius.</p>
          </div>
        )}
      </div>
    </div>
  );
}
