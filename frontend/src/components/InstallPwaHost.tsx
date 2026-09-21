import React, { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { radius, spacing, typography } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { ModoInstalar, useInstallPwa } from '@/pwa/useInstallPwa';

/**
 * Host único (montado no root, dentro do ThemeProvider) que renderiza o convite de
 * instalar o PWA — mesmo modelo do ToastHost/ConfirmDialogHost. Só aparece no web;
 * a lógica de quando/como mostrar vive no useInstallPwa.
 */

const CONTEUDO: Record<ModoInstalar, { icone: IconName; titulo: string; sub: string; acao: string }> = {
  nativo: {
    icone: 'cloud-download-outline',
    titulo: 'Instale o Worship Stage',
    sub: 'Adicione à tela inicial e use como um app, sem abrir o navegador.',
    acao: 'Instalar app',
  },
  ios: {
    icone: 'phone-portrait-outline',
    titulo: 'Instale no seu iPhone',
    sub: 'Pelo Safari, adicione o app à Tela de Início em poucos toques.',
    acao: 'Ver como instalar',
  },
  desktop: {
    icone: 'phone-portrait-outline',
    titulo: 'Instale no seu celular',
    sub: 'Escaneie um QR Code e instale o app direto no telefone.',
    acao: 'Instalar no celular',
  },
};

export function InstallPwaHost() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { visivel, modo, instalar, dispensar, urlApp } = useInstallPwa();
  const [modalIos, setModalIos] = useState(false);
  const [modalQr, setModalQr] = useState(false);

  if (Platform.OS !== 'web' || !visivel) return null;

  const c = CONTEUDO[modo];

  const aoAgir = () => {
    if (modo === 'nativo') instalar();
    else if (modo === 'ios') setModalIos(true);
    else setModalQr(true);
  };

  return (
    <>
      <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + spacing.md }]}>
        <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.topo}>
            <View style={[styles.iconeCirculo, { backgroundColor: colors.primary + '22' }]}>
              <Icon name={c.icone} size={22} color={colors.primary} />
            </View>
            <View style={styles.textos}>
              <Text style={[styles.titulo, { color: colors.textPrimary }]}>{c.titulo}</Text>
              <Text style={[styles.sub, { color: colors.textSecondary }]}>{c.sub}</Text>
            </View>
            <Pressable
              onPress={dispensar}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Dispensar"
            >
              <Icon name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
          <Button title={c.acao} onPress={aoAgir} style={styles.botao} />
        </View>
      </View>

      {/* iOS: passos de "Adicionar à Tela de Início" (Safari não tem prompt automático). */}
      <Modal visible={modalIos} transparent animationType="fade" onRequestClose={() => setModalIos(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalIos(false)}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.cardTitulo, { color: colors.textPrimary }]}>Instalar no iPhone</Text>
            <Passo n="1" texto="Toque no botão Compartilhar" colors={colors} icone="share-social-outline" />
            <Passo n="2" texto='Escolha “Adicionar à Tela de Início”' colors={colors} />
            <Passo n="3" texto="Confirme em “Adicionar”" colors={colors} />
            <Button title="Entendi" onPress={() => setModalIos(false)} style={styles.botaoModal} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Desktop: QR pra abrir o site no celular e instalar lá. */}
      <Modal visible={modalQr} transparent animationType="fade" onRequestClose={() => setModalQr(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalQr(false)}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.cardTitulo, { color: colors.textPrimary }]}>Instalar no celular</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>
              Aponte a câmera do celular para o QR Code. O app abre no navegador e é só
              instalar por lá.
            </Text>
            {!!urlApp && (
              <View style={styles.qrMoldura}>
                <QRCode value={urlApp} size={196} backgroundColor="#FFFFFF" color="#000000" />
              </View>
            )}
            <Text style={[styles.url, { color: colors.textMuted }]} numberOfLines={1}>
              {urlApp.replace(/^https?:\/\//, '')}
            </Text>
            <Button title="Fechar" onPress={() => setModalQr(false)} style={styles.botaoModal} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Passo({
  n,
  texto,
  colors,
  icone,
}: {
  n: string;
  texto: string;
  colors: ReturnType<typeof useTheme>['colors'];
  icone?: IconName;
}) {
  return (
    <View style={styles.passo}>
      <View style={[styles.passoNum, { backgroundColor: colors.primary }]}>
        <Text style={styles.passoNumTxt}>{n}</Text>
      </View>
      <Text style={[styles.passoTxt, { color: colors.textPrimary }]}>{texto}</Text>
      {icone && <Icon name={icone} size={18} color={colors.primary} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    zIndex: 9998,
  },
  banner: {
    width: '100%',
    maxWidth: 460,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconeCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 2 },
  titulo: { ...typography.h3 },
  sub: { ...typography.bodySmall },
  botao: { width: '100%' },
  // modais
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  cardTitulo: { ...typography.h2, textAlign: 'center' },
  cardSub: { ...typography.bodySmall, textAlign: 'center' },
  qrMoldura: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
  },
  url: { ...typography.caption },
  botaoModal: { width: '100%' },
  passo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, width: '100%' },
  passoNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  passoNumTxt: { ...typography.caption, color: '#FFFFFF', fontWeight: '700' },
  passoTxt: { ...typography.body, flex: 1 },
});
