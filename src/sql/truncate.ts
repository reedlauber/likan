export default function (table: string): string {
  return `TRUNCATE table ${table};`;
}
