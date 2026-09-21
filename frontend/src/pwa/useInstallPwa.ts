import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Lógica do convite de instalação do PWA (só faz sentido no web; no nativo o hook
 * é inerte e devolve `visivel: false`).
 *
 * Três caminhos, porque cada plataforma expõe a instalação de um jeito:
 *  • 'nativo'  — Android/Chrome dispara `beforeinstallprompt`; guardamos o evento e
 *                um botão chama `prompt()` (o diálogo real de instalar).
 *  • 'ios'     — Safari NUNCA dispara o evento; só resta instruir "Compartilhar →
 *                Adicionar à Tela de Início".
 *  • 'desktop' — no PC não instalamos no telefone por ele; mostramos um QR pra abrir
 *                o site no celular e instalar lá.
 */

// `beforeinstallprompt` não está no lib DOM padrão do TS — declaração mínima.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type ModoInstalar = 'nativo' | 'ios' | 'desktop';

const CHAVE_DISPENSA = 'pwa-install-dispensado-em';
const REEXIBIR_APOS_MS = 14 * 24 * 60 * 60 * 1000; // não insiste por 14 dias após dispensar
const ATRASO_EXIBIR_MS = 2500; // não aparece no primeiro paint (menos intrusivo)

function ehStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS expõe o standalone por aqui em vez do display-mode.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function detectarPlataforma(): 'ios' | 'android' | 'desktop' {
  const nav = window.navigator;
  const ua = nav.userAgent || '';
  // iPad no iOS 13+ se identifica como "Mac"; o maxTouchPoints desmascara.
  const ehIpadMod = nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
  if (/iPad|iPhone|iPod/.test(ua) || ehIpadMod) return 'ios';
  if (/Android/i.test(ua) || /Mobi/i.test(ua)) return 'android';
  return 'desktop';
}

function dispensadoRecentemente(): boolean {
  try {
    const v = localStorage.getItem(CHAVE_DISPENSA);
    return !!v && Date.now() - Number(v) < REEXIBIR_APOS_MS;
  } catch {
    return false;
  }
}

export function useInstallPwa() {
  const [visivel, setVisivel] = useState(false);
  const [modo, setModo] = useState<ModoInstalar>('desktop');
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (ehStandalone() || dispensadoRecentemente()) return;

    const plataforma = detectarPlataforma();

    // Chrome (Android e desktop) dispara isso quando o app é instalável.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      // No desktop preferimos o QR (instalar no celular), não o install do PC.
      if (plataforma !== 'desktop') {
        setModo('nativo');
        setVisivel(true);
      }
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onInstalado = () => {
      promptRef.current = null;
      setVisivel(false);
    };
    window.addEventListener('appinstalled', onInstalado);

    // Casos que não dependem do evento: iOS (nunca dispara) e desktop (QR).
    // Android sem o evento fica de fora de propósito, pra não mostrar botão morto.
    const timer = setTimeout(() => {
      if (ehStandalone()) return;
      if (plataforma === 'ios') {
        setModo('ios');
        setVisivel(true);
      } else if (plataforma === 'desktop') {
        setModo('desktop');
        setVisivel(true);
      }
    }, ATRASO_EXIBIR_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalado);
      clearTimeout(timer);
    };
  }, []);

  const instalar = async () => {
    const p = promptRef.current;
    if (!p) return;
    await p.prompt();
    await p.userChoice;
    promptRef.current = null;
    setVisivel(false);
  };

  const dispensar = () => {
    try {
      localStorage.setItem(CHAVE_DISPENSA, String(Date.now()));
    } catch {
      /* localStorage indisponível (modo privado) — só esconde nesta sessão. */
    }
    setVisivel(false);
  };

  const urlApp = typeof window !== 'undefined' ? window.location.origin : '';

  return { visivel, modo, instalar, dispensar, urlApp };
}
