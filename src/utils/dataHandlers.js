// Prepare data for 3D visualization
export const prepare3DData = (argoData) => {
  const x = []; // Longitude
  const y = []; // Latitude
  const z = []; // Depth
  const temp = []; // Temperature
  const salinity = []; // Salinity

  argoData.forEach(point => {
    x.push(point.LONGITUDE);
    y.push(point.LATITUDE);
    z.push(-point.PRES); // Negative for depth below surface
    temp.push(point.TEMP);
    if (point.PSAL) salinity.push(point.PSAL);
  });

  return { x, y, z, temp, salinity };
};

// Generate mock data for demo purposes
export const generateMockData = () => {
  const mockData = [];
  for (let i = 0; i < 20; i++) {
    const pressure = i * 50;
    mockData.push({
      PRES: pressure,
      TEMP: 25 - (pressure / 100) * 1.5 + (Math.random() - 0.5),
      PSAL: pressure > 100 ? 35 - (pressure / 1000) * 0.5 + (Math.random() - 0.5) * 0.1 : null,
      depth: pressure,
      LATITUDE: -4.95,
      LONGITUDE: 86.092,
      JULD: new Date(Date.now() - i * 86400000).toISOString()
    });
  }
  return mockData;
};

