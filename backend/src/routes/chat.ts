import express from 'express';
import { ChatService } from '../services/ChatService';
import { VectorSearchService } from '../services/VectorSearchService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user!.uid;

    const conversation = await ChatService.createConversation(userId, title);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const conversations = await ChatService.getUserConversations(userId, limit, offset);
    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add message to conversation
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content, messageType = 'user', modelUsed } = req.body;
    const userId = req.user!.uid;

    const message = await ChatService.addMessage(
      conversationId,
      userId,
      content,
      messageType,
      modelUsed
    );

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await ChatService.getConversationMessages(conversationId, limit, offset);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Semantic search in messages
router.post('/search', authenticateToken, async (req, res) => {
  try {
    const { query, conversationId, limit = 5 } = req.body;
    const userId = req.user!.uid;

    const results = await VectorSearchService.semanticSearch(
      query,
      userId,
      conversationId,
      limit
    );

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
