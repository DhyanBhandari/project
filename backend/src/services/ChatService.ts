import pool from '../config/database';
import { EmbeddingService } from './EmbeddingService';

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  message_type: 'user' | 'assistant' | 'system';
  content_embedding?: number[];
  token_count?: number;
  model_used?: string;
  created_at: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ChatService {
  static async createConversation(userId: string, title?: string): Promise<Conversation> {
    try {
      const result = await pool.query(`
        INSERT INTO conversations (user_id, title)
        VALUES ($1, $2)
        RETURNING *
      `, [userId, title]);

      return result.rows[0];
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  static async getUserConversations(userId: string, limit = 20, offset = 0): Promise<Conversation[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM conversations
        WHERE user_id = $1 AND is_archived = false
        ORDER BY updated_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  static async addMessage(
    conversationId: string,
    userId: string,
    content: string,
    messageType: 'user' | 'assistant' | 'system' = 'user',
    modelUsed?: string
  ): Promise<Message> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Generate embedding for the message
      const embedding = await EmbeddingService.generateEmbedding(content);

      // Estimate token count (rough approximation: 1 token ≈ 4 characters)
      const tokenCount = Math.ceil(content.length / 4);

      // Insert message with embedding
      const messageResult = await client.query(`
        INSERT INTO messages (
          conversation_id, user_id, content, message_type,
          content_embedding, token_count, model_used
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        conversationId,
        userId,
        content,
        messageType,
        JSON.stringify(embedding), // Convert to JSON for storage
        tokenCount,
        modelUsed
      ]);

      // Update conversation timestamp
      await client.query(`
        UPDATE conversations
        SET updated_at = NOW()
        WHERE id = $1
      `, [conversationId]);

      await client.query('COMMIT');
      return messageResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error adding message:', error);
      throw new Error('Failed to add message');
    } finally {
      client.release();
    }
  }

  static async getConversationMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    try {
      const result = await pool.query(`
        SELECT id, conversation_id, user_id, content, message_type,
               token_count, model_used, created_at
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        LIMIT $2 OFFSET $3
      `, [conversationId, limit, offset]);

      return result.rows;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }
}
