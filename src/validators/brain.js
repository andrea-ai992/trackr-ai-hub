// src/validators/brain.js
import { z } from "zod";

export const BrainQuerySchema = z.object({
  query: z.string().min(1, "Query is required").max(500, "Query too long (max 500 chars)"),
  context: z.string().optional(),
  sources: z.array(z.string()).optional().default([]),
  maxTokens: z.number().int().positive().max(4000).optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  model: z.enum(["gpt-4", "gpt-4-turbo", "claude-3-opus", "claude-3-sonnet"]).optional().default("gpt-4-turbo"),
  focus: z.enum(["analysis", "creative", "technical", "business"]).optional().default("analysis"),
  strict: z.boolean().optional().default(false),
  timeout: z.number().int().positive().max(30000).optional().default(10000),
});

export const BrainResponseSchema = z.object({
  id: z.string().uuid(),
  query: z.string(),
  response: z.string().min(1, "Response cannot be empty"),
  sources: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    relevance: z.number().min(0).max(100),
  })).optional(),
  model: z.string(),
  tokensUsed: z.number().int().positive(),
  durationMs: z.number().int().positive(),
  timestamp: z.string().datetime(),
  cached: z.boolean().optional().default(false),
});

export const validateBrainQuery = (data) => {
  try {
    return BrainQuerySchema.parse(data);
  } catch (error) {
    throw new Error(`Validation failed: ${error.errors[0].message}`);
  }
};

export const validateBrainResponse = (data) => {
  try {
    return BrainResponseSchema.parse(data);
  } catch (error) {
    throw new Error(`Response validation failed: ${error.errors[0].message}`);
  }
};