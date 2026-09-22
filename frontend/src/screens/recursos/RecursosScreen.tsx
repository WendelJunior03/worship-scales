import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/Card';
import { AnimatedIcon, AnimatedIconName } from '@/components/AnimatedIcon';
import { IconName } from '@/components/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';
import { MainTabScreenNavigationProp } from '@/navigation/types';
import { Cores, Sombras } from '@/theme/palettes';
import { spacing, radius, typography, fonts, LARGURA_CONTEUDO } from '@/theme';
import { podeGerir, isAdmin } from '@/utils/papel';

/** Só rotas da stack sem params obrigatórios — as que a aba de recursos abre direto. */
type RotaRecurso =
  | 'Afinador'
  | 'Octapad'
  | 'Metronomo'
  | 'PadContinuo'
  | 'Biblioteca'
  | 'Multitrack'
  | 'Escalas'
  | 'Membros'
  | 'Ministerio'
  | 'Confirmacoes'
  | 'PanoramaEscalas'
  | 'Indisponibilidades'
  | 'Aniversariantes'
  | 'Comunicados'
  | 'Assinaturas'
  | 'Integracoes';

interface ItemRecurso {
  animated: AnimatedIconName;
  icon: IconName; // fallback estático (nativo)
  label: string;
  sublabel: string;
  route: RotaRecurso;
  soAdmin?: boolean;
}

interface Categoria {
  id: string;
  titulo: string;
  cor: (c: Cores) => string;
  corSoft: (c: Cores) => string;
  itens: ItemRecurso[];
  soGestao?: boolean;
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'instrumentos',
    titulo: 'Instrumentos',
    cor: (c) => c.accent,
    corSoft: (c) => c.accentSoft,
    itens: [
      { animated: 'activity', icon: 'speedometer-outline', label: 'Afinador', sublabel: 'Afine o instrumento', route: 'Afinador' },
      { animated: 'radioButton', icon: 'grid-outline', label: 'Octapad', sublabel: 'Pads de som', route: 'Octapad' },
      { animated: 'playPause', icon: 'timer-outline', label: 'Metrônomo', sublabel: 'BPM e tap tempo', route: 'Metronomo' },
      { animated: 'volume', icon: 'pulse-outline', label: 'Pads Contínuos', sublabel: 'Banco de pads', route: 'PadContinuo' },
      { animated: 'folder', icon: 'library-outline', label: 'Biblioteca', sublabel: 'Músicas, pastas e vídeos', route: 'Biblioteca' },
      { animated: 'video', icon: 'options-outline', label: 'Multitrack / VS', sublabel: 'Player de multitracks', route: 'Multitrack' },
    ],
  },
  {
    id: 'pessoal',
    titulo: 'Pessoal',
    cor: (c) => c.primary,
    corSoft: (c) => c.primarySoft,
    itens: [
      { animated: 'calendar', icon: 'calendar-outline', label: 'Indisponibilidades', sublabel: 'Datas que não posso servir', route: 'Indisponibilidades' },
      { animated: 'star', icon: 'gift-outline', label: 'Aniversariantes', sublabel: 'Do mês, por membro', route: 'Aniversariantes' },
      { animated: 'notification', icon: 'chatbubble-ellipses-outline', label: 'Comunicados', sublabel: 'Avisos da organização', route: 'Comunicados' },
    ],
  },
  {
    id: 'gestao',
    titulo: 'Gestão',
    soGestao: true,
    cor: (c) => c.warning,
    corSoft: () => 'rgba(242, 180, 83, 0.16)',
    itens: [
      { animated: 'home', icon: 'business-outline', label: 'Ministério', sublabel: 'Equipes e funções', route: 'Ministerio' },
      { animated: 'calendar', icon: 'calendar-outline', label: 'Escalas', sublabel: 'Ver escalas', route: 'Escalas' },
      { animated: 'explore', icon: 'stats-chart-outline', label: 'Panorama', sublabel: 'Escalas do mês', route: 'PanoramaEscalas' },
      { animated: 'userPlus', icon: 'people-outline', label: 'Membros', sublabel: 'Gerenciar', route: 'Membros', soAdmin: true },
      { animated: 'checkmark', icon: 'checkmark-done-outline', label: 'Confirmações', sublabel: 'Acompanhar', route: 'Confirmacoes' },
      { animated: 'bookmark', icon: 'card-outline', label: 'Meu plano', sublabel: 'Assinatura PRO da organização', route: 'Assinaturas', soAdmin: true },
      { animated: 'toggle', icon: 'key-outline', label: 'Integrações', sublabel: 'Tokens de API e Holyrics', route: 'Integracoes', soAdmin: true },
    ],
  },
];

