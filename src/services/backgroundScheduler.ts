export interface WorkerTask {
  id: string;
  interval: number; // ms
  prepare?: () => Promise<void>;
  run: () => Promise<void> | void;
}

type Subscriber = (lastRun: Map<string, number>) => void;

class BackgroundScheduler {
  private workers = new Map<string, WorkerTask>();
  private lastRun = new Map<string, number>();
  private isRunning = false;

  private tickInterval = 3000;
  private timerId: number | null = null;

  private subscribers = new Set<Subscriber>();

  private startLoop() {
    if (this.timerId !== null) return;

    this.timerId = window.setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  private stopLoop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  register(worker: WorkerTask) {
    if (this.workers.has(worker.id)) return;

    this.workers.set(worker.id, worker);
    this.lastRun.set(worker.id, 0);
    this.notify();

    // 🔥 автозапуск
    if (this.workers.size === 1) {
      this.startLoop();
    }
  }

  unregister(id: string) {
    this.workers.delete(id);
    this.lastRun.delete(id);
    this.notify();

    // 🛑 автостоп
    if (this.workers.size === 0) {
      this.stopLoop();
    }
  }

  getActiveWorkerIds(): string[] {
    return [...this.workers.keys()];
  }

  subscribe(fn: Subscriber) {
    this.subscribers.add(fn);
    // сразу уведомляем подписчика актуальными данными
    fn(new Map(this.lastRun));
    // возвращаем функцию отписки
    return () => {
      this.subscribers.delete(fn);
    };
  }

  private notify() {
    const snapshot = new Map(this.lastRun); // чтобы подписчики не мутировали внутреннюю мапу
    this.subscribers.forEach((fn) => fn(snapshot));
  }

  private async tick() {
    if (this.isRunning) return;
    if (this.workers.size === 0) return;

    const now = Date.now();

    const worker = [...this.workers.values()].find((w) => {
      const last = this.lastRun.get(w.id) ?? 0;
      return now - last >= w.interval;
    });

    if (!worker) return;

    this.isRunning = true;

    try {
      if (worker.prepare) {
        await worker.prepare();
      }

      await worker.run();
      this.lastRun.set(worker.id, Date.now());
      this.notify();
    } catch (e) {
      console.error(`Worker ${worker.id} skipped`, e);
    } finally {
      this.isRunning = false;
    }
  }
}

export const scheduler = new BackgroundScheduler();
