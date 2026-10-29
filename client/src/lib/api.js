import { supabase } from './supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please log in.');
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Handle API responses and extract JSON or descriptive error messages.
 */
async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${res.status}`;
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  /**
   * Fetch all conversations for the authenticated user
   */
  async getConversations() {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'GET',
      headers,
    });
    return handleResponse(res);
  },

  /**
   * Fetch a single conversation and its full message history
   */
  async getConversation(id) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(res);
  },

  /**
   * Send a chat message (creates conversation if conversationId is undefined/null)
   */
  async sendChatMessage(message, conversationId = null) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        conversationId: conversationId || undefined,
      }),
    });
    return handleResponse(res);
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(id) {
    const headers = await getAuthHeader();
    const res = await fetch(`${API_BASE_URL}/api/conversations/${id}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(res);
  },
};
