/**
 * Global TypeScript declarations for the Meta (Facebook) Pixel SDK.
 * Pixel ID: 1578638136531199 — www.matrixintertrade.com
 */

type FbqEventName =
  | "PageView"
  | "Lead"
  | "Contact"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "Purchase"
  | "CompleteRegistration"
  | "SubmitApplication"
  | (string & Record<never, never>); // allow custom strings while keeping autocomplete

type FbqParams = Record<string, string | number | boolean | undefined>;

interface Fbq {
  (command: "init", pixelId: string): void;
  (command: "track", event: FbqEventName, params?: FbqParams): void;
  (command: "trackCustom", event: string, params?: FbqParams): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: Fbq;
}

declare global {
  interface Window {
    fbq: Fbq;
    _fbq?: Fbq;
  }
}

export {};
