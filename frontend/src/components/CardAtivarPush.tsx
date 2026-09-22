import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { usePushNotificacoes } from '@/hooks/usePushNotificacoes';
import * as push from '@/services/push';
import { fonts, radius, spacing, typography } from '@/theme';
import { Cores } from '@/theme/palettes';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';

const CHAVE_DISPENSADO = 'push_card_dispensado';

/**
 * Convite na Início pra ligar as notificações push. Some quando já está ativo, quando
 * a pessoa dispensa (lembrado neste aparelho) ou quando o navegador não suporta —
 * aí o controle fica só no Perfil. Também reata a inscrição ao usuário logado.
 */
export function CardAtivarPush() {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);
  const { estado, ocupado, ativar } = usePushNotificacoes();
  const [dispensado, setDispensado] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_DISPENSADO)
      .then((v) => setDispensado(v === '1'))
      .catch(() => setDispensado(false));
    push.sincronizar().catch(() => {});
  }, []);

  if (dispensado !== false) return null;
  if (estado !== 'inativo' && estado !== 'precisa-instalar') return null;

  const dispensar = () => {
    setDispensado(true);
    AsyncStorage.setItem(CHAVE_DISPENSADO, '1').catch(() => {});
  };

  const precisaInstalar = estado === 'precisa-instalar';

  return (
    <Card style={styles.card}>
      <View style={styles.icone}>
        <Icon name="notifications-outline" size={22} color={colors.primary} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>Receba avisos no celular</Text>
        <Text style={styles.sub}>
          {precisaInstalar
            ? 'No iPhone, adicione o app à Tela de Início (Compartilhar → Adicionar à Tela de Início) e abra por lá pra ativar.'
            : 'Saiba na hora quando for escalado, mesmo com o app fechado.'}
        </Text>
        {!precisaInstalar && (
          <TouchableOpacity style={styles.botao} onPress={ativar} disabled={ocupado} accessibilityRole="button">
            {ocupado ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <Text style={styles.botaoTexto}>Ativar notificações</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity onPress={dispensar} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dispensar">
        <Icon name="close" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </Card>
  );
}

const criarEstilos = (colors: Cores) =>
  StyleSheet.create({
    card: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, borderRadius: radius.xxl, padding: spacing.lg },
    icone: {
      width: 42,
      height: 42,
      borderRadius: radius.lg,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: 2 },
    titulo: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    sub: { ...typography.caption, color: colors.textSecondary },
    botao: {
      alignSelf: 'flex-start',
      marginTop: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.md,
      minWidth: 150,
      alignItems: 'center',
    },
    botaoTexto: { ...typography.bodySmall, color: colors.textInverse, fontFamily: fonts.semibold },
  });
