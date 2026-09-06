import { useCallback, useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';
import { generateResponse, generateTitle } from '@/lib/ai-engine';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load conversation list from Go backend
  const loadConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiRequest('/chat/conversations');
      if (data) {
        setConversations(data as ChatConversation[]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for a conversation from Go backend
  const loadMessages = useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const data = await apiRequest(`/chat/conversations/${conversationId}/messages`);
      if (data) {
        setMessages(data as ChatMessage[]);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Stream text character-by-character
  const streamResponse = useCallback((fullText: string, onComplete: () => void) => {
    setStreamingText('');
    let i = 0;
    const chars = fullText.split('');
    if (streamTimer.current) clearInterval(streamTimer.current);
    streamTimer.current = setInterval(() => {
      i += Math.max(1, Math.floor(chars.length / 120));
      setStreamingText(fullText.slice(0, i));
      if (i >= chars.length) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        setStreamingText('');
        onComplete();
      }
    }, 16);
  }, []);

  // Send a message via Go backend
  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !text.trim() || sending) return;

      setSending(true);
      let convId = activeConversationId;

      try {
        // Create conversation if none active
        if (!convId) {
          const title = generateTitle(text);
          const newConv = await apiRequest('/chat/conversations', {
            method: 'POST',
            body: JSON.stringify({ title }),
          });

          if (!newConv || !newConv.id) {
            setSending(false);
            return;
          }

          convId = newConv.id;
          setActiveConversationId(convId);
          setConversations((prev) => [newConv as ChatConversation, ...prev]);
        }

        // Post user message to Go backend
        const userMsg = await apiRequest(`/chat/conversations/${convId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ role: 'user', content: text }),
        });

        if (userMsg) {
          setMessages((prev) => [...prev, userMsg as ChatMessage]);
        }

        // Generate AI response
        const aiContent = generateResponse(text);

        // Stream the response visually, then save assistant message to Go backend
        streamResponse(aiContent, async () => {
          try {
            const aiMsg = await apiRequest(`/chat/conversations/${convId}/messages`, {
              method: 'POST',
              body: JSON.stringify({ role: 'assistant', content: aiContent }),
            });

            if (aiMsg) {
              setMessages((prev) => [...prev, aiMsg as ChatMessage]);
            }

            // Refresh conversation list order or updated timestamp if needed
            loadConversations();
          } catch (err) {
            console.error('Failed to save AI message:', err);
          } finally {
            setSending(false);
          }
        });
      } catch (err) {
        console.error('Failed to send message:', err);
        setSending(false);
      }
    },
    [user, activeConversationId, sending, streamResponse, loadConversations]
  );

  // New conversation
  const newConversation = useCallback(() => {
    if (streamTimer.current) clearInterval(streamTimer.current);
    setActiveConversationId(null);
    setMessages([]);
    setStreamingText('');
    setSending(false);
  }, []);

  // Delete conversation via Go backend
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      try {
        await apiRequest(`/chat/conversations/${conversationId}`, {
          method: 'DELETE',
        });
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
        if (activeConversationId === conversationId) {
          newConversation();
        }
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    },
    [user, activeConversationId, newConversation]
  );

  useEffect(() => {
    return () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    };
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    streamingText,
    setActiveConversationId,
    sendMessage,
    newConversation,
    deleteConversation,
  };
}