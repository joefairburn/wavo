import React from 'react';
import { Progress } from '../components/Progress';

/**
 * Detects if children contain a specific component type
 */
export const hasComponentType = (children: React.ReactNode, componentType: React.ComponentType<any>): boolean => {
  return React.Children.toArray(children).some(child => React.isValidElement(child) && child.type === componentType);
};

/**
 * Specifically checks for Progress component
 */
export const hasProgressComponent = (children: React.ReactNode): boolean => {
  return hasComponentType(children, Progress);
};
