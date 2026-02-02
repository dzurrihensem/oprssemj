
import { BidangType } from './types';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  border: string;
  text: string;
  bg: string;
  badge: string;
  gradient: string;
  accent: string;
  shadow: string;
}

export const THEMES: Record<BidangType, ThemeConfig> = {
  [BidangType.PENTADBIRAN]: {
    primary: 'bg-red-600',
    secondary: 'bg-blue-700',
    border: 'border-red-600',
    text: 'text-red-700',
    bg: 'bg-red-50',
    badge: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-red-600 via-red-700 to-blue-800',
    accent: 'from-red-600 to-blue-800',
    shadow: 'shadow-red-200',
  },
  [BidangType.HEM]: {
    primary: 'bg-yellow-400',
    secondary: 'bg-blue-600',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    badge: 'bg-yellow-500',
    gradient: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-blue-700',
    accent: 'from-yellow-400 to-blue-700',
    shadow: 'shadow-yellow-200',
  },
  [BidangType.KURIKULUM]: {
    primary: 'bg-green-600',
    secondary: 'bg-yellow-400',
    border: 'border-green-600',
    text: 'text-green-700',
    bg: 'bg-green-50',
    badge: 'bg-green-600',
    gradient: 'bg-gradient-to-r from-green-600 via-green-500 to-yellow-400',
    accent: 'from-green-600 to-yellow-400',
    shadow: 'shadow-green-200',
  },
  [BidangType.KOKURIKULUM]: {
    primary: 'bg-blue-600',
    secondary: 'bg-purple-600',
    border: 'border-blue-600',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    badge: 'bg-blue-600',
    gradient: 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600',
    accent: 'from-blue-600 to-purple-600',
    shadow: 'shadow-blue-200',
  },
  [BidangType.KESENIAN]: {
    primary: 'bg-yellow-400',
    secondary: 'bg-orange-500',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    badge: 'bg-orange-500',
    gradient: 'bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-600',
    accent: 'from-yellow-400 to-orange-600',
    shadow: 'shadow-orange-200',
  }
};
