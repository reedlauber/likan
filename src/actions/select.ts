import { tableAlias } from '../alias';
import Model from '../model';
import { onQuerySuccess, QueryExecutor, SelectQuery, SqlParams, SqlParamValue } from '../types';
import { select as selectSql } from '../sql';

import Action from './action';

type CountCallback = (count: number) => void;

function addParamsToQuery(query: SelectQuery, params: SqlParamValue | SqlParams) {
  if (params) {
    if (!Array.isArray(params)) {
      params = [params];
    }
    query.params = query.params.concat(params);
  }
}

class SelectAction extends Action {
  includeCount: boolean = false;
  joins: string[] = [];
  query: SelectQuery = { params: [], shouldProcess: true, wheres: [] };
  processOptions: Record<string, any> = null;

  constructor(model: Model, executor: QueryExecutor, columns: string, processOptions?: Record<string, any>) {
    super(model, executor);
    this.query.alias = tableAlias(this.model.table);
    this.query.columns = columns || '*';
    this.processOptions = processOptions;
  }

  // Query-building Methods

  alias(aliasName: string) {
    this.query.alias = aliasName;
    return this;
  }

  columns(columns: string) {
    this.query.columns = columns;
    return this;
  }

  groupBy(groupBys: string) {
    this.query.groupBy = groupBys;
    return this;
  }
  group_by(group_bys: string) {
    return this.groupBy(group_bys);
  }

  join(join: string, params: SqlParamValue | SqlParams, type?: string) {
    type = type || 'JOIN';
    this.joins.push(`${type} ${join}`);
    this.query.joins = this.joins.join(' ');
    addParamsToQuery(this.query, params);
    return this;
  }

  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  offset(offset: number) {
    this.query.offset = offset;
    return this;
  }

  orders(orderBys: string) {
    this.query.orders = orderBys;
    return this;
  }

  params(params: SqlParams) {
    this.query.params = params;
    return this;
  }

  process(shouldProcess: boolean | Record<string, any>) {
    if (typeof shouldProcess === 'object') {
      this.processOptions = shouldProcess;
      this.query.shouldProcess = true;
    } else {
      this.query.shouldProcess = shouldProcess;
    }

    return this;
  }

  sql(callback?: (sql: string, params: SqlParams) => void) {
    const sql = selectSql(this.model.table, this.query);

    if (callback) {
      callback(sql, this.query.params);
    } else {
      console.log(sql, this.query.params);
    }

    return this;
  }

  where(whereClause: string, params: SqlParamValue | SqlParams) {
    this.query.wheres.push(whereClause);
    addParamsToQuery(this.query, params);
    return this;
  }

  whereIf(whereClause: string, params: SqlParamValue | SqlParams, condition: boolean) {
    if (condition) {
      this.where(whereClause, params);
    }
    return this;
  }
  where_if(where_clause: string, params: SqlParamValue | SqlParams, condition: boolean) {
    return this.whereIf(where_clause, params, condition);
  }

  // Commit Methods

  all(onSuccess: onQuerySuccess) {
    this.commit(onSuccess);
  }

  commit(onSuccess: onQuerySuccess, query = this.query) {
    const sql = selectSql(this.model.table, query);
    super.commitAction(sql, query.params, (rows: any[]) => {
      let processedRows = rows;

      if (query.shouldProcess) {
        // processedRows = this.model.process(rows, this.processOptions);
        processedRows = this.executeMiddleware(rows);
      }

      onSuccess(processedRows);
    });
  }

  count(includeCount: (boolean | CountCallback)) {
    if (typeof includeCount === 'boolean') {
      this.includeCount = includeCount;
    } else if (typeof includeCount === 'function') {
      const onSuccess = includeCount;
      const countQuery = {
        ...this.query,
        columns: 'count (*) as the_count',
        orders: '',
      };

      this.first((result: Record<string, any>) => {
        let count;
        if (result) {
          count = parseInt(result.the_count, 10);
          onSuccess(count);
        }
      }, countQuery);
    }
  }

  first(onSuccess: onQuerySuccess, query = this.query) {
    this.commit((rows) => {
      const [firstRow] = rows;
      onSuccess(firstRow);
    }, query);
  }

  private executeMiddleware(results) {
    let processed = results;

    this.model.resultsMiddleware.forEach((middleware) => {
      processed = processed.map((result) => middleware(result, this.processOptions));
    });

    return processed;
  }
}

export default function(
  executor: QueryExecutor,
  model: Model,
  columns: string,
  processOptions: Record<string, any>
) {
  return new SelectAction(model, executor, columns, processOptions);
}
