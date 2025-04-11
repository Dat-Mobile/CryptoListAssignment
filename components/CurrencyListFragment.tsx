import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  DeviceEventEmitter,
} from 'react-native';
import {LegendList} from '@legendapp/list'; // behind @legendapp/list
import {CurrencyInfo} from '../types/CurrencyInfo';
import {SearchBar} from 'react-native-elements';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useLiveCurrencyList} from '../hooks/useLiveCurrencyList';

export default function CurrencyListFragment({
  mode,
}: {
  mode: 'crypto' | 'fiat' | 'purchasable';
}) {
  const [query, setQuery] = useState<string>('');
  const {isLoading, list, getData} = useLiveCurrencyList(mode);
  const [filtered, setFiltered] = useState(list);
  const searchBarRef = useRef(null);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('currencyListUpdated', () => {
      getData(mode); // re-fetch data when new currency is added
    });
    return () => sub.remove(); // clean up
  }, [mode]);

  useEffect(() => {
    if (!query) return setFiltered([...list]);
    const lower = query.toLowerCase();

    const matches = list.filter(item => {
      const name = item.name?.toLowerCase();
      const symbol = item.symbol?.toLowerCase();
      const code = item.code?.toLowerCase();

      return (
        name?.startsWith(lower) ||
        name?.includes(` ${lower}`) ||
        symbol?.startsWith(lower) ||
        code?.startsWith(lower)
      );
    });

    setFiltered(matches);
  }, [query, list]);

  const onCancelSearch = () => {
    // @ts-ignore
    searchBarRef.current?.blur();
    setQuery('');
  };

  const renderItem = ({item}: {item: CurrencyInfo}) => {
    const firstChar = item.symbol.charAt(0);
    return (
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <View style={styles.rowCenter}>
            <View style={styles.symbolContainer}>
              <Text style={styles.symbolText}>{firstChar}</Text>
            </View>
            <Text>{item.name}</Text>
          </View>
          <View style={styles.rowCenter}>
            <Text>{item?.code || item.symbol}</Text>
            <Feather name={'chevron-right'} size={20} />
          </View>
        </View>
      </TouchableNativeFeedback>
    );
  };

  return (
    <View style={styles.flex}>
      <SearchBar
        ref={searchBarRef}
        placeholder="Search currency..."
        // @ts-ignore
        onChangeText={setQuery}
        // @ts-ignore
        platform={Platform.OS}
        value={query}
        searchIcon={{name: 'search'}}
        onCancel={onCancelSearch}
      />
      {!isLoading && !filtered?.length ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name={'emoticon-sad-outline'} size={50} />
          <Text style={styles.emptyText}>{`No Data`}</Text>
        </View>
      ) : (
        <LegendList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          estimatedItemSize={60}
          onScrollEndDrag={Keyboard.dismiss}
          refreshing={isLoading}
          onRefresh={getData}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  rowCenter: {flexDirection: 'row', alignItems: 'center'},
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  symbolContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'black',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  symbolText: {color: 'white'},
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  emptyText: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
});
