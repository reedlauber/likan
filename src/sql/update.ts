import { SqlParams } from '../types';

import { swapParams } from './params';

export default function update(table: string, sets: string, args?: SqlParams, wheres?: string): string {
  let where = '';

  if (wheres) {
    where = ` WHERE ${wheres}`;
  }

  const params = args || [];

  return swapParams(`UPDATE ${table} SET ${sets}${where};`, params);
}
