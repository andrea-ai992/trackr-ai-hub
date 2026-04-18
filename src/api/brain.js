// src/api/trading-expert.js
import { z } from 'zod';

const TradingSignalSchema = z.object({
  symbol: z.string().min(1, "Le symbole est requis"),
  indicators: z.object({
    rsi: z.object({
      value: z.number().min(0).max(100),
      period: z.number().int().positive().default(14),
    }).optional(),
    macd: z.object({
      fast: z.number().int().positive().default(12),
      slow: z.number().int().positive().default(26),
      signal: z.number().int().positive().default(9),
    }).optional(),
    sma: z.object({
      value: z.number().min(0),
      period: z.number().int().positive().default(20),
    }).optional(),
  }),
});

export const validateTradingSignal = (signalData) => {
  return TradingSignalSchema.parse(signalData);
};

export const fetchTradingSignal = async (signalData) => {
  try {
    const validatedData = validateTradingSignal(signalData);

    const response = await fetch('/api/trading-expert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error.name === 'AbortError') {
      throw new Error('La requête a été annulée (timeout après 10 secondes)');
    } else if (error instanceof z.ZodError) {
      throw new Error(error.errors.map(err => err.message).join(', '));
    }
    throw error;
  }
};