import React, { useEffect } from 'react';
import { Icon } from './Icon';
import { AnimatedIconProps } from './AnimatedIcon.types';

// Injeta as keyframes uma única vez no documento.
let estilosInjetados = false;
function garantirEstilos() {
  if (estilosInjetados || typeof document === 'undefined') return;
  estilosInjetados = true;
  const el = document.createElement('style');
  el.textContent = `
    /* Movimento contínuo e sutil — visível no celular sem precisar tocar (lá não há
       hover). O toque no card navega, então uma animação "só no toque" não apareceria. */
    .wsp-anim-icon {
      display: inline-flex;
      will-change: transform;
      animation: wsp-anim-icon-float 3s ease-in-out infinite;
    }
    /* No desktop, passar o mouse faz uma graça mais forte. */
    .wsp-anim-icon:hover { animation: wsp-anim-icon-wiggle .6s ease-in-out; }
    @keyframes wsp-anim-icon-float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(3deg); }
    }
    @keyframes wsp-anim-icon-wiggle {
      0%, 100% { transform: rotate(0deg) scale(1); }
      20% { transform: rotate(-9deg) scale(1.12); }
      45% { transform: rotate(9deg) scale(1.12); }
      70% { transform: rotate(-5deg) scale(1.08); }
      85% { transform: rotate(3deg) scale(1.04); }
    }
    @media (prefers-reduced-motion: reduce) {
      .wsp-anim-icon { animation: none; }
    }
  `;
  document.head.appendChild(el);
}

/**
 * Ícone animado (web): é um ícone Lucide (o mesmo do resto do app) que faz uma
 * animação ao passar o mouse / tocar, via CSS — sem interceptar o clique do card.
 * No nativo, o AnimatedIcon.tsx renderiza o mesmo Lucide. Substitui o
 * react-useanimations (Lottie).
 */
export function AnimatedIcon({ fallback, size = 44, color }: AnimatedIconProps) {
  useEffect(garantirEstilos, []);
  return (
    <div className="wsp-anim-icon">
      <Icon name={fallback} size={Math.round(size * 0.62)} color={color} />
    </div>
  );
}

export type { AnimatedIconName } from './AnimatedIcon.types';
