import React from 'react';
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
  return (
    <div className="h-96 mb-4">
      <MapContainer
        center={[-4.95, 86.092]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {argoFloats.map((float, index) => (
          <Marker
            key={index}
            position={[float.latitude, float.longitude]}
            eventHandlers={{
              click: () => handleFloatSelect(float),
            }}
          >
            <Popup>
              <div>
                <strong>Float {float.platform_number}</strong>
                <br />
                Position: {float.latitude}°N, {float.longitude}°E
                <br />
                Last update: {float.last_measurement}
                <br />
                Data Mode: {float.data_mode}
                <br />
                Measurements: {float.measurements}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
const styles = `
  .custom-popup .leaflet-popup-content-wrapper {
    border-radius: 8px;
  }
  .custom-popup .leaflet-popup-content {
    margin: 0;
    line-height: 1.4;
  }
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
`;

export default ArgoFloatMap;