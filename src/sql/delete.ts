import { DeleteParams } from '../types';
import { swapParams } from './params';

export default function(table: string, q: DeleteParams) {
  return swapParams(`DELETE FROM ${table} WHERE ${q.where};`, q.params);
};
