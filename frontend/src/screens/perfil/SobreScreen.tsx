import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Icon, IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { fonts, LARGURA_CONTEUDO, radius, spacing, typography } from '@/theme';
import { Cores } from '@/theme/palettes';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';
import appConfig from '../../../app.json';

interface Funcionalidade {
  icon: IconName;
  label: string;
  sub: string;
}

// Onde a funcionalidade já tem ícone na Início/Recursos, usa o mesmo — cada uma fica
// com uma "cara" só no app.
const GRUPOS: { titulo: string; itens: Funcionalidade[] }[] = [
  {
    titulo: 'Para o ministério',
    itens: [
      { icon: 'calendar-outline', label: 'Escalas', sub: 'Quem serve e quando' },
      { icon: 'musical-notes', label: 'Repertório', sub: 'Músicas, tons e cifras' },
      { icon: 'mic-outline', label: 'Ensaios', sub: 'Presença da equipe' },
      { icon: 'chatbubble-ellipses-outline', label: 'Comunicados', sub: 'Avisos pra todos' },
    ],
  },
  {
    titulo: 'No ensaio e no palco',
    itens: [
      { icon: 'speedometer-outline', label: 'Afinador', sub: 'Afine o instrumento' },
      { icon: 'timer-outline', label: 'Metrônomo', sub: 'BPM e tap tempo' },
      { icon: 'pulse-outline', label: 'Pad contínuo', sub: 'Camadas de fundo' },
      { icon: 'grid-outline', label: 'Octapad', sub: 'Pads de bateria' },
    ],
  },
];

export function SobreScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Sobre o aplicativo" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}>
          <Logo size={88} />
          <View style={styles.versaoPill}>
            <Text style={styles.versao}>Versão {appConfig.expo.version}</Text>
          </View>
          <Text style={styles.tagline}>Seu ministério de louvor, do ensaio ao palco.</Text>
        </View>

        <Card style={styles.grupo}>
          <Text style={styles.grupoTitulo}>Nossa história</Text>
          <Text style={styles.historia}>
            O Worship Stage nasceu de uma ideia em conjunto: dar aos ministérios de louvor uma
            ferramenta que ajude a servir com mais organização e excelência. Cada detalhe foi
            pensado pra que a equipe gaste menos tempo com a logística e mais tempo no que
            importa: contribuir para o crescimento do Reino de Deus.
          </Text>
        </Card>

        {GRUPOS.map((grupo) => (
          <Card key={grupo.titulo} style={styles.grupo}>
            <Text style={styles.grupoTitulo}>{grupo.titulo}</Text>
            <View style={styles.grade}>
              {grupo.itens.map((item) => (
                <View key={item.label} style={styles.tile}>
                  <View style={styles.tileIcone}>
                    <Icon name={item.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text style={styles.tileSub} numberOfLines={1}>
                    {item.sub}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ))}

        <Card style={styles.creditosCard}>
          <Icon name="people-outline" size={18} color={colors.primary} />
          <View style={styles.creditosTextos}>
            <Text style={styles.rotulo}>Desenvolvido por</Text>
            <Text style={styles.creditos}>Wendel Junior e João Victor</Text>
          </View>
        </Card>

        <Text style={styles.rodape}>© {new Date().getFullYear()} Worship Stage</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const criarEstilos = (colors: Cores) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      width: '100%',
      maxWidth: LARGURA_CONTEUDO,
      alignSelf: 'center',
      padding: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.md,
    },
    topo: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.sm },
    versaoPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
    },
    versao: { ...typography.caption, color: colors.primary, fontFamily: fonts.semibold },
    tagline: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
    grupo: { gap: spacing.md },
    grupoTitulo: {
      ...typography.caption,
      color: colors.textMuted,
      fontFamily: fonts.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    historia: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 21 },
    grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    tile: {
      flexGrow: 1,
      flexBasis: '45%',
      alignItems: 'center',
      gap: 4,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceElevated,
    },
    tileIcone: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    tileLabel: { ...typography.bodySmall, color: colors.text, fontFamily: fonts.semibold },
    tileSub: { ...typography.caption, color: colors.textMuted },
    creditosCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    creditosTextos: { flex: 1, gap: 2 },
    rotulo: { ...typography.caption, color: colors.textMuted },
    creditos: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    rodape: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  });
