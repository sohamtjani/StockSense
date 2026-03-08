export class TTLCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const found = this.store.get(key);
    if (!found) return null;
    if (Date.now() > found.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return found.value;
  }

  set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }
}

export const stockCache = new TTLCache();
export const newsCache = new TTLCache();
export const insightsCache = new TTLCache();
