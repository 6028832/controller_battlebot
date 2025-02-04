import React, { useState, useEffect } from 'react';
import { Button, View, Text, TextInput, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

const Controller = () => {
    const [leftWheel, setLeftWheel] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [savedDeviceName, setSavedDeviceName] = useState('');
    const [device, setDevice] = useState(null);

    useEffect(() => {
        if (Platform.OS === 'android') {
            PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        }
        loadDeviceName();
    }, []);

    const saveDeviceName = async () => {
        if (deviceName.trim()) {
            await AsyncStorage.setItem('deviceName', deviceName);
            setSavedDeviceName(deviceName);
        }
    };

    const loadDeviceName = async () => {
        const storedName = await AsyncStorage.getItem('deviceName');
        if (storedName) {
            setSavedDeviceName(storedName);
        }
    };

    const connectToDevice = async () => {
        if (!savedDeviceName) return alert("Enter and save a Bluetooth device name first!");
        
        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) return;
            if (scannedDevice.name === savedDeviceName) {
                manager.stopDeviceScan();
                scannedDevice.connect()
                    .then(device => {
                        setDevice(device);
                        return device.discoverAllServicesAndCharacteristics();
                    })
                    .catch(err => console.log(err));
            }
        });
    };

    const changeValues = () => {
        setLeftWheel(prevState => {
            const newValue = !prevState;
            sendBluetoothData(newValue ? 'ON' : 'OFF');
            return newValue;
        });
    };

    const sendBluetoothData = async (value) => {
        if (!device) return;
        try {
            await device.writeCharacteristicWithoutResponse(
                'service-uuid',  // Replace with actual service UUID
                'characteristic-uuid', // Replace with actual characteristic UUID
                Buffer.from(value).toString('base64')
            );
        } catch (error) {
            console.log('Bluetooth Send Error:', error);
        }
    };

    return (
        <View>
            <TextInput
                value={deviceName}
                onChangeText={setDeviceName}
                placeholder="Enter Bluetooth Device Name"
                style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
            />
            <Button onPress={saveDeviceName} title="Save Device Name" />
            <Text>Saved Device: {savedDeviceName || "None"}</Text>
            <Button onPress={connectToDevice} title="Connect to Bluetooth" />
            <View>
                <Button onPress={changeValues} title="Toggle Left Wheel" />
                <Text>Left Wheel is {leftWheel ? 'On' : 'Off'}</Text>
            </View>
        </View>
    );
};

export default Controller;
