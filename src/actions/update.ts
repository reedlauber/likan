import Model from '../model';
import { onUpdateSuccess, QueryExecutor, SqlData, SqlParams, UpdateQuery } from '../types';
import { update as updateSql } from '../sql';

import Action from './action';

class UpdateAction extends Action {
  data: SqlData;
  query: UpdateQuery = {};

  constructor(model: Model, executor: QueryExecutor, data: SqlData) {
    super(model, executor);
    this.data = data;
    this.parseData(data);

    if (typeof data.id !== 'undefined') {
      this.where('id = ?', [data.id]);
    }
  }

  private parseData(data: SqlData) {
    Object.keys(data).forEach((fieldName) => {
      if (fieldName !== 'id') {
        this.query.sets.push(`${fieldName} = ?`);
        this.query.params.push(data[fieldName]);
      }
    });
  }

  where(where: string, params: SqlParams) {
    this.query.where = where;
    this.query.params = this.query.params.concat(params);
    return this;
  }

  commit(onSuccess: onUpdateSuccess) {
    const sets = this.query.sets.join(', ');
    const sql = updateSql(this.model.table, sets, this.query.params, this.query.where);
    super.commitAction(sql, this.query.params, () => {
      onSuccess(this.data);
    });
  }
}

export default function(executor: QueryExecutor, model: Model, data: SqlData) {
  return new UpdateAction(model, executor, data);
}
