import React from 'react';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

type IconLibrary = 'ionicons' | 'material' | 'fontawesome';
type IconName = string;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  library?: IconLibrary;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = COLORS.text,
  library = 'ionicons',
}) => {
  switch (library) {
    case 'ionicons':
      return <Ionicons name={name as any} size={size} color={color} />;
    case 'material':
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case 'fontawesome':
      return <FontAwesome name={name as any} size={size} color={color} />;
    default:
      return <Ionicons name={name as any} size={size} color={color} />;
  }
};
