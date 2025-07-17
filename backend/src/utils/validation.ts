import Joi from 'joi';

export const messageSchema = Joi.object({
  content: Joi.string().min(1).max(4000).required(),
  messageType: Joi.string().valid('user', 'assistant', 'system').default('user'),
  modelUsed: Joi.string().optional(),
});
