
import React from 'react';
import { SocialFormat, FormatConfig } from './types';

export const FORMAT_DETAILS: Record<SocialFormat, FormatConfig> = {
  [SocialFormat.INSTAGRAM_POST]: {
    label: 'Instagram Post',
    ratio: '1:1',
    description: 'Quadrado perfeito (1080x1080)',
    icon: '📸'
  },
  [SocialFormat.INSTAGRAM_REELS]: {
    label: 'Instagram Reels / Stories',
    ratio: '9:16',
    description: 'Vertical tela cheia (1080x1920)',
    icon: '📱'
  },
  [SocialFormat.FACEBOOK_POST]: {
    label: 'Facebook Post',
    ratio: '4:3',
    description: 'Horizontal padrão (1200x900)',
    icon: '👥'
  },
  [SocialFormat.FACEBOOK_COVER]: {
    label: 'Facebook Cover',
    ratio: '16:9',
    description: 'Capa panorâmica (1640x924)',
    icon: '🖼️'
  },
  [SocialFormat.CUSTOM]: {
    label: 'Personalizado',
    ratio: '?',
    description: 'Defina suas próprias dimensões',
    icon: '⚙️'
  }
};
