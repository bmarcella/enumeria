import { Behavior } from '@Damba/v2/service/DambaService';
import { DEvent } from '@Damba/v2/service/DEvent';

export const pingBehavior: Behavior = () => async (e: DEvent) => {
  e.out.send({ ok: true });
};
