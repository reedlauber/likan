import Model from '../model';
import { onQuerySuccess, QueryExecutor } from '../types';
import { truncate as truncateSql } from '../sql';

import Action from './action';

class TruncateAction extends Action {
  constructor(model: Model, executor: QueryExecutor) {
    super(model, executor);
  }

  commit(onSuccess: onQuerySuccess) {
    const sql = truncateSql(this.model.table);
    super.commitAction(sql, [], onSuccess);
  }
}

export default function(executor: QueryExecutor, model: Model) {
  return new TruncateAction(model, executor);
}
