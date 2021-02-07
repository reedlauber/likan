import { SqlParams, SqlParamValue } from '../types';

import { swapParams } from './params';

export default function insert(table: string, data: Record<string, SqlParamValue>): [string, SqlParams] {
  const columns = [];
  const values: SqlParams = [];

  Object.keys(data).forEach((columnName) => {
    columns.push(columnName);
    values.push(data[columnName]);
  });

  const valueParams = columns.map(() => '?').join(', ');

  const sql = swapParams(`INSERT INTO ${table} (${columns.join(', ')}) values (${valueParams}) RETURNING *;`, values);

  return [sql, values];
}
