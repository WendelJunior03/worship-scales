import { useCallback, useEffect, useState } from 'react';
import * as push from '@/services/push';
import { ApiError } from '@/services/api';
import { showToast } from '@/utils/toast';

/** Estado + ações das notificações push deste aparelho (card da Início e Perfil). */
export function usePushNotificacoes() {
  const [estado, setEstado] = useState<push.EstadoPush | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    push.obterEstado().then(setEstado).catch(() => setEstado('indisponivel'));
  }, []);

  const executar = useCallback(async (acao: () => Promise<push.EstadoPush>, esperado: push.EstadoPush, sucesso: string) => {
    setOcupado(true);
    try {
      const novo = await acao();
      setEstado(novo);
      if (novo === esperado) showToast(sucesso, 'success');
      if (novo === 'bloqueado') {
        showToast('Notificações bloqueadas. Libere nas configurações do aparelho.', 'error', 4500);
      }
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Não foi possível alterar as notificações.', 'error');
    } finally {
      setOcupado(false);
    }
  }, []);

  const ativar = useCallback(() => executar(push.ativar, 'ativo', 'Notificações ativadas!'), [executar]);
  const desativar = useCallback(() => executar(push.desativar, 'inativo', 'Notificações desativadas.'), [executar]);

  return { estado, ocupado, ativar, desativar };
}
