import webpush from 'web-push';
import { findInscricoesDoMembro, removerInscricaoPorId } from '../models/pushInscricaoModel';

// Sem as chaves VAPID o push fica desligado (o app sobe normal e as notificações
// seguem só no sino) — mesmo padrão do billing sem STRIPE_SECRET_KEY.
const publica = process.env.VAPID_PUBLIC_KEY;
const privada = process.env.VAPID_PRIVATE_KEY;
export const pushHabilitado = !!(publica && privada);

if (pushHabilitado) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contato@worshipstage.app', publica!, privada!);
}

export function chavePublicaVapid(): string | null {
    return pushHabilitado ? publica! : null;
}

export interface PayloadPush {
    titulo: string;
    corpo: string;
    /** Caminho do app aberto ao tocar na notificação (ex.: /cultos/12). */
    url: string;
}

/**
 * Manda o push pra todos os aparelhos inscritos do membro. Nunca lança: falha de push
 * não pode derrubar a ação que gerou a notificação. Inscrição expirada/revogada
 * (404/410) é apagada pra não tentar de novo.
 */
export async function enviarPushParaMembro(membroId: number, payload: PayloadPush): Promise<void> {
    if (!pushHabilitado) return;
    try {
        const inscricoes = await findInscricoesDoMembro(membroId);
        const corpo = JSON.stringify(payload);
        await Promise.all(
            inscricoes.map(async (i) => {
                try {
                    await webpush.sendNotification(
                        { endpoint: i.endpoint, keys: { p256dh: i.p256dh, auth: i.auth } },
                        corpo,
                        { TTL: 60 * 60 * 24 },
                    );
                } catch (err) {
                    const status = (err as { statusCode?: number }).statusCode;
                    if (status === 404 || status === 410) {
                        await removerInscricaoPorId(i.id);
                    } else {
                        console.error('Erro ao enviar push:', status ?? err);
                    }
                }
            }),
        );
    } catch (err) {
        console.error('Erro ao enviar push:', err);
    }
}
