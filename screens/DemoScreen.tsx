import React, {useState} from 'react';
import {Button, StyleSheet, View} from 'react-native';
import CurrencyListFragment from '../components/CurrencyListFragment';
import {clearDB} from '../db/CurrencyDatabase';
import {DEFAULT_MODE} from '../utils/constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import InsertModal from '../components/InsertModal';

export default function DemoScreen() {
  const [mode, setMode] = useState<'crypto' | 'fiat' | 'purchasable'>(
    DEFAULT_MODE,
  );
  const [insertModalVisible, setInsertModalVisible] = useState<boolean>(false);
  const showPurchasable = () => setMode(DEFAULT_MODE);
  const setCryptoList = () => setMode('crypto');
  const setFiatList = () => setMode('fiat');

  const insertDB = () => {
    setInsertModalVisible(true);
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['bottom', 'left', 'right']}>
      <View style={styles.row}>
        <Button title="Clear DB" onPress={clearDB} />
        <Button title="Insert DB" onPress={insertDB} />
        <Button title="Crypto List A" onPress={setCryptoList} />
        <Button title="Fiat List B" onPress={setFiatList} />
        <Button title="Show Purchasable" onPress={showPurchasable} />
      </View>
      <CurrencyListFragment mode={mode} />
      <InsertModal
        visible={insertModalVisible}
        onClose={() => setInsertModalVisible(false)}
        onInserted={() => setInsertModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {gap: 10, padding: 8, flexDirection: 'row', flexWrap: 'wrap'},
});
