/**
 * Centralized AI Model Management
 * This file contains all AI model and provider configurations used throughout the application
 */

import { ServiceName } from './types'

// ========================
// Type Definitions
// ========================

export interface AIProvider {
  id: ServiceName
  name: string
  apiLink: string
  logo?: string
  envKey: string
  sdkInitializer: string
  unstable?: boolean
}

export interface AIModel {
  id: string
  name: string
  provider: ServiceName
  features: {
    isFree?: boolean
    isRecommended?: boolean
    isUnstable?: boolean
    maxTokens?: number
    supportsVision?: boolean
    supportsTools?: boolean
    isPro?: boolean
  }
  availability: {
    requiresApiKey: boolean
    requiresPro: boolean
  }
}

export interface ApiKey {
  service: ServiceName
  key: string
  addedAt: string
}

export interface AIConfig {
  model: string
  apiKeys: ApiKey[]
  customPrompts?: import('./types').CustomPrompts
}

export interface GroupedModels {
  provider: ServiceName
  name: string
  models: AIModel[]
}

// ========================
// Provider Configurations
// ========================

export const PROVIDERS: Partial<Record<ServiceName, AIProvider>> = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    apiLink: 'https://platform.deepseek.com/api_keys',
    logo: '/logos/deepseek-logo-full.png',
    envKey: 'DEEPSEEK_API_KEY',
    sdkInitializer: 'deepseek',
    unstable: false
  },
}

// ========================
// Model Definitions
// ========================

export const AI_MODELS: AIModel[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek V4 Flash',
    provider: 'deepseek',
    features: {
      isRecommended: true,
      isUnstable: false,
      maxTokens: 65536,
      supportsVision: false,
      supportsTools: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: false
    }
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek V4 Pro',
    provider: 'deepseek',
    features: {
      isRecommended: false,
      isUnstable: false,
      maxTokens: 65536,
      supportsVision: false,
      supportsTools: true,
      isPro: true
    },
    availability: {
      requiresApiKey: true,
      requiresPro: true
    }
  },
]

// ========================
// Legacy ID Aliases
// ========================

// Map legacy or shorthand model IDs to current canonical IDs
const MODEL_ALIASES: Record<string, string> = {
  // All legacy model IDs → deepseek-chat (V4 Flash)
  'gpt-5': 'deepseek-chat',
  'gpt-5.5': 'deepseek-chat',
  'gpt-5.5-pro': 'deepseek-chat',
  'gpt-5.4': 'deepseek-chat',
  'gpt-5.4-pro': 'deepseek-chat',
  'gpt-5.4-mini': 'deepseek-chat',
  'gpt-5.4-nano': 'deepseek-chat',
  'gpt-5.1-chat': 'deepseek-chat',
  'gpt-5-mini-2025-08-07': 'deepseek-chat',
  'gpt-5-mini': 'deepseek-chat',
  'gpt-5-nano': 'deepseek-chat',
  // Claude legacy → deepseek-chat
  'claude-4-sonnet': 'deepseek-chat',
  'claude-3-sonnet-20240229': 'deepseek-chat',
  'claude-sonnet-4-20250514': 'deepseek-chat',
  'claude-sonnet-4.5': 'deepseek-chat',
  'claude-sonnet-4-5-20250929': 'deepseek-chat',
  'claude-sonnet-4-6': 'deepseek-chat',
  'claude-haiku-4-5-20251001': 'deepseek-chat',
  'claude-opus-4.5': 'deepseek-chat',
  'claude-opus-4-5-20251101': 'deepseek-chat',
  'claude-opus-4-7': 'deepseek-chat',
  // OpenRouter models → deepseek-chat
  'google/gemini-3-pro-preview': 'deepseek-chat',
  'openai/gpt-oss-120b': 'deepseek-chat',
  'openai/gpt-oss-20b': 'deepseek-chat',
  'z-ai/glm-4.6:exacto': 'deepseek-chat',
  'deepseek/deepseek-v3.2': 'deepseek-chat',
  'deepseek/deepseek-v3.2:nitro': 'deepseek-chat',
}

