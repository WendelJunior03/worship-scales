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
  /** Ícone animado (web). */
  animated: AnimatedIconName;
  /** Ícone estático equivalente (lucide) usado no fallback nativo. */
  fallback: IconName;
  size?: number;
  color?: string;
  /** Se anima em loop contínuo (web). Default: true. */
  loop?: boolean;
}
