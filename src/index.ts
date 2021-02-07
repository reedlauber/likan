import Model from './model';
import { ModelOptions } from './types';

const likan = (connectionString: string, connectionOptions: ModelOptions) => {
  return {
    create: (table: string, modelOptions: ModelOptions): Model => {
      return new Model(
        connectionString,
        table,
        {
          ...connectionOptions,
          ...modelOptions,
        }
      );
    },
  };
};

export default likan;
