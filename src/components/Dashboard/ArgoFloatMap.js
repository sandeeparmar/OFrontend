import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ArgoFloatMap = ({ argoFloats, handleFloatSelect }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallLaptop, setIsSmallLaptop] = useState(false);
  const [mapZoom, setMapZoom] = useState(5);

  // Detect screen size and adjust settings
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const smallLaptop = width >= 768 && width < 1024;
      
      setIsMobile(mobile);
      setIsSmallLaptop(smallLaptop);
      
      // Adjust zoom based on screen size
      if (mobile) {
        setMapZoom(4); // More zoomed out on mobile
      } else if (smallLaptop) {
        setMapZoom(5); // Standard zoom for small laptops
      } else {
        setMapZoom(6); // More zoomed in on larger screens
      }
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Custom icon for different screen sizes
  const createCustomIcon = () => {
    if (isMobile) {
      return L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [20, 32],
        iconAnchor: [10, 32],
        popupAnchor: [0, -32],
      });
    } else if (isSmallLaptop) {
      return L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [23, 37],
        iconAnchor: [11, 37],
        popupAnchor: [1, -34],
      });
    } else {
      return L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }
  };

  return (
    <div className="h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 2xl:h-[450px] mb-2 xs:mb-3 sm:mb-4">
      <MapContainer
        center={[-4.95, 86.092]}
        zoom={mapZoom}
        style={{ 
          height: '100%', 
          width: '100%',
          borderRadius: '0.5rem',
          // Optimize for small laptop screens
          minHeight: isSmallLaptop ? '350px' : 'none'
        }}
        zoomControl={true}
        dragging={true}
        // Better touch interaction for small laptops that might have touchscreens
        touchZoom={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {argoFloats.map((float, index) => (
          <Marker
            key={index}
            position={[float.latitude, float.longitude]}
            icon={createCustomIcon()}
            eventHandlers={{
              click: () => handleFloatSelect(float),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 xs:p-2">
                <strong className="text-xs xs:text-sm sm:text-base md:text-lg">
                  Float {float.platform_number}
                </strong>
                <div className="mt-1 xs:mt-2 space-y-0.5 xs:space-y-1">
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                    📍 {float.latitude}°N, {float.longitude}°E
                  </p>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                    📅 {float.last_measurement}
                  </p>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                    🔧 {float.data_mode}
                  </p>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base">
                    📊 {float.measurements} measurements
                  </p>
                </div>
                <button
                  onClick={() => handleFloatSelect(float)}
                  className="mt-2 xs:mt-3 px-2 py-1 xs:px-3 xs:py-1.5 bg-blue-600 text-white text-[10px] xs:text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors w-full"
                >
                  View Data
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Instructions for different devices */}
      {isMobile && (
        <div className="mt-2 text-xs text-gray-600 text-center">
          <p>Tap on markers to view float details</p>
          <p className="text-[10px]">Pinch to zoom in/out</p>
        </div>
      )}
      
      {isSmallLaptop && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          <p>Click on markers or use mouse wheel to zoom</p>
        </div>
      )}
    </div>
  );
};

// Add custom CSS for popup styling optimized for small laptops
const styles = `
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 8px;
    max-width: 280px; /* Optimal for small laptops */
  }
  .custom-popup .leaflet-popup-content {
    margin: 0;
    line-height: 1.4;
  }
  
  /* Small laptop specific styles */
  @media (min-width: 768px) and (max-width: 1024px) {
    .custom-popup .leaflet-popup-content {
      width: 220px !important;
    }
    .custom-popup .leaflet-popup-content-wrapper {
      font-size: 14px;
    }
  }
  
  /* Mobile styles */
  @media (max-width: 475px) {
    .custom-popup .leaflet-popup-content {
      width: 160px !important;
    }
  }
  @media (min-width: 476px) and (max-width: 767px) {
    .custom-popup .leaflet-popup-content {
      width: 200px !important;
    }
  }
  
  /* Large screen styles */
  @media (min-width: 1025px) {
    .custom-popup .leaflet-popup-content {
      width: 250px !important;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ArgoFloatMap;