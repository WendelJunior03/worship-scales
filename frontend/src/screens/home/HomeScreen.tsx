import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '@/components/Card';
import { Icon, IconName } from '@/components/Icon';
import { AnimatedIcon } from '@/components/AnimatedIcon';
import { Skeleton } from '@/components/Skeleton';
import { Avatar } from '@/components/Avatar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabScreenNavigationProp } from '@/navigation/types';
import * as notificacoesService from '@/services/notificacoes';
import * as cultosService from '@/services/cultos';
import * as membrosService from '@/services/membros';
import * as avisosService from '@/services/avisos';
import { ApiError } from '@/services/api';
import { Aniversariante, Aviso, CultoResumo } from '@/types';
import { spacing, radius, typography, fonts, LARGURA_CONTEUDO } from '@/theme';
import { Cores, Sombras } from '@/theme/palettes';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';

function inicioDoDia(d: Date): number {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c.getTime();
}

function diaMesCurto(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(iso))
    .replace('.', '');
}

function rotuloRelativo(iso: string): string {
  const dias = Math.round((inicioDoDia(new Date(iso)) - inicioDoDia(new Date())) / 86400000);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  return dias > 0 ? `daqui a ${dias} dias` : `há ${Math.abs(dias)} dias`;
}


const MESES_ANIV = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
/** 'YYYY-MM-DD' → "15 de maio" (ignora o ano). */
function formatAniversario(iso: string): string {
  const [, mm, dd] = iso.split('-');
  return `${Number(dd)} de ${MESES_ANIV[Number(mm) - 1] ?? ''}`;
}

/** Atalhos rápidos do topo — as ações que o membro mais usa no dia a dia. */
const ATALHOS: { icon: IconName; label: string; route: 'Escalas' | 'Biblioteca' | 'Afinador' | 'Metronomo' | 'Ministerio' }[] = [
  { icon: 'calendar-outline', label: 'Escalas', route: 'Escalas' },
  { icon: 'musical-notes', label: 'Repertório', route: 'Biblioteca' },
  { icon: 'speedometer-outline', label: 'Afinador', route: 'Afinador' },
  { icon: 'timer-outline', label: 'Metrônomo', route: 'Metronomo' },
  { icon: 'business-outline', label: 'Ministério', route: 'Ministerio' },
];

