import { IconName } from './Icon';

/**
 * Nomes de ícone animado suportados (subconjunto do react-useanimations que a gente
 * realmente usa). Ficam num arquivo separado, sem código de plataforma, pra que tanto
 * a versão web (AnimatedIcon.web.tsx) quanto o fallback nativo (AnimatedIcon.tsx)
 * compartilhem exatamente o mesmo tipo.
 */
export type AnimatedIconName =
  | 'activity'
  | 'radioButton'
  | 'playPause'
  | 'volume'
  | 'folder'
  | 'video'
  | 'calendar'
  | 'star'
  | 'notification'
  | 'home'
  | 'explore'
  | 'userPlus'
  | 'checkmark'
  | 'bookmark'
  | 'toggle';

export interface AnimatedIconProps {
  /** Legado (react-useanimations). Opcional — hoje o ícone é sempre o Lucide `fallback`. */
  animated?: AnimatedIconName;
  /** Ícone Lucide de fato renderizado (web animado por CSS, nativo estático). */
  fallback: IconName;
  size?: number;
  color?: string;
  /** Se anima em loop contínuo (web). Default: true. */
  loop?: boolean;
  /** Velocidade da animação (web). <1 = mais lento. Default: 0.55. */
  speed?: number;
}
