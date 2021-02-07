type DbRecord = Record<string, any>;

function processDatum(datum: DbRecord, publicFields: string[]): DbRecord {
  const processed: DbRecord = {
    id: datum.id,
  };

  // Shortcut for a pseudo field "dates" that expands to both standard date fields
  if (publicFields.includes('dates')) {
    processed.created_at = datum.created_at;
    processed.updated_at = datum.updated_at;
  }

  publicFields
    .filter((fieldName) => fieldName !== 'dates' && datum.hasOwnProperty(fieldName))
    .forEach((fieldName) => {
      processed[fieldName] = datum[fieldName];
    });

  return processed;
}

function processData(data: DbRecord | Array<DbRecord>, publicFields: string[]) {
  if (data instanceof Array) {
    return data.map((datum) => processDatum(datum, publicFields));
  }

  return processDatum(data as DbRecord, publicFields);
}

export const publicOnly = (
  data: DbRecord | Array<DbRecord>,
  publicFields: string[],
  options?: Record<string, any>,
) => {
  let processed = data;

  if (!options || options.public !== false) {
    processed = processData(data, publicFields);
  }

  return processed;
};
