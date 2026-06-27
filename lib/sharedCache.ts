import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase';

/**
 * Shared cache for Firebase RTDB data.
 * Multiple components can subscribe to the same path without re-fetching.
 * The underlying onValue listener is shared until all subscribers unsubscribe.
 */

type ListenerCallback<T> = (data: T) => void;

interface CacheEntry<T> {
  listeners: Set<ListenerCallback<T>>;
  unsubscribe: (() => void) | null;
  lastValue: T | null;
}

const cache = new Map<string, CacheEntry<any>>();

function getEntry<T>(path: string): CacheEntry<T> {
  if (!cache.has(path)) {
    cache.set(path, { listeners: new Set(), unsubscribe: null, lastValue: null });
  }
  return cache.get(path)!;
}

function startListener<T>(path: string, entry: CacheEntry<T>, transform: (val: any) => T) {
  if (entry.unsubscribe) return; // already listening

  const dbRef = ref(db, path);
  const handler = (snapshot: any) => {
    const raw = snapshot.val();
    const transformed = transform(raw);
    entry.lastValue = transformed;
    entry.listeners.forEach((cb) => cb(transformed));
  };

  onValue(dbRef, handler, (error: any) => {
    console.error(`Shared cache error for ${path}:`, error);
  });

  entry.unsubscribe = () => {
    off(dbRef, 'value', handler);
  };
}

/**
 * Subscribe to a Firebase path with shared caching.
 * Returns an unsubscribe function. When all subscribers unsubscribe,
 * the underlying onValue listener is removed.
 */
export function subscribeToPath<T>(
  path: string,
  callback: ListenerCallback<T>,
  transform: (raw: any) => T
): () => void {
  const entry = getEntry<T>(path);
  entry.listeners.add(callback);

  // If we already have data, call immediately
  if (entry.lastValue !== null) {
    callback(entry.lastValue);
  }

  startListener(path, entry, transform);

  return () => {
    entry.listeners.delete(callback);
    if (entry.listeners.size === 0 && entry.unsubscribe) {
      entry.unsubscribe();
      entry.unsubscribe = null;
      entry.lastValue = null;
      cache.delete(path);
    }
  };
}

/**
 * Transform helpers
 */
export function transformOrders(raw: any): any[] {
  if (!raw) return [];
  return Object.entries(raw).flatMap(([uid, orderData]: [string, any]) =>
    Object.entries(orderData).map(([orderId, order]: [string, any]) => ({
      id: orderId,
      uid,
      ...order,
    }))
  );
}

export function transformUsers(raw: any): any[] {
  if (!raw) return [];
  return Object.entries(raw).map(([uid, data]: [string, any]) => ({
    uid,
    ...data,
  }));
}
