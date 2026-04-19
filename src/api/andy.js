// src/api/andy.js
import axios from 'axios';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = new SupabaseClient(supabaseUrl, supabaseKey);

const DEFAULT_TIMEOUT = 10000;

const ChatSchema = z.object({
  query: z.string().min(1, "Query is required").max(10000, "Query too long")
});

const andy = {
  async refreshToken(timeout = DEFAULT_TIMEOUT) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data, error } = await supabase.auth.refreshSession(controller.signal);
      clearTimeout(timeoutId);

      if (error) {
        throw new Error(`Failed to refresh token: ${error.message}`);
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Token refresh timed out after ${timeout}ms`);
      }
      throw error;
    }
  },

  async getAccessToken(timeout = DEFAULT_TIMEOUT) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      clearTimeout(timeoutId);

      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`);
      }

      if (!sessionData?.session) {
        throw new Error('No session found');
      }

      const { data, error } = await supabase.auth.api.getUser(
        sessionData.session.user.id,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (error) {
        throw new Error(`Failed to get access token: ${error.message}`);
      }
      return data.access_token;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Access token retrieval timed out after ${timeout}ms`);
      }
      throw error;
    }
  },

  async fetchWithAuth(url, options = {}) {
    try {
      const accessToken = await this.getAccessToken();
      const headers = { Authorization: `Bearer ${accessToken}` };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT);

      const response = await axios(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      return response.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${options.timeout || DEFAULT_TIMEOUT}ms`);
      }
      if (error.response) {
        throw new Error(`Request failed with status ${error.response.status}: ${error.response.statusText}`);
      }
      throw error;
    }
  },

  async chat(query, timeout = DEFAULT_TIMEOUT) {
    const validatedQuery = ChatSchema.parse({ query });
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await axios.post('/chat', { query: validatedQuery.query }, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      return response.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Chat request timed out after ${timeout}ms`);
      }
      if (error.response) {
        throw new Error(`Chat request failed with status ${error.response.status}: ${error.response.statusText}`);
      }
      throw error;
    }
  }
};

export default andy;