import React, {useMemo, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import {insertOne} from '../db/CurrencyDatabase';
import {CurrencyInfo} from '../types/CurrencyInfo';
import {RadioGroup} from 'react-native-radio-buttons-group';

interface Props {
  visible: boolean;
  onClose: () => void;
  onInserted: () => void;
}

export default function InsertModal({visible, onClose, onInserted}: Props) {
  const [form, setForm] = useState<CurrencyInfo>({
    id: '',
    name: '',
    symbol: '',
    code: '',
  });
  const radioButtons = useMemo(
    () => [
      {
        id: '1', // acts as primary key, should be unique and non-empty string
        label: 'Crypto',
        value: 'crypto',
      },
      {
        id: '2',
        label: 'Fiat',
        value: 'fiat',
      },
    ],
    [],
  );
  const [selectedId, setSelectedId] = useState('1');
  const insertDisabled =
    form.id === '' || form.name === '' || form.symbol === '';

  const handleChange = (field: keyof CurrencyInfo, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleInsert = async () => {
    const table = selectedId === '1' ? 'crypto' : 'fiat';
    try {
      await insertOne(table, form);
      Alert.alert('Success', `Inserted into ${table} table.`, [
        {
          onPress: () => {
            DeviceEventEmitter.emit('currencyListUpdated');
          },
        },
      ]);
      setForm({id: '', name: '', symbol: '', code: ''});
      onInserted();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err || 'Failed to insert data.');
    }
  };

  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Insert Currency</Text>
          <View style={styles.switchRow}>
            <Text>Type</Text>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              layout="row"
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="ID"
            value={form.id}
            onChangeText={text => handleChange('id', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChangeText={text => handleChange('name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Symbol"
            value={form.symbol}
            onChangeText={text => handleChange('symbol', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Code (optional)"
            value={form.code}
            onChangeText={text => handleChange('code', text)}
          />
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInsert}
              style={[
                styles.insertBtn,
                {backgroundColor: insertDisabled ? 'silver' : '#007bff'},
              ]}
              disabled={insertDisabled}>
              <Text style={{color: '#fff'}}>Insert</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    padding: 10,
  },
  insertBtn: {
    padding: 10,
    borderRadius: 6,
  },
});
