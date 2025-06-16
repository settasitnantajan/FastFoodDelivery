import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function WaitingForRiderScreen({ route }) {
  const { order } = route.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>กำลังรอไรเดอร์...</Text>
        {order && (
          <View style={styles.orderInfo}>
            <Text>Order ID: {order.orderId}</Text>
            <Text>สถานะ: {order.status}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  orderInfo: { alignItems: 'center' },
});
