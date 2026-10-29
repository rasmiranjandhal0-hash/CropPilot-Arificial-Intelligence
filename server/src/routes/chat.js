import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { generateGeminiReply } from '../gemini.js';

const router = Router();
router.use(requireAuth);

const chatRequestSchema = z.object({
  conversationId: z.string().uuid().optional().nullable(),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(20000, 'Message cannot exceed 20,000 characters'),
});

/**
 * POST /api/chat
 * Send a message, get Gemini response, and persist both to Supabase.
 */
router.post('/', async (req, res, next) => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'ValidationError',
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { conversationId, message } = parseResult.data;
    let targetConvId = conversationId;
    let activeConversation = null;
    let history = [];

    if (targetConvId) {
      // 1. Existing conversation: verify ownership
      const { data: existingConv, error: convError } = await req.supabase
        .from('conversations')
        .select('id, title, created_at, updated_at')
        .eq('id', targetConvId)
        .eq('user_id', req.user.id)
        .single();

      if (convError || !existingConv) {
        return res.status(404).json({
          error: 'NotFound',
          message: 'Conversation not found or access denied.',
        });
      }

      activeConversation = existingConv;

      // Fetch last 20 messages for context
      const { data: recentMsgs, error: historyError } = await req.supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', targetConvId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (historyError) {
        throw historyError;
      }

      // Reverse so messages are in chronological order for Gemini context
      history = (recentMsgs || []).reverse();
    } else {
      // 2. New conversation: auto-set title from first 50 chars of first message
      const title = message.trim().slice(0, 50) || 'New Chat';

      const { data: newConv, error: createError } = await req.supabase
        .from('conversations')
        .insert({
          user_id: req.user.id,
          title,
        })
        .select('id, title, created_at, updated_at')
        .single();

      if (createError || !newConv) {
        throw createError || new Error('Failed to create new conversation');
      }

      activeConversation = newConv;
      targetConvId = newConv.id;
      history = [];
    }

    // 3. Save user message to database
    const { data: userMessageRecord, error: userMsgError } = await req.supabase
      .from('messages')
      .insert({
        conversation_id: targetConvId,
        user_id: req.user.id,
        role: 'user',
        content: message,
      })
      .select('id, conversation_id, role, content, created_at')
      .single();

    if (userMsgError || !userMessageRecord) {
      throw userMsgError || new Error('Failed to save user message');
    }

    // 4. Generate Gemini assistant reply
    let assistantReplyText;
    try {
      assistantReplyText = await generateGeminiReply(history, message);
    } catch (geminiErr) {
      console.error('Gemini generation error:', geminiErr);
      return res.status(502).json({
        error: 'GeminiServiceError',
        message: geminiErr.message || 'Failed to generate response from Gemini. Please check API key.',
      });
    }

    // 5. Save assistant reply to database
    const { data: assistantMessageRecord, error: assistantMsgError } = await req.supabase
      .from('messages')
      .insert({
        conversation_id: targetConvId,
        user_id: req.user.id,
        role: 'assistant',
        content: assistantReplyText,
      })
      .select('id, conversation_id, role, content, created_at')
      .single();

    if (assistantMsgError || !assistantMessageRecord) {
      throw assistantMsgError || new Error('Failed to save assistant message');
    }

    return res.json({
      conversation: activeConversation,
      userMessage: userMessageRecord,
      assistantMessage: assistantMessageRecord,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
