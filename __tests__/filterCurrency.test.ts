import {filterCurrency} from '../utils/filterCurrency';
import {cryptoList} from '../data/currencyData';

test('matches start of name', () => {
  const res = filterCurrency('Eth', cryptoList);
  expect(res.some(r => r.name === 'Ethereum')).toBe(true);
});
