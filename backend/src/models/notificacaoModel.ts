import { query } from '../config/database';
import { enviarPushParaMembro } from '../services/pushService';

export async function createNotificacao(
    membroId: number,
    tipo: string,
    titulo: string,
    descricao: string,
    cultoId?: number | null,
    referenciaTipo?: string | null,
    referenciaId?: number | null,
) {
    const result = await query(
        'INSERT INTO notificacoes (membro_id, tipo, titulo, descricao, culto_id, referencia_tipo, referencia_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [membroId, tipo, titulo, descricao, cultoId ?? null, referenciaTipo ?? null, referenciaId ?? null],
    );
    // Todo aviso do sino também vira push no celular (app fechado). Sem await: o push
    // não atrasa a resposta e nunca lança (ver pushService).
    void enviarPushParaMembro(membroId, {
        titulo,
        corpo: descricao,
        url: cultoId ? `/cultos/${cultoId}` : '/notificacoes',
    });
    return result.rows[0];
}

export async function findMinhasNotificacoes(membroId: number) {
    const result = await query('SELECT * FROM notificacoes WHERE membro_id = $1 ORDER BY created_at DESC', [membroId]);
    return result.rows;
}

export async function findNotificacaoById(id: number) {
    const result = await query('SELECT * FROM notificacoes WHERE id = $1', [id]);
    return result.rows[0];
}

export async function marcarComoLida(id: number) {
    const result = await query('UPDATE notificacoes SET lida = true WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
}

export async function deletarMinhasNotificacoes(membroId: number) {
    const result = await query('DELETE FROM notificacoes WHERE membro_id = $1 RETURNING id', [membroId]);
    return result.rows;
}
