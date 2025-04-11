import {useAtomValue} from 'jotai';
import {dbVersionAtom} from '../store/dbVersionAtom';
import {useCallback, useEffect, useState} from 'react';
import {CurrencyInfo} from '../types/CurrencyInfo';
import {getCurrency, getFiat} from '../db/CurrencyDatabase';

export function useLiveCurrencyList(source: 'crypto' | 'fiat' | 'purchasable') {
  const dbVersion = useAtomValue(dbVersionAtom);
  const [list, setList] = useState<CurrencyInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getData();
  }, []);

  const getData = useCallback(
    async (mode = source) => {
      try {
        const [crypto, fiat] = await Promise.all([getCurrency(), getFiat()]);
        if (mode === 'crypto') setList(crypto);
        else if (mode === 'fiat') setList([...fiat]);
        else if (mode === 'purchasable') setList([...crypto, ...fiat]);
      } catch (err) {
      } finally {
        setTimeout(() => setIsLoading(false), 400);
      }
    },
    [source],
  );

  useEffect(() => {
    getData();
  }, [dbVersion, source]);

  return {isLoading, list, getData};
}
