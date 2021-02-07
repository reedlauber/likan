import Model from '../model';
import { onQuerySuccess, QueryExecutor } from '../types';
import { import as importSql } from '../sql';

import Action from './action';

class ImportAction extends Action {
  columns: string[];
  filePath: string;
  model: Model;

  constructor(model: Model, executor: QueryExecutor, filePath: string, columns: string[]) {
    super(model, executor);
    this.columns = columns;
    this.filePath = filePath;
  }

  commit(onSuccess: onQuerySuccess) {
    const sql = importSql(this.model.table, this.filePath, this.columns);
    super.commitAction(sql, [], onSuccess);
  }
}

export default function(executor: QueryExecutor, model: Model, filePath: string, columns: string[]) {
  return new ImportAction(model, executor, filePath, columns);
}

