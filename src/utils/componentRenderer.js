import React from 'react';
import { ThreeDVisualization, ProfilePlots, ArgoFloatMap, FloatList } from '../components/Dashboard';
import { argoFloats } from '../data/argoFloats';
import { generateMockData } from './dataHandlers';

export const renderComponent = (componentType, data = null) => {
  const componentProps = {
    argoData: data || generateMockData(),
    argoFloats: argoFloats,
    selectedLocation: null,
    handleFloatSelect: () => {}
  };

  switch(componentType) {
    case '3d_visualization':
      return <ThreeDVisualization {...componentProps} />;
    case 'profile_plots':
      return <ProfilePlots {...componentProps} />;
    case 'float_map':
      return (
        <div className="space-y-4">
          <ArgoFloatMap {...componentProps} />
          <FloatList {...componentProps} />
        </div>
      );
    default:
      return null;
  }
};

export const detectComponentFromQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('3d') || lowerQuery.includes('three') || 
      lowerQuery.includes('visualization') || lowerQuery.includes('graph')) {
    return '3d_visualization';
  } else if (lowerQuery.includes('profile') || lowerQuery.includes('temperature') || 
             lowerQuery.includes('salinity') || lowerQuery.includes('chart')) {
    return 'profile_plots';
  } else if (lowerQuery.includes('map') || lowerQuery.includes('location') || 
             lowerQuery.includes('float') || lowerQuery.includes('position')) {
    return 'float_map';
  }
  
  return null;
};