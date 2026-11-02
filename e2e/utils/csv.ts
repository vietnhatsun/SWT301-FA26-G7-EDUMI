import { readFileSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

export function readCsv<T extends Record<string, string>>(path: string): T[] {
  return parse(readFileSync(path, 'utf-8'), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: false,
  }) as T[];
}

