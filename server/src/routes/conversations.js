import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * GET /api/conversations
 * List all conversations for the authenticated user (newest updated first).
 */
router.get('/', async (req, res, next) => {
  try {
    const { data: conversations, error } = await req.supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({ conversations: conversations || [] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/conversations/:id
 * Retrieve a single conversation and its full chronological message history.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify conversation ownership
    const { data: conversation, error: convError } = await req.supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Conversation not found or access denied.',
      });
    }

    // Retrieve messages in chronological order
    const { data: messages, error: msgError } = await req.supabase
      .from('messages')
      .select('id, conversation_id, role, content, created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw msgError;
    }

    return res.json({
      conversation,
      messages: messages || [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/conversations/:id
 * Delete a conversation (cascades to all messages via foreign key).
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
