import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/Header';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { fonts, LARGURA_CONTEUDO, radius, spacing, typography } from '@/theme';
import { Cores } from '@/theme/palettes';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';

// Os caminhos citados aqui precisam bater com o app de verdade — ao mover uma tela
// ou renomear um item de menu, atualize a resposta correspondente.
const PERGUNTAS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: 'Como confirmo ou recuso uma escala?',
    resposta:
      'Abra a aba Avisos (o sino) e toque em Confirmar ou Recusar no aviso da escala. Ao recusar, você pode indicar um substituto.',
  },
  {
    pergunta: 'Como aviso que não posso servir num dia?',
    resposta:
      'Em Recursos, abra Indisponibilidades e marque as datas. Assim quem monta a escala já sabe que você não estará disponível.',
  },
  {
    pergunta: 'Como recebo avisos no celular?',
    resposta:
      'No Perfil, na seção Notificações, ative "Notificações no celular" e permita quando o aparelho perguntar. Você passa a receber os avisos mesmo com o app fechado.',
  },
  {
    pergunta: 'Como instalo o app no celular?',
    resposta:
      'No Android, toque em "Instalar app" quando o aviso aparecer. No iPhone, abra pelo Safari, toque em Compartilhar, escolha "Adicionar à Tela de Início" e confirme em Adicionar.',
  },
  {
    pergunta: 'Como troco minha foto ou meus dados?',
    resposta:
      'No Perfil, toque no ícone da câmera sobre a sua foto para trocá-la ou removê-la. Nome, telefone, data de nascimento e instrumentos ficam em Informações.',
  },
  {
    pergunta: 'Como altero minha senha?',
    resposta: 'No Perfil, toque em Segurança, informe a senha atual e a nova senha duas vezes.',
  },
  {
    pergunta: 'Como deixo o app claro ou escuro?',
    resposta: 'No Perfil, na seção Aparência, escolha entre claro, escuro ou seguir o tema do sistema.',
  },
];

export function AjudaScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);
  const { org } = useAuth();
  const [aberta, setAberta] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Header title="Ajuda e suporte" showBack />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.secao}>Perguntas frequentes</Text>

        <Card style={styles.lista}>
          {PERGUNTAS.map((item, i) => {
            const expandida = aberta === i;
            return (
              <View key={item.pergunta} style={[styles.item, i > 0 && styles.itemDivisor]}>
                <TouchableOpacity
                  style={styles.perguntaLinha}
                  onPress={() => setAberta(expandida ? null : i)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: expandida }}
                >
                  <Text style={styles.pergunta}>{item.pergunta}</Text>
                  <Icon name={expandida ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                </TouchableOpacity>
                {expandida && <Text style={styles.resposta}>{item.resposta}</Text>}
              </View>
            );
          })}
        </Card>

        <Text style={styles.secao}>Ainda precisa de ajuda?</Text>

        <Card style={styles.suporte}>
          <View style={styles.suporteIcone}>
            <Icon name="people-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.suporteTextos}>
            <Text style={styles.suporteTitulo}>Fale com o admin do seu ministério</Text>
            <Text style={styles.suporteSub}>
              {org?.nome ? `O administrador de ${org.nome}` : 'O administrador do ministério'} é quem
              consegue ajustar cadastros, escalas e permissões.
            </Text>
          </View>
        </Card>
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
    secao: { ...typography.bodySmall, color: colors.textSecondary, fontFamily: fonts.semibold },
    lista: { paddingVertical: spacing.xs },
    item: { paddingVertical: spacing.sm },
    itemDivisor: { borderTopWidth: 1, borderTopColor: colors.border },
    perguntaLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
    pergunta: { ...typography.body, color: colors.text, fontFamily: fonts.semibold, flex: 1 },
    resposta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
    suporte: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    suporteIcone: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    suporteTextos: { flex: 1, gap: 2 },
    suporteTitulo: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    suporteSub: { ...typography.caption, color: colors.textSecondary },
  });
