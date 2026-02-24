import { api } from "../lib/api";

export type CheckInPayload = {
  name: string;
  flightNumber: string;
};

export type CheckInItem = {
  id: string;
  name: string;
  flightNumber: string;
  createdAt: number;
};

/**
 * READ: lista todos os check-ins salvos no JSON
 * GET /items
 */
export async function listCheckIns(): Promise<CheckInItem[]> {
  const { data } = await api.get<CheckInItem[]>("/items");
  return data;
}

/**
 * CREATE: cria um check-in (salva no JSON)
 * POST /items
 */
export async function createCheckIn(payload: CheckInPayload): Promise<CheckInItem> {
  const { data } = await api.post<CheckInItem>("/items", payload);
  return data;
}

/**
 * DELETE: apaga um check-in pelo id
 * DELETE /items/:id
 */
export async function deleteCheckIn(id: string): Promise<void> {
  await api.delete(`/items/${id}`);
}