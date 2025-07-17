import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { apiLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import searchRoutes from './routes/search';

const app = express();

app.use(cors());
app.use(json());
app.use(apiLimiter);

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);
app.use('/search', searchRoutes);

export default app;
