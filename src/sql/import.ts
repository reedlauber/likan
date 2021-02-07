export default function(table: string, filePath: string, columns: string[]): string {
  return `COPY ${table} (${columns.join(',')}) FROM '${filePath}' WITH NULL 'NULL'`;
}
