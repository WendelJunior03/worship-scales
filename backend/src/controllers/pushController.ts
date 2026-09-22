import { Request, Response } from 'express';
import { removerInscricao, salvarInscricao } from '../models/pushInscricaoModel';
import { chavePublicaVapid } from '../services/pushService';

export async function getChavePublicaController(_req: Request, res: Response) {
    const chave = chavePublicaVapid();
    if (!chave) {
        return res.status(503).json({ message: 'Notificações push indisponíveis.' });
    }
    return res.status(200).json({ chave });
}

function lerInscricao(body: any): { endpoint: string; p256dh: string; auth: string } | null {
    const endpoint = body?.endpoint;
    const p256dh = body?.keys?.p256dh;
    const auth = body?.keys?.auth;
    if (typeof endpoint !== 'string' || !/^https:\/\//.test(endpoint) || endpoint.length > 1000) return null;
    if (typeof p256dh !== 'string' || typeof auth !== 'string' || p256dh.length > 200 || auth.length > 100) return null;
    return { endpoint, p256dh, auth };
}

export async function inscreverController(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado!' });
    }
    const inscricao = lerInscricao(req.body);
    if (!inscricao) {
        return res.status(400).json({ message: 'Inscrição inválida.' });
    }
    await salvarInscricao(req.user.id, inscricao.endpoint, inscricao.p256dh, inscricao.auth);
    return res.status(201).json({ message: 'Notificações ativadas!' });
}

export async function desinscreverController(req: Request, res: Response) {
    if (!req.user) {
        return res.status(401).json({ message: 'Não autorizado!' });
    }
    const endpoint = req.body?.endpoint;
    if (typeof endpoint !== 'string') {
        return res.status(400).json({ message: 'Endpoint inválido.' });
    }
    await removerInscricao(req.user.id, endpoint);
    return res.status(200).json({ message: 'Notificações desativadas.' });
}
