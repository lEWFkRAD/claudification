// ============================================================
// Claudification — API Client (CLAUDIFICATION-001)
// Wires UI to muse-board backend at localhost:3001
// ============================================================

const MUSE_API = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

// ── Conversations CRUD ──────────────────────────────────────

export async function listConversations() {
  const res = await fetch(`${MUSE_API}/api/conversations`);
  if (!res.ok) throw new Error(`listConversations: ${res.status}`);
  return res.json();
}

export async function getConversation(id) {
  const res = await fetch(`${MUSE_API}/api/conversations/${id}`);
  if (!res.ok) throw new Error(`getConversation: ${res.status}`);
  return res.json();
}

export async function createConversation(title, messages = []) {
  const res = await fetch(`${MUSE_API}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, messages }),
  });
  if (!res.ok) throw new Error(`createConversation: ${res.status}`);
  return res.json();
}

export async function updateConversation(id, { title, messages }) {
  const payload = {};
  if (title !== undefined) payload.title = title;
  if (messages !== undefined) payload.messages = messages;
  const res = await fetch(`${MUSE_API}/api/conversations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updateConversation: ${res.status}`);
  return res.json();
}

// ── Spren Chat Proxy ────────────────────────────────────────

export async function sprenChat(messages, { system, model, maxTokens, userId } = {}) {
  const res = await fetch(`${MUSE_API}/api/spren/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': String(userId) } : {}),
    },
    body: JSON.stringify({
      messages,
      ...(system ? { system } : {}),
      ...(model ? { model } : {}),
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `sprenChat: ${res.status}`);
  }
  return res.json();
}

// ── Spren Keyring ───────────────────────────────────────────

export async function listKeyring(userId) {
  const res = await fetch(`${MUSE_API}/api/spren/keyring`, {
    headers: { ...(userId ? { 'X-User-Id': String(userId) } : {}) },
  });
  if (!res.ok) {
    // 503 = keyring not enabled — return empty list, not error
    if (res.status === 503) return [];
    throw new Error(`listKeyring: ${res.status}`);
  }
  return res.json();
}

export async function registerKey(service, key, label, userId) {
  const res = await fetch(`${MUSE_API}/api/spren/keyring`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': String(userId) } : {}),
    },
    body: JSON.stringify({ service, key, label }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `registerKey: ${res.status}`);
  }
  return res.json();
}

// ── Agent Actions ───────────────────────────────────────────

export async function executeAgentActions(actions, { userId, scopeId, actorId, idempotencyKey } = {}) {
  const res = await fetch(`${MUSE_API}/api/agent/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': String(userId) } : {}),
      ...(scopeId ? { 'X-Scope-Id': scopeId } : {}),
      ...(actorId ? { 'X-Actor-Id': actorId } : {}),
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({ actions }),
  });
  if (!res.ok) throw new Error(`executeAgentActions: ${res.status}`);
  return res.json();
}

// ── WebSocket ───────────────────────────────────────────────

export function connectWebSocket(onMessage, onOpen, onClose) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('[Claudification] WebSocket connected');
    if (onOpen) onOpen();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (e) {
      console.warn('[Claudification] WebSocket parse error:', e);
    }
  };

  ws.onclose = () => {
    console.log('[Claudification] WebSocket disconnected');
    if (onClose) onClose();
  };

  ws.onerror = (err) => {
    console.error('[Claudification] WebSocket error:', err);
  };

  return ws;
}

// ── Health Check ────────────────────────────────────────────

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${MUSE_API}/api/conversations`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
