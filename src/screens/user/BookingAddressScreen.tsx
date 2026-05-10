import React, {useState} from 'react';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {bookAppointment} from '../../features/appointments/appointmentsSlice';

type BookingAddressRouteParams = {
  vendorId: string;
  businessName: string;
  slotTime: string;
};

export function BookingAddressScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [address, setAddress] = useState(currentUser?.address ?? '');

  const params = route.params as BookingAddressRouteParams | undefined;

  const handleConfirmBooking = () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'Please login to continue');
      return;
    }

    if (!params?.vendorId || !params.slotTime || !params.businessName) {
      Alert.alert('Error', 'Booking details missing. Please select slot again.');
      navigation.goBack();
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter your name');
      return;
    }

    if (!trimmedEmail) {
      Alert.alert('Email Required', 'Please enter your email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!trimmedAddress) {
      Alert.alert('Address Required', 'Please enter booking address');
      return;
    }

    dispatch(
      bookAppointment({
        userId: currentUser.id,
        vendorId: params.vendorId,
        slotTime: params.slotTime,
        bookingName: trimmedName,
        bookingEmail: trimmedEmail,
        bookingAddress: trimmedAddress,
      }),
    );

    Alert.alert(
      'Booking Success',
      `Your slot at ${params.businessName} for ${params.slotTime} is confirmed!`,
      [
        {
          text: 'View Appointments',
          onPress: () => navigation.navigate('Main', {screen: 'Appointments'}),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Enter Booking Details</Text>
        <Text style={styles.meta}>Business: {params?.businessName ?? '-'}</Text>
        <Text style={styles.meta}>Selected Slot: {params?.slotTime ?? '-'}</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          autoCapitalize="words"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.addressInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter full address"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Pressable
          style={({pressed}) => [styles.bookBtn, pressed && styles.bookBtnPressed]}
          onPress={handleConfirmBooking}>
          <Text style={styles.bookText}>Confirm Booking</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  meta: {
    color: '#475569',
    marginBottom: 4,
    fontWeight: '500',
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
  },
  addressInput: {
    minHeight: 100,
  },
  bookBtn: {
    marginTop: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookBtnPressed: {
    opacity: 0.9,
  },
  bookText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
