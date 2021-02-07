import { SelectQuery } from '../types';

import { assignAlias } from './aliases';
import { swapParams } from './params';

export default function select(table: string, q?: SelectQuery) {
  q = q || {};

  const columns = q.columns || '*';
  let alias = '';
  let joins = '';
  let where = '';
  let groupBy = '';
  let orderBy = '';
  let limit = '';
  let offset = '';

  if (q.alias) {
    alias = ` as ${q.alias}`;
  }

  if (q.joins) {
    joins = ` ${q.joins.trim()}`;
  }

  if (q.wheres && q.wheres.length) {
    const wheres = assignAlias(q.wheres, q.alias);
    where = ` WHERE ${wheres.join(' AND ')}`;
  }

  if (q.groupBy) {
    groupBy = ` GROUP BY ${q.groupBy}`;
  }

  if (q.orders) {
    orderBy = ` ORDER BY ${q.orders}`;
  }

  if (q.limit) {
    limit = ` LIMIT ${q.limit}`;
  }

  if (q.offset) {
    offset = ` OFFSET ${q.offset}`;
  }

  const sql = `SELECT ${columns} FROM ${table}${alias}${joins}${where}${groupBy}${limit}${offset};`;
  const params = q.params || [];

  return swapParams(sql, params);
}
