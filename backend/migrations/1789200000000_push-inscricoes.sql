-- Web Push: inscrições de aparelhos pra receber notificação com o app fechado.
--
-- Cada linha é um aparelho/navegador (PushSubscription do browser) de um membro.
-- `endpoint` é único no mundo (a URL do serviço de push do navegador), então serve de
-- chave: se o mesmo aparelho se inscrever de novo (ou outro membro logar nele), a
-- linha antiga é substituída. Nasce multi-tenant (RLS por org, padrão do Passo 4).

-- Up Migration

CREATE TABLE push_inscricoes (
  id          SERIAL PRIMARY KEY,
  org_id      INTEGER NOT NULL REFERENCES organizacoes(id),
  membro_id   INTEGER NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_inscricoes_org    ON push_inscricoes (org_id);
CREATE INDEX idx_push_inscricoes_membro ON push_inscricoes (membro_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON push_inscricoes TO deepscales_app;
GRANT USAGE, SELECT ON SEQUENCE push_inscricoes_id_seq TO deepscales_app;

-- RLS (isolamento por org) — mesmo padrão do Passo 4.
ALTER TABLE push_inscricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_inscricoes FORCE ROW LEVEL SECURITY;
ALTER TABLE push_inscricoes
  ALTER COLUMN org_id SET DEFAULT NULLIF(current_setting('app.current_org', true), '')::int;
CREATE POLICY org_isolation ON push_inscricoes
  USING (
    current_setting('app.bypass_rls', true) = 'on'
    OR org_id = NULLIF(current_setting('app.current_org', true), '')::int
  )
  WITH CHECK (
    current_setting('app.bypass_rls', true) = 'on'
    OR org_id = NULLIF(current_setting('app.current_org', true), '')::int
  );

-- Down Migration

DROP POLICY IF EXISTS org_isolation ON push_inscricoes;
DROP TABLE IF EXISTS push_inscricoes;
