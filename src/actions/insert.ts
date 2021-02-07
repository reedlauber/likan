import Model from '../model';
import { DatesOption, QueryExecutor, SqlParamValue } from '../types';
import { insert as insertSql } from '../sql';

import Action from './action';

class InsertAction extends Action {
  data: Record<string, SqlParamValue>;

  constructor(model: Model, executor: QueryExecutor, data: Record<string, SqlParamValue>, dates?: DatesOption) {
    super(model, executor);
    this.data = data;

    if (dates && dates.createdAt) {
      this.data.created_at = new Date();
    }

    if (dates && dates.updatedAt) {
      this.data.updated_at = new Date();
    }
  }

  commit = (onSuccess?: (result: any | undefined) => void) => {
    const [sql, paramValues] = insertSql(this.model.table, this.data);
    super.commitAction(sql, paramValues, (rows: any[]) => {
      if (onSuccess) {
        onSuccess(rows[0]);
      }
    });
  }
}

export default function(
  execute: QueryExecutor,
  model: Model,
  data: Record<string, SqlParamValue>,
  dates?: DatesOption
) {
  return new InsertAction(model, execute, data);
}
