// Returns an alias that is the first letter of the table.
// If the table is underscore-separated, the alias is each
// of the first letters of each separated "word"
// e.g. for table "bird_cat_dog", alias is "bcd"
export function tableAlias(tableName: string, alias?: string) {
  if (alias) return alias;

  return tableName.split('_').map((part) => part[0]).join('');
}
