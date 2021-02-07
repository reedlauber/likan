import { SqlParams } from '../types';

// Takes a query string and converts '?' param placeholders with '$1' pg sql notation for params
function swapParams(sql: string, params: SqlParams): string {
  const swapped = params.reduce((acc: string, param: string, i: number) => {
    const idx = acc.indexOf('?');

    if (idx === -1) {
      throw new Error('More expected values provided than params spots.');
    }

    const pgVar = `$${i+1}`;
    const pre = acc.substr(0, idx);
    const post = acc.substr(idx + 1);

    return `${pre}${pgVar}${post}`;
  }, sql) as string;

  return swapped;
}

export { swapParams };
