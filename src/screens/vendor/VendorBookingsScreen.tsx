import React from 'react';
import {FlatList, Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {
  handleRescheduleRequest,
  updateAppointmentStatus,
} from '../../features/appointments/appointmentsSlice';
import {logout} from '../../features/auth/authSlice';

export function VendorBookingsScreen() {
  const dispatch = useAppDispatch();
  const vendorId = useAppSelector(state => state.auth.currentUser?.vendorId ?? 'v-1');
  const appointments = useAppSelector(state =>
    state.appointments.filter(item => item.vendorId === vendorId),
  );
  const users = useAppSelector(state => state.auth.users);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>View Bookings</Text>
        <Pressable onPress={() => dispatch(logout())}>
          <Text style={styles.logout}>Logout</Text>
        </Pressable>
      </View>
      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 12}}
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet</Text>}
        renderItem={({item}) => {
          const user = users.find(u => u.id === item.userId);
          return (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{user?.name ?? item.bookingName ?? 'User'}</Text>
              {item.bookingEmail ? <Text style={styles.meta}>Email: {item.bookingEmail}</Text> : null}
              {item.bookingAddress ? <Text style={styles.meta}>Address: {item.bookingAddress}</Text> : null}
              <Text style={styles.meta}>Slot: {item.slotTime}</Text>
              <Text style={styles.meta}>Status: {item.status.toUpperCase()}</Text>

              {item.rescheduleRequested ? (
                <View style={styles.reschedule}>
                  <Text style={styles.rescheduleText}>
                    Requested: {item.rescheduleRequested.requestedSlot}
                  </Text>
                  <View style={styles.row}>
                    <ActionBtn
                      label="Approve"
                      onPress={() =>
                        dispatch(
                          handleRescheduleRequest({
                            appointmentId: item.id,
                            accepted: true,
                          }),
                        )
                      }
                    />
                    <ActionBtn
                      label="Reject"
                      onPress={() =>
                        dispatch(
                          handleRescheduleRequest({
                            appointmentId: item.id,
                            accepted: false,
                          }),
                        )
                      }
                    />
                  </View>
                </View>
              ) : null}

              <View style={styles.row}>
                <ActionBtn
                  label="Accept"
                  onPress={() =>
                    dispatch(updateAppointmentStatus({appointmentId: item.id, status: 'accepted'}))
                  }
                />
                <ActionBtn
                  label="Reject"
                  onPress={() =>
                    dispatch(updateAppointmentStatus({appointmentId: item.id, status: 'rejected'}))
                  }
                />
                <ActionBtn
                  label="Complete"
                  onPress={() =>
                    dispatch(updateAppointmentStatus({appointmentId: item.id, status: 'completed'}))
                  }
                />
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

function ActionBtn({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f6f9fc'},
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {fontSize: 22, fontWeight: '700', color: '#102a43'},
  logout: {color: '#0d6efd', fontWeight: '700'},
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e7ef',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTitle: {fontSize: 16, fontWeight: '700', color: '#102a43'},
  meta: {marginTop: 4, color: '#486581'},
  reschedule: {
    marginTop: 8,
    backgroundColor: '#fff9eb',
    borderWidth: 1,
    borderColor: '#f7d489',
    borderRadius: 8,
    padding: 8,
  },
  rescheduleText: {color: '#b54708', fontWeight: '600'},
  row: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10},
  actionBtn: {
    borderWidth: 1,
    borderColor: '#b8cee2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#eef6ff',
  },
  actionText: {color: '#1f4f82', fontWeight: '700', fontSize: 12},
  empty: {textAlign: 'center', marginTop: 40, color: '#627d98'},
});
