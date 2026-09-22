import React from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { usePushNotificacoes } from '@/hooks/usePushNotificacoes';
import { EstadoPush } from '@/services/push';
import { spacing, typography, fonts, radius } from '@/theme';
import { Cores } from '@/theme/palettes';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';

const DESCRICAO: Record<EstadoPush, string> = {
  ativo: 'Você recebe os avisos neste aparelho, mesmo com o app fechado.',
  inativo: 'Ative pra saber na hora quando for escalado, mesmo com o app fechado.',
  bloqueado: 'Bloqueadas pelo aparelho. Libere nas configurações do navegador/celular.',
  'precisa-instalar': 'No iPhone, adicione o app à Tela de Início e abra por lá pra ativar.',
  indisponivel: 'Este navegador não suporta notificações.',
};

/** Chave "Notificações no celular" do Perfil (liga/desliga o push deste aparelho). */
export function NotificacoesPushBloco() {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);
  const { estado, ocupado, ativar, desativar } = usePushNotificacoes();

  if (!estado) return null;

  const podeAlternar = estado === 'ativo' || estado === 'inativo';

  return (
    <View style={styles.bloco}>
      <SectionHeader titulo="Notificações" />
      <View style={styles.linha}>
        <View style={styles.textos}>
          <Text style={styles.titulo}>Notificações no celular</Text>
          <Text style={styles.sub}>{DESCRICAO[estado]}</Text>
        </View>
        {ocupado ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Switch
            value={estado === 'ativo'}
            onValueChange={(v) => (v ? ativar() : desativar())}
            disabled={!podeAlternar}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Notificações no celular"
          />
        )}
      </View>
    </View>
  );
}

const criarEstilos = (colors: Cores) =>
  StyleSheet.create({
    bloco: { width: '100%', gap: spacing.sm, marginBottom: spacing.lg },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    textos: { flex: 1, gap: 2 },
    titulo: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    sub: { ...typography.caption, color: colors.textSecondary },
  });
