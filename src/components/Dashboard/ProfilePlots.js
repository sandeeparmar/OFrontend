import React from 'react';
import Plot from 'react-plotly.js';

const ProfilePlots = ({ argoData }) => {
  const depths = argoData.map(d => d.PRES);
  const temps = argoData.map(d => d.TEMP);
  const salinities = argoData.filter(d => d.PSAL !== null).map(d => d.PSAL);
  const salinityDepths = argoData.filter(d => d.PSAL !== null).map(d => d.PRES);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Temperature Profile */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Temperature Profile</h3>
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

      {/* Salinity Profile */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Salinity Profile</h3>
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
    </div>
  );
};

export default ProfilePlots;