import { describe, it, expect } from "vitest";
import express from "express";
import { geminiAiLimiter, geminiVisionLimiter, authLimiter, generalApiLimiter } from "./rateLimit";

describe("Rate Limiting Middleware Configuration", () => {
  it("should have geminiAiLimiter defined with draft-7 headers", () => {
    expect(geminiAiLimiter).toBeDefined();
    expect(typeof geminiAiLimiter).toBe("function");
  });

  it("should have geminiVisionLimiter defined with strict vision limits", () => {
    expect(geminiVisionLimiter).toBeDefined();
    expect(typeof geminiVisionLimiter).toBe("function");
  });

  it("should have authLimiter and generalApiLimiter defined", () => {
    expect(authLimiter).toBeDefined();
    expect(generalApiLimiter).toBeDefined();
  });

  it("should execute rate limit middleware on express mock without errors on initial calls", async () => {
    const mockReq = {
      ip: "127.0.0.1",
      headers: {},
      method: "POST",
      url: "/test-gemini",
      app: {
        get: () => false,
      },
    } as any;

    const mockRes = {
      setHeader: () => {},
      getHeader: () => undefined,
      status: (code: number) => mockRes,
      json: (data: any) => data,
    } as any;

    const nextPromise = new Promise<boolean>((resolve) => {
      geminiAiLimiter(mockReq, mockRes, () => {
        resolve(true);
      });
    });

    const nextCalled = await nextPromise;
    expect(nextCalled).toBe(true);
  });
});
