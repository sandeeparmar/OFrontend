import React from 'react';
import Plot from 'react-plotly.js';
import { prepare3DData } from '../../utils/dataHandlers';

const ThreeDVisualization = ({ argoData }) => {
  const { x, y, z, temp } = prepare3DData(argoData);
  
  return (
    <Plot
      data={[
        {
          type: 'scatter3d',
          mode: 'markers',
          x: x,
          y: y,
          z: z,
          marker: {
            size: 4,
            color: temp,
            colorscale: 'Viridis',
            colorbar: {
              title: 'Temperature (°C)',
            },
          },
          name: 'Temperature',
          text: temp.map(t => `Temp: ${t.toFixed(2)}°C`),
          hoverinfo: 'text+x+y+z'
        }
      ]}
      layout={{
        title: '3D ARGO Float Data Visualization',
        scene: {
          xaxis: { title: 'Longitude' },
          yaxis: { title: 'Latitude' },
          zaxis: { title: 'Depth (m)', autorange: 'reversed' },
        },
        height: 500,
      }}
      config={{ responsive: true }}
    />
  );
};

export default ThreeDVisualization;