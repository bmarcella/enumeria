import { NatsBus } from './nats/natBus';

export const nats = new NatsBus({
  url: process.env.NATS_URL ?? 'nats://localhost:4222',
  name: 'worker-server',
});

(async () => {
  await nats.start();
})();
