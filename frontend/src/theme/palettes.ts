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
  /** Gradiente de destaque p/ hero, anéis e estados ativos. */
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

// --- Tema ESCURO (Ink wash: grafite + azul-ardósia) ---
export const paletaEscura: Cores = {
  background: '#2B2B2B',
  surface: '#3A3A3A',
  surfaceElevated: '#4A4A4A',
  surfaceMuted: '#555555',
  primary: '#6D8196',
  primaryDark: '#5A6C80',
  primaryLight: '#8A9CB0',
  primarySoft: 'rgba(138, 156, 176, 0.18)',
  accent: '#8A9CB0',
  accentSoft: 'rgba(138, 156, 176, 0.16)',
  primaryGradient: ['#7C90A5', '#5A6C80'],
  bgGradient: ['#333333', '#2B2B2B'],
  accentGradient: ['#8A9CB0', '#6D8196'],
  heroGradient: ['#46505B', '#353A40'],
  glow: '#8A9CB0',
  text: '#FFFFE3',
  textPrimary: '#FFFFE3',
  textSecondary: '#CBCBCB',
  textMuted: '#8E8E8E',
  textInverse: '#FFFFFF',
  border: '#5A5A5A',
  success: '#7FB38F',
  warning: '#D6B26E',
  error: '#D97A7A',
  info: '#8A9CB0',
  papel: { admin: '#8A9CB0', ministro: '#A9B7C6', vocal: '#6D8196', membro: '#8E8E8E' },
};

export const sombrasEscuras: Sombras = {
  sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 6 },
  lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.5, shadowRadius: 28, elevation: 12 },
};

// --- Tema CLARO (Ink wash: creme + grafite + azul-ardósia) ---
export const paletaClara: Cores = {
  background: '#FFFFE3',
  surface: '#FFFFFF',
  surfaceElevated: '#F2F2E0',
  surfaceMuted: '#F2F2E0',
  primary: '#6D8196',
  primaryDark: '#5A6C80',
  primaryLight: '#A9B7C6',
  primarySoft: 'rgba(109, 129, 150, 0.12)',
  accent: '#5A6C80',
  accentSoft: 'rgba(109, 129, 150, 0.14)',
  primaryGradient: ['#7C90A5', '#6D8196'],
  bgGradient: ['#FFFFE3', '#F4F4EC'],
  accentGradient: ['#6D8196', '#4A4A4A'],
  heroGradient: ['#FFFFF0', '#EEF0F2'],
  glow: '#6D8196',
  text: '#4A4A4A',
  textPrimary: '#4A4A4A',
  textSecondary: '#6E6E6E',
  textMuted: '#9A9A9A',
  textInverse: '#FFFFFF',
  border: '#CBCBCB',
  success: '#5E9A6E',
  warning: '#C29A4A',
  error: '#C25C5C',
  info: '#6D8196',
  papel: { admin: '#6D8196', ministro: '#5A6C80', vocal: '#4A4A4A', membro: '#9A9A9A' },
};

export const sombrasClaras: Sombras = {
  sm: { shadowColor: '#4A4A4A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#4A4A4A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 6 },
  lg: { shadowColor: '#4A4A4A', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.1, shadowRadius: 28, elevation: 12 },
};

export type ModoTema = 'claro' | 'escuro';

export const temas: Record<ModoTema, { colors: Cores; shadows: Sombras }> = {
  claro: { colors: paletaClara, shadows: sombrasClaras },
  escuro: { colors: paletaEscura, shadows: sombrasEscuras },
};
