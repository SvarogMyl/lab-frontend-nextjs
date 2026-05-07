const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export async function login(username: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error al iniciar sesión');
  }

  return response.json();
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(5000) 
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === "UP";
  } catch (err) {
    return false;
  }
}

export interface Item {
  id?: number;
  nombre: string;
  descripcion: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

export async function getItems(token: string, page: number = 0, size: number = 5): Promise<PageResponse<Item>> {
  const response = await fetch(`${API_URL}/items?page=${page}&size=${size}`, { headers: getHeaders(token) });
  if (!response.ok) throw new Error('Error al obtener items');
  return response.json();
}

export async function createItem(token: string, item: Item): Promise<Item> {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(item)
  });
  if (!response.ok) throw new Error('Error al crear item');
  return response.json();
}

export async function updateItem(token: string, id: number, item: Item): Promise<Item> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(item)
  });
  if (!response.ok) throw new Error('Error al actualizar item');
  return response.json();
}

export async function deleteItem(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token)
  });
  if (!response.ok) throw new Error('Error al eliminar item');
}
