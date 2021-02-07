import Model from '../model';
import { onQuerySuccess, QueryExecutor, SqlParams } from '../types';
import { delete as deleteSql } from '../sql';

import Action from './action';

class DeleteAction extends Action {
  params: SqlParams;
  whereClause: string;

  constructor(model: Model, executor: QueryExecutor) {
    super(model, executor);
    this.params = [];
    this.whereClause = '';
  }

  where = (where: number | string, params?: SqlParams): DeleteAction => {
    if (typeof where === 'number') {
      this.params = [where];
      this.whereClause = `id = ?`;
    } else {
      this.params = params || [];
      this.whereClause = where;
    }

    return this;
  }

  commit = (onSuccess: onQuerySuccess) => {
    const sql = deleteSql(this.model.table, {
      params: this.params,
      where: this.whereClause,
    });

    super.commitAction(sql, this.params, onSuccess);
  }
}

export default function(execute: QueryExecutor, model, where?: number | string, params?: SqlParams) {
  const action = new DeleteAction(model, execute);

  if (where) {
    action.where(where, params);
  }

  return action;
}
