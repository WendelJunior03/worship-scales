import { query, withBypass } from '../config/database';

export interface PushInscricao {
    id: number;
    membro_id: number;
    endpoint: string;
    p256dh: string;
    auth: string;
}

/**
 * Salva (ou reaproveita) a inscrição deste aparelho pro membro logado. O endpoint é
 * único no mundo: se o aparelho já estava inscrito — mesmo por outro membro/org (troca
 * de conta no mesmo celular) — a linha antiga sai antes, pra ninguém receber push do
 * aparelho alheio. Esse DELETE cruza orgs, por isso roda em bypass; o INSERT volta
 * pro contexto normal (RLS preenche/valida o org_id).
 */
export async function salvarInscricao(membroId: number, endpoint: string, p256dh: string, auth: string) {
    await withBypass((client) => client.query('DELETE FROM push_inscricoes WHERE endpoint = $1', [endpoint]));
    const result = await query(
        'INSERT INTO push_inscricoes (membro_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4) RETURNING id',
        [membroId, endpoint, p256dh, auth],
    );
    return result.rows[0];
}

export async function removerInscricao(membroId: number, endpoint: string) {
    await query('DELETE FROM push_inscricoes WHERE membro_id = $1 AND endpoint = $2', [membroId, endpoint]);
}

export async function findInscricoesDoMembro(membroId: number): Promise<PushInscricao[]> {
    const result = await query(
        'SELECT id, membro_id, endpoint, p256dh, auth FROM push_inscricoes WHERE membro_id = $1',
        [membroId],
    );
    return result.rows;
}

/** Inscrição que o serviço de push disse não existir mais (404/410). */
export async function removerInscricaoPorId(id: number) {
    await query('DELETE FROM push_inscricoes WHERE id = $1', [id]);
}
