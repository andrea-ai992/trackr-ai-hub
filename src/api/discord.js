// src/api/discord.js
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_BOT_TOKEN = import.meta.env.VITE_DISCORD_BOT_TOKEN;

export const getDiscordMessages = async (channelId, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${DISCORD_API_URL}/channels/${channelId}/messages`, {
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let result = '';
    let isDone = false;

    while (!isDone) {
      const { done, value } = await reader.read();
      isDone = done;
      if (value) result += value;
    }

    try {
      return JSON.parse(result);
    } catch (parseError) {
      console.error('Failed to parse Discord messages:', parseError);
      return [];
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Discord API request timed out');
    } else {
      console.error('Error fetching Discord messages:', error);
    }
    return [];
  }
};

export const sendDiscordMessage = async (channelId, content, timeoutMs = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${DISCORD_API_URL}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Discord message send request timed out');
    } else {
      console.error('Error sending Discord message:', error);
    }
    return null;
  }
};