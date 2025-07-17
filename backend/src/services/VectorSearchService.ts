import pool from '../config/database';
import { EmbeddingService } from './EmbeddingService';

export interface SimilarMessage {
  id: string;
  content: string;
  similarity: number;
  conversation_id: string;
  created_at: Date;
}

export class VectorSearchService {
  static async findSimilarMessages(
    query: string,
    userId: string,
    limit = 10,
    threshold = 0.7
  ): Promise<SimilarMessage[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);

      const result = await pool.query(`
        SELECT
          m.id,
          m.content,
          m.conversation_id,
          m.created_at,
          (1 - (m.content_embedding <=> $1::vector)) as similarity
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE
          c.user_id = $2
          AND m.content_embedding IS NOT NULL
          AND (1 - (m.content_embedding <=> $1::vector)) > $3
        ORDER BY m.content_embedding <=> $1::vector
        LIMIT $4
      `, [JSON.stringify(queryEmbedding), userId, threshold, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error finding similar messages:', error);
      throw new Error('Failed to find similar messages');
    }
  }

  static async semanticSearch(
    query: string,
    userId: string,
    conversationId?: string,
    limit = 5
  ): Promise<SimilarMessage[]> {
    try {
      const queryEmbedding = await EmbeddingService.generateEmbedding(query);

      const whereClause = conversationId
        ? 'c.user_id = $2 AND m.conversation_id = $5'
        : 'c.user_id = $2';

      const params = conversationId
        ? [JSON.stringify(queryEmbedding), userId, 0.5, limit, conversationId]
        : [JSON.stringify(queryEmbedding), userId, 0.5, limit];

      const result = await pool.query(`
        SELECT
          m.id,
          m.content,
          m.conversation_id,
          m.created_at,
          (1 - (m.content_embedding <=> $1::vector)) as similarity
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE
          ${whereClause}
          AND m.content_embedding IS NOT NULL
          AND (1 - (m.content_embedding <=> $1::vector)) > $3
        ORDER BY m.content_embedding <=> $1::vector
        LIMIT $4
      `, params);

      return result.rows;
    } catch (error) {
      console.error('Error in semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }
}
