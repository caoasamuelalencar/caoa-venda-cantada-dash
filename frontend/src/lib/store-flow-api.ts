export type StoreFlowPayload = {
  regional: string;
  lojaVenda: string;
  fluxo: number;
};

function getErrorMessage(status: number, body: unknown) {
  const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
    ? body.message
    : null;
  if (message) return message;
  if (status === 401 || status === 403) return 'Você não tem permissão para registrar o fluxo de loja.';
  return 'Não foi possível salvar o fluxo de loja. Tente novamente.';
}

export async function saveStoreFlow(payload: StoreFlowPayload) {
  const response = await fetch('/api/store-flows', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, await response.json().catch(() => null)));
  }

  return response.json() as Promise<StoreFlowPayload & { id: number; data: string }>;
}
