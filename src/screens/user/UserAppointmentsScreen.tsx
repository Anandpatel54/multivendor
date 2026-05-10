import React from 'react';
import {FlatList, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {requestReschedule} from '../../features/appointments/appointmentsSlice';

export function UserAppointmentsScreen() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const appointments = useAppSelector(state =>
    state.appointments.filter(item => item.userId === currentUser?.id),
  );
  const vendors = useAppSelector(state => state.vendors);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 12}}
        ListEmptyComponent={<Text style={styles.empty}>No appointments yet</Text>}
        renderItem={({item}) => {
          const vendor = vendors.find(v => v.id === item.vendorId);
          return (
            <View style={styles.card}>
              <Text style={styles.title}>{vendor?.businessName ?? 'Vendor'}</Text>
              <Text style={styles.meta}>Slot: {item.slotTime}</Text>
              <Text style={styles.meta}>Status: {item.status.toUpperCase()}</Text>
              {item.bookingName ? <Text style={styles.meta}>Name: {item.bookingName}</Text> : null}
              {item.bookingEmail ? <Text style={styles.meta}>Email: {item.bookingEmail}</Text> : null}
              {item.bookingAddress ? <Text style={styles.meta}>Address: {item.bookingAddress}</Text> : null}
              {item.rescheduleRequested ? (
                <Text style={styles.reschedule}>Requested: {item.rescheduleRequested.requestedSlot}</Text>
              ) : null}
              <View style={styles.row}>
                {(vendor?.availableSlots ?? []).slice(0, 3).map(slot => (
                  <Pressable
                    key={slot}
                    style={styles.slotBtn}
                    onPress={() => {
                      if (!currentUser) {
                        return;
                      }
                      dispatch(
                        requestReschedule({
                          appointmentId: item.id,
                          newSlot: slot,
                          requestedBy: currentUser.id,
                        }),
                      );
                    }}>
                    <Text style={styles.slotText}>{slot}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f6f9fc'},
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  title: {fontSize: 16, fontWeight: '700', color: '#102a43'},
  meta: {marginTop: 4, color: '#486581'},
  reschedule: {marginTop: 6, color: '#b54708', fontWeight: '600'},
  row: {flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap'},
  slotBtn: {
    borderWidth: 1,
    borderColor: '#b8cee2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  slotText: {color: '#1f4f82', fontWeight: '600'},
  empty: {textAlign: 'center', marginTop: 40, color: '#627d98'},
});
