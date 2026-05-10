import React, {useState} from 'react';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../store/hooks';
import {logout, updateProfile} from '../../features/auth/authSlice';

export function UserProfileScreen() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [name, setName] = useState(currentUser?.name ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [address, setAddress] = useState(currentUser?.address ?? '');

  const onSave = () => {
    dispatch(updateProfile({name, email, address}));
    Alert.alert('Success', 'Profile updated');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Address" />
      <Pressable style={styles.btn} onPress={onSave}>
        <Text style={styles.btnText}>Save Profile</Text>
      </Pressable>
      <Pressable style={styles.btnOutline} onPress={() => dispatch(logout())}>
        <Text style={styles.outlineText}>Logout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f6f9fc'},
  title: {fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#102a43'},
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6e1eb',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  btn: {backgroundColor: '#0d6efd', borderRadius: 8, padding: 12, alignItems: 'center'},
  btnText: {color: '#fff', fontWeight: '700'},
  btnOutline: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#0d6efd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  outlineText: {color: '#0d6efd', fontWeight: '700'},
});
