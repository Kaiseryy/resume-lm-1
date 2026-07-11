import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getTaskModel, withTaskModel } from "./task-models";
import type { AIConfig } from "@/lib/ai-models";

describe("task model routing", () => {
  it("routes full resume tailoring by plan", () => {
    assert.equal(getTaskModel("jobTailoring", false), "deepseek-chat");
    assert.equal(getTaskModel("jobTailoring", true), "deepseek-reasoner");
  });

  it("routes extraction and scoring to V4 Flash", () => {
    assert.equal(getTaskModel("structuredExtraction", false), "deepseek-chat");
    assert.equal(getTaskModel("structuredExtraction", true), "deepseek-chat");
    assert.equal(getTaskModel("resumeScoring", false), "deepseek-chat");
    assert.equal(getTaskModel("resumeScoring", true), "deepseek-chat");
  });

  it("routes bullet generation and cover letters to V4 Flash", () => {
    assert.equal(getTaskModel("contentGeneration", false), "deepseek-chat");
    assert.equal(getTaskModel("contentGeneration", true), "deepseek-chat");
    assert.equal(getTaskModel("coverLetter", false), "deepseek-chat");
    assert.equal(getTaskModel("coverLetter", true), "deepseek-chat");
  });

  it("routes free chat assistant to V4 Flash", () => {
    assert.equal(getTaskModel("chatAssistant", false), "deepseek-chat");
    assert.equal(getTaskModel("chatAssistant", true), "deepseek-reasoner");
  });

  it("preserves API keys and custom prompts while replacing the model", () => {
    const config: AIConfig = {
      model: "deepseek-reasoner",
      apiKeys: [
        { service: "deepseek", key: "user-deepseek", addedAt: "2026-05-10" },
      ],
      customPrompts: {
        textAnalyzer: "Extract carefully.",
      },
    };

    const resolved = withTaskModel({
      task: "structuredExtraction",
      isPro: false,
      config,
    });

    assert.equal(resolved.model, "deepseek-chat");
    assert.deepEqual(resolved.apiKeys, config.apiKeys);
    assert.deepEqual(resolved.customPrompts, config.customPrompts);
  });

  it("can intentionally preserve a selected model for future override paths", () => {
    const resolved = withTaskModel({
      task: "chatAssistant",
      isPro: true,
      config: {
        model: "deepseek-reasoner",
        apiKeys: [],
      },
      respectSelectedModel: true,
    });

    assert.equal(resolved.model, "deepseek-reasoner");
  });
});
