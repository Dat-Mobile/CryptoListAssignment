import {CurrencyInfo} from '../types/CurrencyInfo';

export function filterCurrency(
  query: string,
  list: CurrencyInfo[],
): CurrencyInfo[] {
  if (!query) return list;

  const lower = query.toLowerCase();

  return list.filter(item => {
    const name = item.name.toLowerCase();
    const symbol = item.symbol.toLowerCase();

    return (
      name.startsWith(lower) ||
      name.includes(` ${lower}`) || // match second word
      symbol.startsWith(lower)
    );
  });
}
