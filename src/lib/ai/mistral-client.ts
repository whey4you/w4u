import { ChatOptions } from './config';
import { generateChatCompletion } from './chat-completion';

/**
 * Gửi yêu cầu Chat Completion tới Mistral AI (sử dụng engine generateChatCompletion hỗ trợ stream và tool rounds)
 */
export async function callMistralChat(options: ChatOptions): Promise<string> {
  let content = '';
  for await (const chunk of generateChatCompletion(options)) {
    content += chunk;
  }
  return content;
}
