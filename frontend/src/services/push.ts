import { Platform } from 'react-native';
import { api } from './api';

/**
 * Notificações push (Web Push) do PWA: o celular recebe os avisos do sino mesmo com
 * o app fechado. Só existe no web — o service worker (public/sw.js) é quem mostra a
 * notificação. No iPhone o Safari só libera push com o app instalado na Tela de
 * Início (iOS 16.4+).
 */
export type EstadoPush =
  | 'indisponivel' // navegador/plataforma sem suporte (ou push desligado no servidor)
  | 'precisa-instalar' // iPhone/iPad fora do app instalado
  | 'bloqueado' // a pessoa negou a permissão — só reativa nas configurações do aparelho
  | 'inativo'
  | 'ativo';

function ehIOS(): boolean {
  const ua = navigator.userAgent;
  // iPadOS se apresenta como Mac; o toque denuncia.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function ehStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function temSuporte(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

async function inscricaoAtual(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription()) ?? null;
}

export async function obterEstado(): Promise<EstadoPush> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return 'indisponivel';
  if (ehIOS() && !ehStandalone()) return 'precisa-instalar';
  if (!temSuporte()) return 'indisponivel';
  if (Notification.permission === 'denied') return 'bloqueado';
  if (Notification.permission !== 'granted') return 'inativo';
  return (await inscricaoAtual()) ? 'ativo' : 'inativo';
}

// A chave VAPID vem em base64url; o PushManager quer os bytes.
function base64UrlParaBytes(b64: string): Uint8Array {
  const padded = (b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function enviarInscricao(sub: PushSubscription) {
  await api.post('/push/inscricoes', sub.toJSON());
}

/**
 * Pede permissão e inscreve este aparelho. Tem que ser chamada direto do toque do
 * usuário (o iOS recusa o pedido de permissão fora de um gesto), por isso o
 * requestPermission vem antes de qualquer outra espera.
 */
export async function ativar(): Promise<EstadoPush> {
  if (!temSuporte()) return obterEstado();
  const permissao = await Notification.requestPermission();
  if (permissao !== 'granted') return permissao === 'denied' ? 'bloqueado' : 'inativo';

  const { data } = await api.get<{ chave: string }>('/push/chave-publica');
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlParaBytes(data.chave) as BufferSource,
    }));
  await enviarInscricao(sub);
  return 'ativo';
}

/** Desliga neste aparelho: tira do servidor e cancela a inscrição no navegador. */
export async function desativar(): Promise<EstadoPush> {
  if (!temSuporte()) return obterEstado();
  const sub = await inscricaoAtual();
  if (sub) {
    await api.delete('/push/inscricoes', { data: { endpoint: sub.endpoint } });
    await sub.unsubscribe();
  }
  return obterEstado();
}

/**
 * Garante que o servidor conhece a inscrição deste aparelho pro usuário logado
 * (idempotente). Cobre o caso de sair e entrar com outra conta no mesmo celular:
 * o logout tira a inscrição do servidor, e o próximo login a reata ao novo usuário.
 */
export async function sincronizar(): Promise<void> {
  if (!temSuporte() || Notification.permission !== 'granted') return;
  const sub = await inscricaoAtual();
  if (sub) await enviarInscricao(sub);
}

/** No logout: este aparelho para de receber push da conta que está saindo. */
export async function removerDoServidor(): Promise<void> {
  if (!temSuporte()) return;
  const sub = await inscricaoAtual();
  if (sub) await api.delete('/push/inscricoes', { data: { endpoint: sub.endpoint } });
}
