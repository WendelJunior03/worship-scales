import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/components/Icon';
import { Avatar } from '@/components/Avatar';
import { spacing, radius, LARGURA_CONTEUDO } from '@/theme';
import { Cores, Sombras } from '@/theme/palettes';
import { useTheme, useThemedStyles } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { AgendaScreen } from '@/screens/escalas/AgendaScreen';
import { RecursosScreen } from '@/screens/recursos/RecursosScreen';
import { NotificacoesScreen } from '@/screens/notificacoes/NotificacoesScreen';
import { PerfilScreen } from '@/screens/perfil/PerfilScreen';

export type MainTabParamList = {
  Home: undefined;
  Agenda: undefined;
  Recursos: undefined;
  Notificacoes: undefined;
  Perfil: undefined;
};

const tabIcon: Record<keyof MainTabParamList, IconName> = {
  Home: 'home',
  Agenda: 'calendar',
  Recursos: 'grid',
  Notificacoes: 'notifications',
  Perfil: 'person',
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Altura reservada embaixo pra cápsula flutuante não cobrir o fim do conteúdo.
const ALTURA_CAPSULA = 64;

/**
 * Tab bar flutuante em cápsula (estilo Instagram) — só no mobile. Ícones apenas;
 * o item ativo ganha um realce arredondado e a aba Perfil vira a foto do usuário.
 */
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(criarEstilos);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + spacing.sm }]}
    >
      <View style={styles.capsula}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const ehPerfil = route.name === 'Perfil';
          const cor = focused ? colors.accent : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
            >
              <View style={[styles.itemInner, focused && styles.itemInnerAtivo]}>
                {ehPerfil ? (
                  <Avatar
                    nome={user?.nome ?? 'Perfil'}
                    fotoUrl={user?.foto_url}
                    size={28}
                    style={focused ? styles.avatarAtivo : undefined}
                  />
                ) : (
                  <Icon name={tabIcon[route.name as keyof MainTabParamList]} size={24} color={cor} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  // No desktop a navegação principal fica na `PersistentSidebar` (fixa, no
  // MainNavigator, ao lado do Stack) — então aqui escondemos a tab bar. No mobile
  // mostramos a cápsula flutuante e reservamos espaço embaixo pra ela.
  const { isDesktop } = useBreakpoint();
  const reserva = isDesktop ? 0 : ALTURA_CAPSULA + spacing.sm * 2 + insets.bottom;

  return (
    <Tab.Navigator
      tabBar={(props) => (isDesktop ? null : <FloatingTabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        sceneStyle: { flex: 1, backgroundColor: colors.background, paddingBottom: reserva },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ title: 'Agenda' }} />
      <Tab.Screen name="Recursos" component={RecursosScreen} options={{ title: 'Recursos' }} />
      <Tab.Screen name="Notificacoes" component={NotificacoesScreen} options={{ title: 'Avisos' }} />
      <Tab.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

const criarEstilos = (colors: Cores, shadows: Sombras) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    capsula: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: Math.min(LARGURA_CONTEUDO, 460),
      height: ALTURA_CAPSULA,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadows.lg,
    },
    item: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    itemInner: {
      width: 48,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemInnerAtivo: {
      backgroundColor: colors.accentSoft,
    },
    avatarAtivo: {
      borderWidth: 2,
      borderColor: colors.accent,
    },
  });
