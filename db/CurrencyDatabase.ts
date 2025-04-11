import SQLite, {
  ResultSetRowList,
  SQLiteDatabase,
  Transaction,
} from 'react-native-sqlite-storage';
import {CurrencyInfo} from '../types/CurrencyInfo';
import {dbVersionAtom} from '../store/dbVersionAtom';
import {getDefaultStore} from 'jotai';
import Toast from 'react-native-simple-toast';
import {cryptoList, fiatList} from '../data/currencyData';

SQLite.enablePromise(true);

const store = getDefaultStore();

let db: SQLiteDatabase;
async function openDB() {
  db = await SQLite.openDatabase({
    name: 'currency.db',
  });
}

export async function initDB(): Promise<void> {
  if (!db) {
    await openDB();
  }
  db.transaction(
    tx => {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS crypto (
      id TEXT PRIMARY KEY,
      name TEXT,
      symbol TEXT,
      code TEXT
    );`);

      tx.executeSql(`CREATE TABLE IF NOT EXISTS fiat (
      id TEXT PRIMARY KEY,
      name TEXT,
      symbol TEXT,
      code TEXT
    );`);
    },
    undefined,
    () => {
      insertList('crypto', cryptoList);
      insertList('fiat', fiatList);
    },
  );
}

export function insertOne(
  table: 'crypto' | 'fiat',
  item: CurrencyInfo,
): Promise<CurrencyInfo[]> {
  return new Promise((resolve, reject) => {
    if (!item.id || !item.name || !item.symbol) {
      reject('Field is missing');
      return;
    }
    db.transaction(tx => {
      // Step 1: Check if item already exists
      tx.executeSql(
        `SELECT COUNT(*) as count FROM ${table} WHERE id = ?;`,
        [item.id],
        (_tx, result) => {
          const count = result.rows.item(0).count;
          if (count > 0) {
            reject(
              `Item with ID "${item.id}" already exists in ${table} table.`,
            );
            return;
          }
          // Step 2: Insert only if not exists
          tx.executeSql(
            `INSERT INTO ${table} (id, name, symbol, code) VALUES (?, ?, ?, ?);`,
            [item.id, item.name, item.symbol, item.code || null],
            (_: Transaction, {rows}: {rows: ResultSetRowList}) => {
              const list: CurrencyInfo[] = processResultSet(rows);
              resolve(list);
            },
            (_tx, insertErr) => {
              reject(`Failed to insert: ${insertErr.message}`);
              return false;
            },
          );
        },
        (_tx, selectErr) => {
          reject(`Failed to check existing entry: ${selectErr.message}`);
          return false;
        },
      );
    });
  });
}

export async function insertList(
  table: 'crypto' | 'fiat',
  list: CurrencyInfo[],
) {
  if (!db) {
    await openDB();
  }
  db.transaction(
    tx => {
      list.forEach(item => {
        tx.executeSql(
          `INSERT OR REPLACE INTO ${table} (id, name, symbol, code) VALUES (?, ?, ?, ?);`,
          [item.id, item.name, item.symbol, item.code || null],
        );
      });
    },
    undefined,
    () => {
      store.set(dbVersionAtom, v => v + 1); // 🔄 bump version on success
    },
  );
}

export async function clearDB() {
  if (!db) {
    await openDB();
  }
  db.transaction(
    tx => {
      tx.executeSql(`DELETE FROM crypto;`);
      tx.executeSql(`DELETE FROM fiat;`);
    },
    undefined,
    () => {
      store.set(dbVersionAtom, v => v + 1);
      Toast.show('Database cleared', Toast.SHORT);
    },
  );
}

const processResultSet = (rows: ResultSetRowList) => {
  const result = [];
  for (let i = 0; i < rows.length; i++) {
    const item = rows.item(i);
    result.push({
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      code: item.code ?? '',
    });
  }
  return result;
};

export async function getCurrency(): Promise<CurrencyInfo[]> {
  return new Promise((resolve, _) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM crypto`,
        [],
        (_: Transaction, {rows}: {rows: ResultSetRowList}) => {
          const list: CurrencyInfo[] = processResultSet(rows);
          resolve(list);
        },
      );
    });
  });
}

export async function getFiat(): Promise<CurrencyInfo[]> {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM fiat`,
        [],
        (_: Transaction, {rows}: {rows: ResultSetRowList}) => {
          const list: CurrencyInfo[] = processResultSet(rows);
          resolve(list);
        },
      );
    });
  });
}

export async function getPurchasable(): Promise<CurrencyInfo[]> {
  if (!db) {
    await openDB();
  }
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `SELECT * FROM crypto`,
        [],
        (_: Transaction, {rows}: {rows: ResultSetRowList}) => {
          const cryptoList: CurrencyInfo[] = processResultSet(rows);
          tx.executeSql(
            `SELECT * FROM fiat`,
            [],
            (_: Transaction, {rows}: {rows: ResultSetRowList}) => {
              const fiatList: CurrencyInfo[] = processResultSet(rows);
              resolve([...cryptoList, ...fiatList]);
            },
          );
        },
      );
    });
  });
}
