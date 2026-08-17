import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

  // Load conversation list
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setConversations(data as ChatConversation[]);
    }
    setLoadingConversations(false);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (conversationId: string) => {
      setLoadingMessages(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
      setLoadingMessages(false);
    },
    []
  );

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

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !text.trim() || sending) return;

      setSending(true);

      let convId = activeConversationId;

      // Create conversation if none active
      if (!convId) {
        const title = generateTitle(text);
        const { data: conv, error } = await supabase
          .from('chat_conversations')
          .insert({ user_id: user.id, title })
          .select('id, title, created_at, updated_at')
          .single();

        if (error || !conv) {
          setSending(false);
          return;
        }

        convId = (conv as ChatConversation).id;
        setActiveConversationId(convId);
        setConversations((prev) => [conv as ChatConversation, ...prev]);
      }

      // Insert user message
      const { data: userMsg, error: userErr } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: convId,
          user_id: user.id,
          role: 'user',
          content: text,
        })
        .select('id, role, content, created_at')
        .single();

      if (userErr || !userMsg) {
        setSending(false);
        return;
      }

      setMessages((prev) => [...prev, userMsg as ChatMessage]);

      // Generate AI response
      const aiContent = generateResponse(text);

      // Stream the response visually
      streamResponse(aiContent, async () => {
        const { data: aiMsg, error: aiErr } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: convId,
            user_id: user.id,
            role: 'assistant',
            content: aiContent,
          })
          .select('id, role, content, created_at')
          .single();

        if (!aiErr && aiMsg) {
          setMessages((prev) => [...prev, aiMsg as ChatMessage]);
        }

        // Update conversation's updated_at
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId);

        setSending(false);
      });
    },
    [user, activeConversationId, sending, streamResponse]
  );

  // New conversation
  const newConversation = useCallback(() => {
    if (streamTimer.current) clearInterval(streamTimer.current);
    setActiveConversationId(null);
    setMessages([]);
    setStreamingText('');
    setSending(false);
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!user) return;
      await supabase.from('chat_conversations').delete().eq('id', conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        newConversation();
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
