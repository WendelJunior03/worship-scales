import { query } from '../config/database';

// Catálogo de músicas por organização (spec 08 + módulo 10). org_id é preenchido pelo
// DEFAULT/RLS (Passo 4) — as queries já saem escopadas na org atual.

export interface MusicaInput {
    nome: string;
    tomPadrao: string | null;
    bpm: number | null;
    artista: string | null;
    cifraUrl: string | null;
    audioUrl: string | null;
    capaUrl: string | null;
}

export async function criarMusica(input: MusicaInput) {
    const result = await query(
        `INSERT INTO musicas (nome, tom_padrao, bpm, artista, cifra_url, audio_url, capa_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [input.nome, input.tomPadrao, input.bpm, input.artista, input.cifraUrl, input.audioUrl, input.capaUrl],
    );
    return result.rows[0];
}

export async function listarMusicas() {
    const result = await query('SELECT * FROM musicas ORDER BY nome ASC');
    return result.rows;
}

export async function buscarMusica(id: number) {
    const result = await query('SELECT * FROM musicas WHERE id = $1', [id]);
    return result.rows[0];
}

/** Match exato (sem diferenciar maiúscula/minúscula) — usado pra não duplicar ao
 *  vincular o Repertório à Biblioteca automaticamente. */
export async function buscarMusicaPorNome(nome: string) {
    const result = await query('SELECT * FROM musicas WHERE lower(nome) = lower($1) LIMIT 1', [nome]);
    return result.rows[0];
}

export async function atualizarMusica(id: number, input: MusicaInput) {
    const result = await query(
        `UPDATE musicas
            SET nome = $1, tom_padrao = $2, bpm = $3, artista = $4, cifra_url = $5, audio_url = $6, capa_url = $7
          WHERE id = $8 RETURNING *`,
        [input.nome, input.tomPadrao, input.bpm, input.artista, input.cifraUrl, input.audioUrl, input.capaUrl, id],
    );
    return result.rows[0];
}

export async function apagarMusica(id: number) {
    const result = await query('DELETE FROM musicas WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
}

/**
 * Artistas = agregação por `musicas.artista` (sem tabela própria na v1). Retorna
 * cada artista com quantas músicas tem, ignorando quem não tem artista definido.
 */
export async function listarArtistas() {
    const result = await query(
        `SELECT artista, COUNT(*)::int AS total_musicas
           FROM musicas
          WHERE artista IS NOT NULL AND artista <> ''
          GROUP BY artista
          ORDER BY artista ASC`,
    );
    return result.rows;
}

/**
 * Músicas mais tocadas: conta as vezes que cada música entrou no repertório de cultos
 * que JÁ aconteceram. Linhas antigas do repertório não têm `musica_id` — essas casam
 * com a biblioteca pelo nome (sem caixa/espaços) pra aproveitar capa/artista; sem
 * par na biblioteca, agrupam pelo próprio nome. Se o ranking não enche o limite,
 * completa com músicas da Biblioteca (vezes = 0).
 */
export async function listarMaisTocadas(limite: number) {
    const result = await query(
        `WITH tocadas AS (
            SELECT COALESCE(r.musica_id, par.id) AS musica_id,
                   lower(trim(r.nome)) AS chave,
                   r.nome
              FROM repertorio r
              JOIN cultos c ON c.id = r.culto_id
              LEFT JOIN LATERAL (
                  SELECT m.id FROM musicas m
                   WHERE r.musica_id IS NULL AND lower(trim(m.nome)) = lower(trim(r.nome))
                   ORDER BY m.id LIMIT 1
              ) par ON true
             WHERE c.data_hora <= now()
        )
        SELECT t.musica_id,
               COALESCE(m.nome, min(t.nome)) AS nome,
               m.artista,
               m.capa_url,
               COUNT(*)::int AS vezes
          FROM tocadas t
          LEFT JOIN musicas m ON m.id = t.musica_id
         GROUP BY t.musica_id, (CASE WHEN t.musica_id IS NULL THEN t.chave END), m.nome, m.artista, m.capa_url
         ORDER BY vezes DESC, nome ASC
         LIMIT $1`,
        [limite],
    );
    const ranking = result.rows;
    if (ranking.length >= limite) return ranking;

    // Pouco (ou nenhum) histórico ainda: completa com as músicas da Biblioteca mais
    // recentes (vezes = 0), pra o card da Início já mostrar o que o ministério cadastrou.
    const jaListadas = ranking.map((r) => r.musica_id).filter((id): id is number => id != null);
    const complemento = await query(
        `SELECT id AS musica_id, nome, artista, capa_url, 0 AS vezes
           FROM musicas
          WHERE NOT (id = ANY($1::int[]))
          ORDER BY created_at DESC, id DESC
          LIMIT $2`,
        [jaListadas, limite - ranking.length],
    );
    return [...ranking, ...complemento.rows];
}
