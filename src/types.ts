export type onQuerySuccess = (rows: any[]) => void;
export type onUpdateSuccess = (data: SqlData) => void;

export type SqlParamValue = boolean | number | string | Date;
export type SqlParams = Array<SqlParamValue>;
export type SqlData = Record<string, SqlParamValue>;

export type DbResult = Record<string, any>;
export type DbResults = Array<DbResult>;

export type QueryExecutor = (
  sql: string,
  params: SqlParams,
  success: onQuerySuccess,
  error: (error: Error) => void
) => void;

export interface DeleteParams {
  params: SqlParams;
  where: string;
}

export interface SelectQuery {
  alias?: string;
  columns?: string;
  groupBy?: string;
  joins?: string;
  limit?: number;
  offset?: number;
  orders?: string;
  params?: SqlParams;
  shouldProcess?: boolean;
  wheres?: string[];
}

export interface UpdateQuery {
  params?: SqlParams;
  sets?: string[];
  where?: string;
}

export interface DatesOption {
  createdAt: boolean;
  updatedAt: boolean;
}

export interface ModelOptions {
  alias?: string;
  dates?: DatesOption;
  ssl?: boolean;
  publicFields?: string[];
}
