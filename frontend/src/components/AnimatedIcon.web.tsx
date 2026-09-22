import React from 'react';
import UseAnimations from 'react-useanimations';
import activity from 'react-useanimations/lib/activity';
import radioButton from 'react-useanimations/lib/radioButton';
import playPause from 'react-useanimations/lib/playPause';
import volume from 'react-useanimations/lib/volume';
import folder from 'react-useanimations/lib/folder';
import video from 'react-useanimations/lib/video';
import calendar from 'react-useanimations/lib/calendar';
import star from 'react-useanimations/lib/star';
import notification from 'react-useanimations/lib/notification';
import home from 'react-useanimations/lib/home';
import explore from 'react-useanimations/lib/explore';
import userPlus from 'react-useanimations/lib/userPlus';
import checkmark from 'react-useanimations/lib/checkmark';
import bookmark from 'react-useanimations/lib/bookmark';
import toggle from 'react-useanimations/lib/toggle';
import { AnimatedIconName, AnimatedIconProps } from './AnimatedIcon.types';

// Cada animação do react-useanimations é um import próprio; o mapa liga o nome ao módulo.
// Todas compartilham o mesmo tipo Animation, então `typeof activity` serve de valor.
const MAPA: Record<AnimatedIconName, typeof activity> = {
  activity,
  radioButton,
  playPause,
  volume,
  folder,
  video,
  calendar,
  star,
  notification,
  home,
  explore,
  userPlus,
  checkmark,
  bookmark,
  toggle,
};

/**
 * Ícone animado (web) via react-useanimations (MIT, Lottie). Anima em loop suave por
 * padrão pra dar a "identidade viva" da tela de Recursos. No nativo, o AnimatedIcon.tsx
 * cai no ícone estático equivalente.
 */
export function AnimatedIcon({ animated, size = 44, color, loop = true }: AnimatedIconProps) {
  return <UseAnimations animation={MAPA[animated]} size={size} strokeColor={color} autoplay loop={loop} />;
}

export type { AnimatedIconName } from './AnimatedIcon.types';
