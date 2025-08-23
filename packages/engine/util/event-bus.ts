import type * as PIXI from 'pixi.js';

type Callback<T> = (payload: T) => void;
// biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
interface Listener<K extends keyof any, V> {
  id: string;
  event: K;
  callback: Callback<V>;
}

export interface IEventBus {
  // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
  on<K extends string>(event: K, callback: Callback<any>): string;
  // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
  fire<K extends string>(event: K, payload: any): void;
  remove(id: string): void;
  clear(): void;
  count(): number;
}

// biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
const eventBus = <Events extends Record<string, any>>(): IEventBus => {
  // biome-ignore lint/suspicious/noExplicitAny: use of any is needed here
  const listeners = new Map<string, Listener<keyof Events, any>>();

  const on = <K extends keyof Events>(event: K, callback: Callback<Events[K]>): string => {
    const time = Date.now().toString().slice(-8);
    const randNum = Math.floor(Math.random() * 100_000_000);
    const id = `evt_${time}_${randNum}`;
    listeners.set(id, { id, event, callback });
    return id;
  };

  const fire = <K extends keyof Events>(event: K, payload: Events[K]): void => {
    for (const listener of listeners.values()) {
      if (listener.event === event) {
        (listener.callback as Callback<Events[K]>)(payload);
      }
    }
  };

  const remove = (id: string): void => {
    listeners.delete(id);
  };

  const clear = () => listeners.clear();

  const count = () => listeners.size;

  return {
    on,
    fire,
    count,
    remove,
    clear,
  };
};

export type EventMap = {
  eventName: { count: number };
  shotFired: { cords: PIXI.Rectangle; facingRight: boolean };
};

export const createEventBus = () => {
  const bus = eventBus<EventMap>();
  return bus;
};
