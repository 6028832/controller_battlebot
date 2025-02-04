import { StyleSheet, Text, View } from 'react-native';
import Controller from './components/controller';

export default function App() {
  return (
    <View style={styles.container}>
      <Controller />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