export function HomeScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);
  const navigation = useNavigation<MainTabScreenNavigationProp<'Home'>>();
  const insets = useSafeAreaInsets();

  const [minhasEscalas, setMinhasEscalas] = useState<CultoResumo[]>([]);
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [temNotificacaoNaoLida, setTemNotificacaoNaoLida] = useState(false);

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resumo, nascimentos, comunicados] = await Promise.all([
        cultosService.getResumoCultos(),
        membrosService.getAniversariantesDoMes(),
        avisosService.listarAvisos(),
      ]);
      const hoje = inicioDoDia(new Date());
      setAniversariantes(nascimentos);
      setAvisos(comunicados.slice(0, 3));
      setMinhasEscalas(
        resumo
          .filter((c) => c.minha_situacao !== null && inicioDoDia(new Date(c.data_hora)) >= hoje)
          .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
          .slice(0, 3),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os dados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados]),
  );

  useFocusEffect(
    useCallback(() => {
      notificacoesService
        .getMinhasNotificacoes()
        .then((notificacoes) => setTemNotificacaoNaoLida(notificacoes.some((n) => !n.lida)))
        .catch(() => {});
    }, []),
  );

  // Resumo do hero (dados reais já carregados).
  const proximaEscala = minhasEscalas[0];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.content}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={64} radius={radius.lg} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      {/* Top bar preenchida: gradiente primária→destaque que sobe até atrás da status bar. */}
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.topbar, { paddingTop: insets.top + spacing.sm }]}
      >
        <Text style={styles.wordmark}>Worship Stage</Text>
        <TouchableOpacity
          style={styles.topbarBtn}
          onPress={() => navigation.navigate('Notificacoes')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={temNotificacaoNaoLida ? 'Notificações (não lidas)' : 'Notificações'}
        >
          <Icon name="notifications-outline" size={24} color="#FFFFFF" />
          {temNotificacaoNaoLida && <View style={styles.badgeDot} />}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Stories: atalhos em círculos com anel (estilo IG). */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesWrap}
          contentContainerStyle={styles.stories}
        >
          {ATALHOS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.story}
              onPress={() => navigation.navigate(a.route)}
              accessibilityRole="button"
              accessibilityLabel={a.label}
            >
              <LinearGradient
                colors={colors.accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.storyRing}
              >
                <View style={styles.storyInner}>
                  <AnimatedIcon fallback={a.icon} size={38} color={colors.primary} />
                </View>
              </LinearGradient>
              <Text style={styles.storyLabel} numberOfLines={1}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Post: próxima escala */}
        <PostCard
          styles={styles}
          colors={colors}
          icone="calendar-outline"
          titulo={proximaEscala ? (proximaEscala.tipo ?? 'Próximo culto') : 'Tudo em dia'}
          sub={
            proximaEscala
              ? `${diaMesCurto(proximaEscala.data_hora)} · ${rotuloRelativo(proximaEscala.data_hora)}`
              : 'Nenhuma escala próxima'
          }
          onPress={
            proximaEscala
              ? () => navigation.navigate('DetalhesCulto', { cultoId: proximaEscala.id })
              : undefined
          }
        >
          {proximaEscala && (
            <>
              {proximaEscala.participantes.length > 0 && (
                <View style={styles.postServindo}>
                  <View style={styles.avatares}>
                    {proximaEscala.participantes.slice(0, 4).map((p, i) => (
                      <Avatar
                        key={p.membro_id}
                        nome={p.nome}
                        fotoUrl={p.foto}
                        size={30}
                        style={[styles.avatarBorda, i > 0 ? styles.avatarSobreposto : undefined]}
                      />
                    ))}
                    {proximaEscala.participantes.length > 4 && (
                      <View style={[styles.avatarPeq, styles.avatarSobreposto, styles.avatarMais]}>
                        <Text style={styles.avatarPeqText}>+{proximaEscala.participantes.length - 4}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.postServindoTxt}>servindo</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.postBotao}
                onPress={() => navigation.navigate('DetalhesCulto', { cultoId: proximaEscala.id })}
              >
                <Text style={styles.postBotaoText}>
                  {proximaEscala.minha_situacao === 'confirmado' ? 'Ver escala' : 'Confirmar presença'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </PostCard>

        {error ? (
          <Card style={styles.centeredCard}>
            <Icon name="cloud-offline-outline" size={32} color={colors.textMuted} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={carregarDados}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </Card>
        ) : null}

        {/* Posts: comunicados */}
        {avisos.map((a) => (
          <PostCard
            key={a.id}
            styles={styles}
            colors={colors}
            icone="chatbubble-ellipses-outline"
            titulo={a.titulo}
            sub="Comunicado"
            unread={!a.lido}
            onPress={() => navigation.navigate('Comunicados', { abrirId: a.id })}
          >
            {a.corpo ? (
              <Text style={styles.postCorpo} numberOfLines={3}>
                {a.corpo}
              </Text>
            ) : null}
          </PostCard>
        ))}

        {/* Post: aniversariantes do mês */}
        {aniversariantes.length > 0 && (
          <PostCard
            styles={styles}
            colors={colors}
            icone="gift-outline"
            titulo="Aniversariantes do mês"
            sub={`${aniversariantes.length} este mês`}
          >
            <View style={styles.anivLista}>
              {aniversariantes.slice(0, 5).map((a) => (
                <View key={a.id} style={styles.anivItem}>
                  <Avatar nome={a.nome} size={28} />
                  <Text style={styles.anivNome} numberOfLines={1}>
                    {a.nome}
                  </Text>
                  <Text style={styles.anivData}>{formatAniversario(a.data_nascimento)}</Text>
                </View>
              ))}
            </View>
          </PostCard>
        )}

        {/* Post: atalho pro repertório */}
        <PostCard
          styles={styles}
          colors={colors}
          icone="musical-notes"
          titulo="Mais tocadas"
          sub="Repertório"
          onPress={() => navigation.navigate('Biblioteca')}
        >
          <Text style={styles.postCorpo}>Confira as músicas do repertório.</Text>
        </PostCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function PostCard({
  styles,
  colors,
  icone,
  titulo,
  sub,
  unread,
  onPress,
  children,
}: {
  styles: ReturnType<typeof criarEstilos>;
  colors: Cores;
  icone: IconName;
  titulo: string;
  sub?: string;
  unread?: boolean;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Card style={styles.post} onPress={onPress}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <AnimatedIcon fallback={icone} size={32} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postTitulo} numberOfLines={1}>
            {titulo}
          </Text>
          {sub ? (
            <Text style={styles.postSub} numberOfLines={1}>
              {sub}
            </Text>
          ) : null}
        </View>
        {unread ? <View style={styles.postDot} /> : null}
      </View>
      {children}
    </Card>
  );
}

const criarEstilos = (colors: Cores, shadows: Sombras) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    centeredCard: { alignItems: 'center', gap: spacing.sm },
    errorText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
    retryButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
    retryText: { ...typography.bodySmall, color: colors.primary, fontFamily: fonts.semibold },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      width: '100%',
      maxWidth: LARGURA_CONTEUDO,
      alignSelf: 'center',
    },
    headerBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    avatarText: { ...typography.h3, color: colors.primary },
    headerTexts: { flex: 1 },
    greeting: { ...typography.h3, color: colors.text },
    headerOrg: { ...typography.bodySmall, color: colors.textSecondary },
    bell: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.sm,
    },
    badgeDot: { position: 'absolute', top: 8, right: 8, width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: colors.accent },
    heroCard: {
      gap: spacing.md,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.xxl,
      padding: spacing.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    heroTopo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    heroLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
    heroBig: { ...typography.h1, color: colors.text, marginTop: 2 },
    heroSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    heroBotao: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    heroBotaoText: { ...typography.bodySmall, color: colors.textInverse, fontFamily: fonts.semibold },
    atalhos: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    atalho: { flex: 1, alignItems: 'center', gap: 6 },
    atalhoIcon: {
      width: 54,
      height: 54,
      borderRadius: radius.lg,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    atalhoLabel: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
    scroll: { flex: 1 },
    content: {
      width: '100%',
      maxWidth: LARGURA_CONTEUDO,
      alignSelf: 'center',
      padding: spacing.lg,
      paddingTop: spacing.sm,
      gap: spacing.sm,
    },
    secaoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
    secaoTituloLinha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
    secaoTitulo: { ...typography.h2, color: colors.text },
    secaoContador: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 6,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secaoContadorText: { ...typography.caption, color: colors.textSecondary, fontFamily: fonts.semibold },
    secaoSub: { ...typography.caption, color: colors.textMuted },
    secaoAcao: { ...typography.bodySmall, color: colors.primary, fontFamily: fonts.semibold },
    vazioText: { ...typography.bodySmall, color: colors.textSecondary },
    ministerioCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.xxl, padding: spacing.lg },
    ministerioIcon: { width: 46, height: 46, borderRadius: radius.lg, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    iconAniv: { width: 46, height: 46, borderRadius: radius.lg, backgroundColor: 'rgba(242, 180, 83, 0.16)', alignItems: 'center', justifyContent: 'center' },
    ministerioNome: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    ministerioMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
    avisoPonto: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'transparent' },
    avisoPontoNaoLido: { backgroundColor: colors.primary },
    avisoTituloNaoLido: { fontFamily: fonts.bold },
    escalaCard: { gap: spacing.sm, borderRadius: radius.xxl, padding: spacing.lg },
    escalaTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    escalaData: { ...typography.bodySmall, color: colors.text, fontFamily: fonts.semibold },
    escalaRelativo: { ...typography.caption, color: colors.textMuted },
    escalaTitulo: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    avatares: { flexDirection: 'row', marginTop: 2 },
    avatarPeq: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    avatarBorda: { borderWidth: 2, borderColor: colors.surface },
    avatarSobreposto: { marginLeft: -8 },
    avatarMais: { backgroundColor: colors.surfaceElevated },
    avatarPeqText: { ...typography.caption, color: colors.primary, fontWeight: '700', fontSize: 9 },
    escalaRodape: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: 2 },
    contador: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    contadorText: { ...typography.caption, color: colors.textMuted },
    promoCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, borderRadius: radius.xxl, padding: spacing.lg },
    promoIcon: { width: 46, height: 46, borderRadius: radius.lg, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
    promoTitulo: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    promoSub: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
    // --- Instagram look ---
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
      width: '100%',
    },
    wordmark: { ...typography.h2, color: '#FFFFFF', fontFamily: fonts.bold },
    topbarBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    storiesWrap: { flexGrow: 0, marginHorizontal: -spacing.lg },
    stories: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingVertical: spacing.xs },
    story: { alignItems: 'center', gap: 6, width: 68 },
    storyRing: {
      width: 62,
      height: 62,
      borderRadius: 31,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 3,
    },
    storyInner: {
      width: '100%',
      height: '100%',
      borderRadius: 28,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    storyLabel: { ...typography.caption, color: colors.textSecondary, maxWidth: 64, textAlign: 'center' },
    post: { gap: spacing.md, borderRadius: radius.xxl, padding: spacing.lg, ...shadows.sm },
    postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    postAvatar: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    postTitulo: { ...typography.body, color: colors.text, fontFamily: fonts.semibold },
    postSub: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
    postDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
    postCorpo: { ...typography.bodySmall, color: colors.textSecondary },
    postServindo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    postServindoTxt: { ...typography.caption, color: colors.textMuted },
    postBotao: {
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    postBotaoText: { ...typography.bodySmall, color: colors.textInverse, fontFamily: fonts.semibold },
    anivLista: { gap: spacing.sm },
    anivItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    anivNome: { ...typography.bodySmall, color: colors.text, flex: 1, fontFamily: fonts.semibold },
    anivData: { ...typography.caption, color: colors.textSecondary },
  });
