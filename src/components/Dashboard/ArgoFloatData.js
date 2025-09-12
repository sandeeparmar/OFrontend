
import { generateMockData } from '../../utils/dataHandlers';

// API integration for fetching ARGO data
export const fetchArgoData = async (platformNumber, setArgoData, setLoading) => {
  setLoading(true);
  try {
    const response = await fetch(`/api/argo/data?platform=${platformNumber}`);
    const data = await response.json();
    setArgoData(data);
  } catch (error) {
    console.error('Error fetching ARGO data:', error);
    // Generate mock data if API fails
    setArgoData(generateMockData());
  } finally {
    setLoading(false);
  }
};

// Handler for selecting a float
export const handleFloatSelect = (float, setSelectedLocation, setArgoData, setLoading) => {
  setSelectedLocation(float);
  fetchArgoData(float.platform_number, setArgoData, setLoading);
};