// ========================
// Default Model Configuration
// ========================

export const DEFAULT_MODELS = {
  PRO_USER: 'deepseek-chat',
  FREE_USER: 'deepseek-chat'
} as const

// ========================
// Model Designations for Different Use Cases
// ========================

/**
 * Designated models for specific use cases throughout the application.
 * Change these to update which models are used globally.
 */
export const MODEL_DESIGNATIONS = {
  FAST_CHEAP: 'deepseek-chat',
  FAST_CHEAP_FREE: 'deepseek-chat',
  STRUCTURED_EXTRACTION: 'deepseek-chat',
  RESUME_SCORING: 'deepseek-chat',
  SIMPLE_REWRITE: 'deepseek-chat',
  CONTENT_GENERATION: 'deepseek-chat',
  COVER_LETTER: 'deepseek-chat',
  JOB_TAILORING_FREE: 'deepseek-chat',
  JOB_TAILORING_PRO: 'deepseek-chat',
  CHAT_ASSISTANT_FREE: 'deepseek-chat',
  CHAT_ASSISTANT_PRO: 'deepseek-chat',
  FRONTIER: 'deepseek-chat',
  FRONTIER_ALT: 'deepseek-chat',
  BALANCED: 'deepseek-chat',
  VISION: 'deepseek-chat',
  DEFAULT_PRO: 'deepseek-chat',
  DEFAULT_FREE: 'deepseek-chat'
} as const

// Type for model designations
export type ModelDesignation = keyof typeof MODEL_DESIGNATIONS

// ========================
// Utility Functions
// ========================

export function getProvidersArray(): AIProvider[] {
  return Object.values(PROVIDERS)
}

export function getModelById(id: string): AIModel | undefined {
  const resolvedId = MODEL_ALIASES[id] || id
  return AI_MODELS.find(model => model.id === resolvedId)
}

export function getProviderById(id: ServiceName): AIProvider | undefined {
  return PROVIDERS[id]
}

export function getModelsByProvider(provider: ServiceName): AIModel[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

export function isModelAvailable(
  modelId: string,
  isPro: boolean,
  apiKeys: ApiKey[]
): boolean {
  modelId = MODEL_ALIASES[modelId] || modelId
  if (isPro) return true

  const model = getModelById(modelId)
  if (!model) return false

  if (model.features.isFree) return true

  return apiKeys.some(key => key.service === model.provider)
}

export function getDefaultModel(isPro: boolean): string {
  return isPro ? DEFAULT_MODELS.PRO_USER : DEFAULT_MODELS.FREE_USER
}

export function getModelProvider(modelId: string): AIProvider | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined
  return getProviderById(model.provider)
}

export function groupModelsByProvider(): GroupedModels[] {
  const providerOrder: ServiceName[] = ['deepseek']
  const grouped = new Map<ServiceName, AIModel[]>()

  AI_MODELS.forEach(model => {
    if (!grouped.has(model.provider)) {
      grouped.set(model.provider, [])
    }
    grouped.get(model.provider)!.push(model)
  })

  return providerOrder
    .map(providerId => {
      const provider = getProviderById(providerId)
      if (!provider) return null

      return {
        provider: providerId,
        name: provider.name,
        models: grouped.get(providerId) || []
      }
    })
    .filter((group): group is GroupedModels => group !== null && group.models.length > 0)
}

export function getSelectableModels(isPro: boolean, apiKeys: ApiKey[]): AIModel[] {
  return AI_MODELS.filter(model => isModelAvailable(model.id, isPro, apiKeys))
}

export function getModelSDKConfig(modelId: string): { provider: AIProvider; modelId: string } | undefined {
  const model = getModelById(modelId)
  if (!model) return undefined

  const provider = getProviderById(model.provider)
  if (!provider) return undefined

  return { provider, modelId }
}
