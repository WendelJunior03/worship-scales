import { ViewStyle } from 'react-native';

/**
 * Paletas dos dois temas (claro/escuro) + sombras. A forma (`Cores`/`Sombras`) é a mesma
 * dos tokens antigos, então as telas trocam `import { colors } from '@/theme'` por
 * `useTheme()`/`useThemedStyles()` (ver contexts/ThemeContext) sem mexer no corpo do estilo.
 */

export interface Cores {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  primaryGradient: readonly [string, string];
  bgGradient: readonly [string, string];
  /** Gradiente de destaque (teal→azul) p/ hero, anéis e estados ativos. */
  accentGradient: readonly [string, string];
  /** Gradiente sutil de fundo do card "hero" (destaque da tela). */
  heroGradient: readonly [string, string];
  /** Cor do "glow" (sombra colorida) do estado ativo. */
  glow: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  papel: { admin: string; ministro: string; vocal: string; membro: string };
}

export type Sombras = Record<'sm' | 'md' | 'lg', ViewStyle>;

// --- Tema ESCURO (dark/pro) ---
export const paletaEscura: Cores = {
  background: '#0A0F1A',
  surface: '#131D31',
  surfaceElevated: '#1B2942',
  surfaceMuted: '#243657',
  primary: '#4C82FF',
  primaryDark: '#3567E0',
  primaryLight: '#6E9BFF',
  primarySoft: 'rgba(76, 130, 255, 0.16)',
  accent: '#22D3EE',
  accentSoft: 'rgba(34, 211, 238, 0.16)',
  primaryGradient: ['#5A8CFF', '#3D6FE6'],
  bgGradient: ['#101A2E', '#0A0F1A'],
  accentGradient: ['#22D3EE', '#3B82F6'],
  heroGradient: ['#213A5E', '#122C3E'],
  glow: '#22D3EE',
  text: '#EAF1FC',
  textPrimary: '#EAF1FC',
  textSecondary: '#93A1BA',
  textMuted: '#5D6B84',
  textInverse: '#FFFFFF',
  border: '#26344E',
  success: '#3DD68C',
  warning: '#F2B453',
  error: '#FF5C6C',
  info: '#4C82FF',
  papel: { admin: '#4C82FF', ministro: '#6E9BFF', vocal: '#22D3EE', membro: '#5D6B84' },
};

export const sombrasEscuras: Sombras = {
  sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 6 },
  lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 28, elevation: 12 },
};

// --- Tema CLARO (vibrante: teal + coral) ---
export const paletaClara: Cores = {
  background: '#F5FBFA',
  surface: '#FFFFFF',
  surfaceElevated: '#ECF7F5',
  surfaceMuted: '#ECF7F5',
  primary: '#14B8A6',
  primaryDark: '#0E9488',
  primaryLight: '#5EEAD4',
  primarySoft: 'rgba(20, 184, 166, 0.12)',
  accent: '#FB7185',
  accentSoft: 'rgba(251, 113, 133, 0.14)',
  primaryGradient: ['#2DD4BF', '#14B8A6'],
  bgGradient: ['#F0FDFA', '#FFF1F2'],
  accentGradient: ['#FB7185', '#FB923C'],
  heroGradient: ['#F0FDFA', '#FFF1F2'],
  glow: '#14B8A6',
  text: '#0F2E2A',
  textPrimary: '#0F2E2A',
  textSecondary: '#5E7C77',
  textMuted: '#9AB2AE',
  textInverse: '#FFFFFF',
  border: '#E2EEEC',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  papel: { admin: '#14B8A6', ministro: '#0E9488', vocal: '#FB7185', membro: '#9AB2AE' },
};

export const sombrasClaras: Sombras = {
  sm: { shadowColor: '#1E2340', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#1E2340', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 6 },
  lg: { shadowColor: '#1E2340', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 12 },
};

export type ModoTema = 'claro' | 'escuro';

export const temas: Record<ModoTema, { colors: Cores; shadows: Sombras }> = {
  claro: { colors: paletaClara, shadows: sombrasClaras },
  escuro: { colors: paletaEscura, shadows: sombrasEscuras },
};
