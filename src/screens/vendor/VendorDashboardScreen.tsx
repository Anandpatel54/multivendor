import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useAppSelector} from '../../store/hooks';
import {selectVendorStats} from '../../features/dashboard/selectors';

export function VendorDashboardScreen() {
  const vendorId = useAppSelector(state => state.auth.currentUser?.vendorId ?? 'v-1');
  const stats = useAppSelector(state => selectVendorStats(state, vendorId));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dashboard Reports</Text>
      <View style={styles.row}>
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Completed" value={stats.completed} />
      </View>
    </SafeAreaView>
  );
}

function StatCard({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f6f9fc'},
  title: {fontSize: 22, fontWeight: '700', color: '#102a43', marginBottom: 12},
  row: {flexDirection: 'row', gap: 8},
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dde7f1',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  value: {fontSize: 24, fontWeight: '700', color: '#0d6efd'},
  label: {marginTop: 2, color: '#486581', fontWeight: '600', textAlign: 'center'},
});
