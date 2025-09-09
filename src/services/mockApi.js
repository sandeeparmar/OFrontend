// Mock API functions for demonstration
// In a real application, these would be actual API calls

export const authApi = {
  signup: async (username, password, role) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo response
    return {
      success: true,
      message: 'User created successfully'
    };
  },
  
  signin: async (username, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo response - in a real app, this would come from your backend
    if (username === 'admin' && password === 'admin') {
      return {
        success: true,
        token: 'mock-jwt-token',
        user: { username: 'admin', role: 'admin' }
      };
    } else if (username === 'user' && password === 'user') {
      return {
        success: true,
        token: 'mock-jwt-token',
        user: { username: 'user', role: 'user' }
      };
    } else {
      // Create a demo user for any other credentials
      return {
        success: true,
        token: 'mock-jwt-token',
        user: { username, role: 'user' }
      };
    }
  },
  
  getMe: async (token) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo response
    return {
      success: true,
      user: { username: 'demo_user', role: 'user' }
    };
  }
};

export const oceanDataApi = {
  getData: async (lat, lon, depth) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock data based on parameters
    const baseTemp = 25 - (depth / 100) * 1.5;
    const baseSalinity = 35 - (depth / 1000) * 0.5;
    const baseOxygen = 6 - (depth / 100) * 0.4;
    
    // Generate depth profile data
    const temperature = [];
    const salinity = [];
    const oxygen = [];
    
    for (let d = 0; d <= depth; d += 100) {
      temperature.push({
        depth: d,
        temp: baseTemp - (d / 100) * 1.5 + (Math.random() - 0.5) * 0.5
      });
      
      salinity.push({
        depth: d,
        salinity: baseSalinity - (d / 1000) * 0.5 + (Math.random() - 0.5) * 0.1
      });
      
      oxygen.push({
        depth: d,
        oxygen: baseOxygen - (d / 100) * 0.4 + (Math.random() - 0.5) * 0.2
      });
    }
    
    return {
      temperature,
      salinity,
      oxygen,
      location: { lat, lon, depth }
    };
  },
  
  getNearestData: async (lat, lon, depth) => {
    // For demo purposes, just return the same as getData
    return oceanDataApi.getData(lat, lon, depth);
  },
  
  downloadCsv: async (params) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would return a CSV file
    // For demo, we'll just return a success message
    return { success: true };
  }
};

export const chatApi = {
  sendQuery: async (message) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple chatbot logic for demo
    let reply = "I'm not sure how to answer that. Can you ask about ocean data like temperature, salinity, or oxygen levels?";
    let data = null;
    let downloadUrl = null;
    
    // Extract coordinates from message
    const latMatch = message.match(/(\d+)N/);
    const lonMatch = message.match(/(\d+)W/);
    const depthMatch = message.match(/(\d+)m/);
    
    const lat = latMatch ? parseInt(latMatch[1]) : 20;
    const lon = lonMatch ? parseInt(lonMatch[1]) : -150;
    const depth = depthMatch ? parseInt(depthMatch[1]) : 1000;
    
    if (message.toLowerCase().includes('temperature')) {
      const tempData = await oceanDataApi.getData(lat, lon, depth);
      const surfaceTemp = tempData.temperature[0].temp;
      const deepTemp = tempData.temperature[tempData.temperature.length - 1].temp;
      
      reply = `At ${lat}N, ${lon}W, the ocean temperature ranges from ${surfaceTemp.toFixed(1)}°C at the surface to ${deepTemp.toFixed(1)}°C at ${depth}m depth.`;
      data = {
        temperature: surfaceTemp,
        salinity: tempData.salinity[0].salinity,
        oxygen: tempData.oxygen[0].oxygen
      };
      downloadUrl = `lat=${lat}&lon=${lon}&depth=${depth}`;
    } else if (message.toLowerCase().includes('salinity')) {
      const salinityData = await oceanDataApi.getData(lat, lon, depth);
      const surfaceSalinity = salinityData.salinity[0].salinity;
      
      reply = `At ${lat}N, ${lon}W, the surface salinity is ${surfaceSalinity.toFixed(2)} PSU. Salinity typically decreases with depth in this region.`;
      data = {
        temperature: salinityData.temperature[0].temp,
        salinity: surfaceSalinity,
        oxygen: salinityData.oxygen[0].oxygen
      };
      downloadUrl = `lat=${lat}&lon=${lon}&depth=${depth}`;
    } else if (message.toLowerCase().includes('oxygen')) {
      const oxygenData = await oceanDataApi.getData(lat, lon, depth);
      const surfaceOxygen = oxygenData.oxygen[0].oxygen;
      
      reply = `At ${lat}N, ${lon}W, the surface oxygen level is ${surfaceOxygen.toFixed(2)} ml/l. Oxygen levels generally decrease with depth due to biological consumption.`;
      data = {
        temperature: oxygenData.temperature[0].temp,
        salinity: oxygenData.salinity[0].salinity,
        oxygen: surfaceOxygen
      };
      downloadUrl = `lat=${lat}&lon=${lon}&depth=${depth}`;
    }
    
    return { reply, data, downloadUrl };
  }
};

export const adminApi = {
  uploadNetcdf: async (file) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Demo response
    return {
      success: true,
      message: 'File processed successfully',
      filename: file.name
    };
  }
};