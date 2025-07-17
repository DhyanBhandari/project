import express from 'express';
import { VectorSearchService } from '../services/VectorSearchService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Semantic search in messages
router.post('/messages', authenticateToken, async (req, res) => {
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
