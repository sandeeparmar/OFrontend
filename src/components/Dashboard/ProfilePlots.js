import React from 'react';
import Plot from 'react-plotly.js';

// Temperature Profile Component
export const TemperatureProfile = ({ argoData }) => {
  const depths = argoData.map(d => d.PRES);
  const temps = argoData.map(d => d.TEMP);

  return (
    <div className="bg-gray-100 border-b-3 p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg text-blue-600 font-semibold mb-4">Temperature Profile</h3>
      <Plot
        data={[
          {
            type: 'scatter',
            mode: 'lines+markers',
            x: temps,
            y: depths,
            marker: { color: 'blue' },
            name: 'Temperature',
          },
        ]}
        layout={{
          xaxis: { title: 'Temperature (°C)' },
          yaxis: { title: 'Depth (m)', autorange: 'reversed' },
          height: 300,
        }}
        config={{ responsive: true }}
      />
    </div>
  );
};

// Salinity Profile Component
export const SalinityProfile = ({ argoData }) => {
  const salinities = argoData.filter(d => d.PSAL !== null).map(d => d.PSAL);
  const salinityDepths = argoData.filter(d => d.PSAL !== null).map(d => d.PRES);

  return (
    <div className="bg-gray-100 border-b-200 p-4 rounded-lg shadow">
      <h3 className="text-lg text-blue-600 font-semibold mb-4">Salinity Profile</h3>
      <Plot
        data={[
          {
            type: 'scatter',
            mode: 'lines+markers',
            x: salinities,
            y: salinityDepths,
            marker: { color: 'green' },
            name: 'Salinity',
          },
        ]}
        layout={{
          xaxis: { title: 'Salinity (PSU)' },
          yaxis: { title: 'Depth (m)', autorange: 'reversed' },
          height: 300,
        }}
        config={{ responsive: true }}
      />
    </div>
  );
};

// Updated ProfilePlots component that uses the separated components
const ProfilePlots = ({ argoData }) => {
  return (
    <div className="grid grid-cols-1 gap-4 ">
      <TemperatureProfile argoData={argoData} />
      <SalinityProfile argoData={argoData} />
    </div>
  );
};

export default ProfilePlots;