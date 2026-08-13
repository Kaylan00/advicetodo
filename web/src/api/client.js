const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";
const STORAGE_KEY = "advicetodo.session";

let session = readSession();
let onSessionLost = () => {};

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function getSession() {
  return session;
}

export function saveSession(next) {
  session = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearSession() {
  session = null;
  localStorage.removeItem(STORAGE_KEY);
}

export function setSessionLostHandler(handler) {
  onSessionLost = handler;
}

export class ApiError extends Error {
  constructor(status, data) {
    super(`Requisicao falhou com status ${status}`);
    this.status = status;
    this.data = data;
  }

  /** Primeira mensagem legivel do corpo de erro do DRF. */
  get firstMessage() {
    const detail = this.data?.detail;
    if (detail) return detail;
    const first = Object.values(this.data ?? {})[0];
    if (Array.isArray(first)) return first[0];
    return typeof first === "string" ? first : "Nao foi possivel completar a operacao.";
  }
}

async function parse(response) {
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function send(path, { method = "GET", body, params, auth = true } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && session?.access) headers.Authorization = `Bearer ${session.access}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.ok) return parse(response);
  throw new ApiError(response.status, await parse(response).catch(() => null));
}

async function refreshAccess() {
  if (!session?.refresh) return false;
  try {
    const data = await send("/auth/refresh/", {
      method: "POST",
      body: { refresh: session.refresh },
      auth: false,
    });
    saveSession({ ...session, access: data.access });
    return true;
  } catch {
    return false;
  }
}

/** Repete a chamada uma unica vez depois de renovar o token expirado. */
export async function request(path, options = {}) {
  try {
    return await send(path, options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || options.auth === false) {
      throw error;
    }
    if (await refreshAccess()) return send(path, options);
    clearSession();
    onSessionLost();
    throw error;
  }
}
