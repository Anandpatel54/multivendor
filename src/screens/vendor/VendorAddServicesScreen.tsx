import React, {useState} from 'react';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View} from 'react-native';
import {httpClient} from '../../api/httpClient';
import {useAppSelector} from '../../store/hooks';

type VendorServicesResponse = {
  message: string;
  vendor: {
    mobile: string;
    name: string;
    services: string[];
    location: string;
  };
};

export function VendorAddServicesScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [servicesText, setServicesText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const authToken = useAppSelector(state => state.auth.authToken);

  const handleAddServices = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();
      const trimmedLocation = location.trim();
      const parsedServices = servicesText
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      if (!trimmedName || !trimmedLocation || parsedServices.length === 0) {
        Alert.alert('Validation', 'Please fill name, location and at least one service.');
        setIsSubmitting(false);
        return;
      }

      if (!authToken) {
        Alert.alert('Unauthorized', 'Token missing. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: trimmedName,
        location: trimmedLocation,
        services: parsedServices,
        token: authToken,
      };

      const {data} = await httpClient.post<VendorServicesResponse>('/vendors/services', payload, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setName('');
      setLocation('');
      setServicesText('');
      setSuccessMessage(data.message);
      setTimeout(() => {
        setSuccessMessage('');
      }, 1800);
    } catch (error) {
      console.log('Add services error:', error);
      Alert.alert('Error', 'Unable to update vendor services. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Add Services</Text>
        <Text style={styles.subtitle}>Tap the button to post vendor services data.</Text>
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter vendor name"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Services</Text>
        <TextInput
          style={styles.input}
          value={servicesText}
          onChangeText={setServicesText}
          placeholder="Enter services (comma separated)"
        />

        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleAddServices}
          disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Submitting...' : 'Submit Services'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#102a43',
  },
  subtitle: {
    marginTop: 6,
    color: '#486581',
    marginBottom: 8,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#334e68',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd2d9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#102a43',
    backgroundColor: '#f1f5f9',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#0d6efd',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  success: {
    marginTop: 10,
    marginBottom: 2,
    color: '#087443',
    fontWeight: '700',
    backgroundColor: '#e7f8ef',
    borderWidth: 1,
    borderColor: '#b6e5cb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
});
