import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Logo } from '@/components/Logo';
import { fonts, LARGURA_CONTEUDO, spacing, typography } from '@/theme';
import { Cores } from '@/theme/palettes';
import { useThemedStyles } from '@/contexts/ThemeContext';
import appConfig from '../../../app.json';

export function SobreScreen() {
  const styles = useThemedStyles(criarEstilos);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Sobre o aplicativo" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topo}>
          <Logo size={88} />
          <Text style={styles.versao}>Versão {appConfig.expo.version}</Text>
        </View>

        <Card style={styles.bloco}>
          <Text style={styles.texto}>
            O Worship Stage organiza o ministério de louvor num só lugar: escalas, repertório,
            ensaios e comunicados da equipe.
          </Text>
          <Text style={styles.texto}>
            Também traz ferramentas pra usar no ensaio e no palco, como afinador, metrônomo, pad
            contínuo e octapad.
          </Text>
        </Card>

        <Card style={styles.bloco}>
          <Text style={styles.rotulo}>Desenvolvido por</Text>
          <Text style={styles.creditos}>Wendel Junior e João Victor</Text>
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
    topo: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
    versao: { ...typography.bodySmall, color: colors.textMuted },
    bloco: { gap: spacing.sm },
    texto: { ...typography.body, color: colors.textSecondary },
    rotulo: { ...typography.caption, color: colors.textMuted },
    creditos: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    rodape: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  });
