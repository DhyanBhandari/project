import pool from '../config/database';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  provider: string;
  created_at: Date;
  updated_at: Date;
}

export class AuthService {
  static async syncUser(decodedToken: DecodedIdToken): Promise<User> {
    const { uid, email, name, picture, firebase } = decodedToken;

    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [uid]
      );

      if (existingUser.rows.length > 0) {
        // Update last login and any changed info
        const updatedUser = await pool.query(`
          UPDATE users
          SET
            display_name = COALESCE($2, display_name),
            photo_url = COALESCE($3, photo_url),
            last_login = NOW(),
            updated_at = NOW()
          WHERE firebase_uid = $1
          RETURNING *
        `, [uid, name, picture]);

        return updatedUser.rows[0];
      } else {
        // Create new user
        const newUser = await pool.query(`
          INSERT INTO users (firebase_uid, email, display_name, photo_url, provider)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [uid, email, name, picture, firebase.sign_in_provider]);

        return newUser.rows[0];
      }
    } catch (error) {
      console.error('Error syncing user:', error);
      throw new Error('Failed to sync user data');
    }
  }

  static async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }
}