export function RecursosScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);
  const { user } = useAuth();
  const navigation = useNavigation<MainTabScreenNavigationProp<'Recursos'>>();

  const mostrarGestao = user ? podeGerir(user) : false;
  const ehAdmin = !!user && isAdmin(user);

  // Categorias visíveis pra este usuário (Gestão só p/ quem gere; itens só-admin filtrados).
  const categorias = useMemo(
    () =>
      CATEGORIAS.filter((c) => !c.soGestao || mostrarGestao).map((c) => ({
        ...c,
        itens: c.itens.filter((i) => !i.soAdmin || ehAdmin),
      })),
    [mostrarGestao, ehAdmin],
  );

  const [ativa, setAtiva] = useState(0);
  const cat = categorias[Math.min(ativa, categorias.length - 1)];

  // Grid responsivo: nº de colunas conforme a largura útil (2 no celular, mais em
  // telas largas). A largura do card é derivada pra preencher a linha certinho.
  const { width } = useWindowDimensions();
  const larguraUtil = Math.min(width, LARGURA_CONTEUDO) - spacing.lg * 2;
  const colunas = larguraUtil < 420 ? 2 : larguraUtil < 640 ? 3 : 4;
  const larguraCard = Math.floor((larguraUtil - spacing.md * (colunas - 1)) / colunas);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recursos</Text>
          <Text style={styles.subtitle}>Ferramentas e gestão do ministério</Text>
        </View>

        {/* Tabs em pílula (estilo "Most Viewed / Nearby / Latest" da referência). */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabs}
        >
          {categorias.map((c, i) => {
            const sel = i === ativa;
            return (
              <Pressable
                key={c.id}
                onPress={() => setAtiva(i)}
                style={[styles.tab, sel && styles.tabAtiva]}
                accessibilityRole="tab"
                accessibilityState={{ selected: sel }}
              >
                <Text style={[styles.tabTxt, sel && styles.tabTxtAtiva]}>{c.titulo}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Grid responsivo de cards da categoria ativa (2 por linha no celular). */}
        <ScrollView
          key={cat.id}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.grid}>
            {cat.itens.map((item) => (
              <Card
                key={item.label}
                style={StyleSheet.flatten([styles.card, { width: larguraCard }])}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={[styles.cardIcon, { backgroundColor: cat.corSoft(colors) }]}>
                  <AnimatedIcon animated={item.animated} fallback={item.icon} size={44} color={cat.cor(colors)} />
                </View>
                <View style={styles.cardTextos}>
                  <Text style={styles.cardLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
                  <Text style={styles.cardSublabel} numberOfLines={2}>
                    {item.sublabel}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const criarEstilos = (colors: Cores, shadows: Sombras) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      width: '100%',
      maxWidth: LARGURA_CONTEUDO,
      alignSelf: 'center',
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    title: {
      ...typography.h2,
      color: colors.text,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 2,
    },
    // flexGrow:0 impede o ScrollView horizontal de esticar na vertical e ocupar a tela.
    tabsScroll: {
      flexGrow: 0,
      flexShrink: 0,
    },
    tabs: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      alignItems: 'center',
    },
    tab: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabAtiva: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabTxt: {
      ...typography.body,
      fontFamily: fonts.semibold,
      color: colors.textSecondary,
    },
    tabTxtAtiva: {
      color: colors.textInverse,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    card: {
      borderRadius: radius.xxl,
      gap: spacing.sm,
      ...shadows.sm,
    },
    cardIcon: {
      width: '100%',
      height: 64,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTextos: {
      gap: 2,
    },
    cardLabel: {
      ...typography.body,
      color: colors.text,
      fontFamily: fonts.semibold,
      lineHeight: 20,
    },
    cardSublabel: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 16,
      minHeight: 32,
    },
  });
