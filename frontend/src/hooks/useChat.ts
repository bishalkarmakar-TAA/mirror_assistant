import { useState } from 'react';
import { ChatMessage, ChatResponse } from '@/types/chatbot';
import { ChatbotService } from '@/services/chatbot.service';
import { useAppContext } from '@/context/app-context';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { professionalId } = useAppContext();

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response: ChatResponse = await ChatbotService.sendMessage({
        message: content,
        professional_id: professionalId,
        history: messages,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      return response;
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    setMessages,
  };
};
