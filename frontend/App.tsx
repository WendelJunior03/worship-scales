import { useEffect, useState } from 'react';
import '@/config/calendario';
import { ActivityIndicator, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { InitialState, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfirmDialogHost } from '@/components/ConfirmDialogHost';
import { ToastHost } from '@/components/ToastHost';
import { InstallPwaHost } from '@/components/InstallPwaHost';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationRef } from '@/navigation/navigationRef';
import { linking } from '@/navigation/linking';
import { NAVIGATION_PERSISTENCE_KEY } from '@/navigation/persistence';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<InitialState | undefined>();
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    // Web: o navegador força um fundo branco/amarelo nos campos com autofill (login
    // salvo), ignorando o `backgroundColor` do `Input`. Não dá pra sobrescrever com
    // StyleSheet (é pseudo-classe do navegador) — atrasa a transição quase pro
    // infinito, então o fundo do navegador nunca chega a aparecer visualmente.
    // A cor do TEXTO fica por conta do `Input.tsx` (WebkitTextFillColor inline) — não
    // repete aqui com `!important`, porque isso sobrescreveria o valor inline.
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          transition: background-color 9999s ease-in-out 0s !important;
        }

        /* O retângulo preto padrão do navegador ao focar um <input>/<textarea> — o
           componente Input.tsx já resolve isso por instância (outlineStyle: 'none' +
           borda colorida no container); os TextInput "crus" espalhados pelo app (busca,
           comentários, campos de modal etc.) não têm essa borda de foco própria, então
           aplica global aqui em vez de repetir em cada tela. */
        input:focus,
        textarea:focus {
          outline: none;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  useEffect(() => {
    // Registra o service worker no web — é o que habilita o PWA a ser instalável
    // (o convite de instalar em si é do InstallPwaHost). Falha silenciosa: se não
    // registrar, o app segue funcionando como site normal.
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrar = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
      if (document.readyState === 'complete') {
        registrar();
      } else {
        window.addEventListener('load', registrar);
        return () => window.removeEventListener('load', registrar);
      }
    }
  }, []);

  useEffect(() => {
    async function restoreState() {
      try {
        const saved = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
        if (saved) {
          setInitialState(JSON.parse(saved));
        }
      } finally {
        setIsReady(true);
      }
    }
    restoreState();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <RaizApp pronto={isReady && fontsLoaded} initialState={initialState} />
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

// Fica dentro do ThemeProvider pra ler o tema (loading temático + StatusBar dinâmico).
function RaizApp({ pronto, initialState }: { pronto: boolean; initialState?: InitialState }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!pronto) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      initialState={initialState}
      onStateChange={(state) =>
        AsyncStorage.setItem(NAVIGATION_PERSISTENCE_KEY, JSON.stringify(state))
      }
    >
      <RootNavigator />
      <ConfirmDialogHost />
      <ToastHost />
      <InstallPwaHost />
      {/* Faixa da status bar (o app desenha sob ela via meta black-translucent):
          cor primária em todas as telas pra o relógio branco ler bem e o topo ficar preenchido. */}
      {insets.top > 0 && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: colors.primary,
          }}
        />
      )}
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
