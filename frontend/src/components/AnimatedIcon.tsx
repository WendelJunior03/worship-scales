import React from 'react';
import { Icon } from './Icon';
import { AnimatedIconProps } from './AnimatedIcon.types';

/**
 * Fallback NATIVO do ícone animado: no iOS/Android (e onde não há DOM) renderiza o
 * ícone estático equivalente (lucide). A versão animada de verdade vive em
 * AnimatedIcon.web.tsx e o Metro a escolhe automaticamente no build web.
 */
export function AnimatedIcon({ fallback, size = 44, color }: AnimatedIconProps) {
  return <Icon name={fallback} size={Math.round(size * 0.6)} color={color} />;
}

export type { AnimatedIconName } from './AnimatedIcon.types';
