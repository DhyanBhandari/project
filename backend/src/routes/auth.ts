import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;
