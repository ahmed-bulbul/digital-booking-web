type LoadingListener = (active: boolean) => void;

const listeners = new Set<LoadingListener>();
let activeCount = 0;
let cycleStart: number | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
const MIN_VISIBLE_MS = 600;

function notify() {
  const active = activeCount > 0;
  listeners.forEach((listener) => listener(active));
}

export function beginLoading() {
  if (typeof window === "undefined") return;
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (activeCount === 0) {
    cycleStart = Date.now();
  }
  activeCount += 1;
  notify();
}

export function endLoading() {
  if (typeof window === "undefined") return;
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount > 0) {
    notify();
    return;
  }

  const start = cycleStart ?? Date.now();
  const elapsed = Date.now() - start;
  const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

  if (remaining === 0) {
    cycleStart = null;
    notify();
    return;
  }

  hideTimer = setTimeout(() => {
    hideTimer = null;
    cycleStart = null;
    notify();
  }, remaining);
}

export function subscribeLoadingBar(listener: LoadingListener) {
  listeners.add(listener);
  listener(activeCount > 0);
  return () => {
    listeners.delete(listener);
  };
}
