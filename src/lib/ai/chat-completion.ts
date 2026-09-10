import { AI_CONFIG, AIMessage, AIToolCall, ChatOptions } from './config';
import { contentText, mergeToolCalls, mistralChunkSchema, requestMistralStream } from './mistral-protocol';
import { readSSEData } from './sse';
import { executeAITool } from './tools';

interface CompletionRound { content: string; calls: Map<number, AIToolCall>; finish: string | null }

async function* readRound(body: ReadableStream<Uint8Array>, round: CompletionRound) {
  for await (const data of readSSEData(body)) {
    if (data === '[DONE]') break;
    const choice = mistralChunkSchema.parse(JSON.parse(data)).choices[0];
    if (!choice) continue;
    const text = contentText(choice.delta.content);
    round.content += text;
    mergeToolCalls(round.calls, choice.delta.tool_calls || []);
    if (choice.finish_reason) round.finish = choice.finish_reason;
    if (text) yield text;
  }
  if (!round.finish) throw new Error('Mistral stream ended before completion.');
  if (round.finish === 'length') throw new Error('Mistral response exceeded token limit.');
}

async function appendToolResults(messages: AIMessage[], round: CompletionRound, signal?: AbortSignal) {
  const calls = [...round.calls.values()];
  if (calls.some((call) => !call.id || !call.function.name)) throw new Error('Incomplete tool call.');
  messages.push({ role: 'assistant', content: round.content || null, tool_calls: calls });
  const results = await Promise.all(calls.map(async (call): Promise<AIMessage> => ({
    role: 'tool', name: call.function.name, tool_call_id: call.id,
    content: await executeAITool(call.function.name, call.function.arguments, signal),
  })));
  messages.push(...results);
}

/** One streamed request for ordinary chat; bounded successive tool rounds when needed. */
export async function* generateChatCompletion(options: ChatOptions): AsyncGenerator<string> {
  const timeout = AbortSignal.timeout(AI_CONFIG.REQUEST_TIMEOUT_MS);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  const messages: AIMessage[] = options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : [];
  messages.push(...options.messages);
  for (let step = 0; step <= AI_CONFIG.MAX_TOOL_ROUNDS; step++) {
    signal.throwIfAborted();
    const toolsEnabled = options.enableTools !== false && step < AI_CONFIG.MAX_TOOL_ROUNDS;
    const body = await requestMistralStream({ ...options, signal }, messages, toolsEnabled);
    const round: CompletionRound = { content: '', calls: new Map(), finish: null };
    yield* readRound(body, round);
    if (round.calls.size === 0) {
      if (!round.content.trim()) throw new Error('Mistral returned an empty response.');
      return;
    }
    if (!toolsEnabled) throw new Error('Mistral exceeded tool round limit.');
    await appendToolResults(messages, round, signal);
    if (round.content.trim()) yield '\n\n';
  }
}
