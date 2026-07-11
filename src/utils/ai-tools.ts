import { createDeepSeek } from '@ai-sdk/deepseek';
import { LanguageModelV1 } from 'ai';
import { type AIConfig } from '@/lib/ai-models';
import {
  resolveAIRequest,
  type ResolvedAIRequest,
} from '@/lib/ai/access-control';

// Re-export types for backward compatibility
export type { ApiKey, AIConfig } from '@/lib/ai-models';

export function createAIClientFromResolvedRequest(
  resolved: ResolvedAIRequest,
  useThinking?: boolean
) {
  void useThinking;

  switch (resolved.providerId) {
    case 'deepseek':
      return createDeepSeek({ apiKey: resolved.apiKey })(resolved.modelId) as LanguageModelV1;

    default:
      throw new Error(`Unsupported provider: ${resolved.providerId}`);
  }
}

export function resolveAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  if (!config) {
    throw new Error('AI model is required');
  }

  const resolved = resolveAIRequest({
    requestedModel: config.model,
    apiKeys: config.apiKeys ?? [],
    isPro: Boolean(isPro),
  });

  return {
    model: createAIClientFromResolvedRequest(resolved, useThinking),
    resolved,
  };
}

/**
 * Initializes an AI client based on the centralized access-control decision.
 */
export function initializeAIClient(config?: AIConfig, isPro?: boolean, useThinking?: boolean) {
  return resolveAIClient(config, isPro, useThinking).model;
}
