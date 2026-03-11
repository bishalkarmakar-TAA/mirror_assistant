import { API_BASE_URL } from "@/lib/constants";
import { ChatRequest, ChatResponse } from "@/types/chatbot";

export class ChatbotService {
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to send message to chatbot');
    }

    return response.json();
  }
}
