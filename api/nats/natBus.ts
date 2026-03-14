/* eslint-disable @typescript-eslint/no-explicit-any */
import { connect, JSONCodec, NatsConnection, Subscription } from 'nats';

export type NatsBusConfig = {
  url: string; // ex: "nats://localhost:4222"
  name?: string; // ex: "api-server" | "socket-server" | "worker"
  user?: string;
  pass?: string;
  token?: string;
};

export type NatsHandler<T = any> = (msg: T, subject: string) => void | Promise<void>;

const jc = JSONCodec<any>();

export class NatsBus {
  private nc!: NatsConnection;
  private subs: Subscription[] = [];

  constructor(private cfg: NatsBusConfig) {}

  async start() {
    if (this.nc) return;

    this.nc = await connect({
      servers: this.cfg.url,
      name: this.cfg.name,
      user: this.cfg.user,
      pass: this.cfg.pass,
      token: this.cfg.token,
    });

    console.log(`[NATS] connected: ${this.cfg.name ?? 'app'} -> ${this.cfg.url}`);

    // logs utiles
    (async () => {
      for await (const s of this.nc.status()) {
        console.log(`[NATS] status`, s.type, s.data);
      }
    })().catch(() => {});
  }

  async stop() {
    try {
      for (const s of this.subs) s.unsubscribe();
      this.subs = [];
      if (this.nc) await this.nc.drain();
    } finally {
      // noop
    }
  }

  publish<T>(subject: string, payload: T) {
    if (!this.nc) throw new Error('NATS not started');
    this.nc.publish(subject, jc.encode(payload));
  }

  subscribe<T>(subject: string, handler: NatsHandler<T>) {
    if (!this.nc) throw new Error('NATS not started');
    const sub = this.nc.subscribe(subject);

    this.subs.push(sub);

    (async () => {
      for await (const m of sub) {
        try {
          const data = jc.decode(m.data) as T;
          await handler(data, m.subject);
        } catch (e) {
          console.error(`[NATS] handler error on ${m.subject}`, e);
        }
      }
    })().catch((e) => console.error(`[NATS] sub loop error`, e));

    console.log(`[NATS] subscribed: ${subject}`);
    return sub;
  }
}
