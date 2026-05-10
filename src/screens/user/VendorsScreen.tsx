import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAppSelector} from '../../store/hooks';
import {httpClient} from '../../api/httpClient';

type VendorSlotsApiResponse = {
  vendor: {
    mobile: string;
    name: string;
    businessName: string;
    location: string;
    specialty: string;
    services: string[];
    timeSlots: string[];
  };
};

type VendorCardData = {
  id: string;
  businessName: string;
  location: string;
  category: string;
  services: string[];
  availableSlots: string[];
};

export function VendorsScreen() {
  const navigation = useNavigation<any>();
  const userId = useAppSelector(state => state.auth.currentUser?.id);
  const authToken = useAppSelector(state => state.auth.authToken);
  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchVendorSlots = async () => {
      setIsLoading(true);
      try {
        if (!authToken) {
          Alert.alert('Unauthorized', 'Token missing. Please login again.');
          setVendors([]);
          setIsLoading(false);
          return;
        }

        const {data} = await httpClient.get<VendorSlotsApiResponse>(
          '/users/vendors/7000686128/slots',
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
        const apiVendor = data.vendor;
        const mappedVendor: VendorCardData = {
          id: apiVendor.mobile,
          businessName: apiVendor.businessName?.trim() || apiVendor.name || 'Vendor',
          location: apiVendor.location || 'N/A',
          category: apiVendor.specialty?.trim() || 'Services',
          services: apiVendor.services ?? [],
          availableSlots: apiVendor.timeSlots ?? [],
        };
        setVendors([mappedVendor]);
      } catch (error) {
        console.log('Fetch vendor slots error:', error);
        Alert.alert('Error', 'Unable to fetch vendor slots right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorSlots();
  }, [authToken]);

  const handleSelectSlot = (vendorId: string, slot: string) => {
    setSelectedSlots(prev => ({...prev, [vendorId]: slot}));
  };

  const handleBook = (vendorId: string, businessName: string) => {
    const selectedSlot = selectedSlots[vendorId];

    if (!userId) {
      Alert.alert('Error', 'Please login to book an appointment');
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Select Slot', 'Please select a time slot first');
      return;
    }

    navigation.navigate('BookingAddress', {
      vendorId,
      businessName,
      slotTime: selectedSlot,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Services</Text>
      </View>

      <FlatList
        data={vendors}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noSlots}>
            {isLoading ? 'Loading vendors...' : 'No vendors available right now'}
          </Text>
        }
        renderItem={({item}) => {
          const selectedSlot = selectedSlots[item.id];

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.title}>{item.businessName}</Text>
                  <Text style={styles.locationText}>📍 {item.location}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Available Slots</Text>
              <View style={styles.slotWrap}>
                {item.availableSlots.length > 0 ? (
                  item.availableSlots.map(slot => {
                    const isSelected = selectedSlot === slot;

                    return (
                      <Pressable
                        key={`${item.id}-${slot}`}
                        android_ripple={{color: '#dbeafe'}}
                        style={({pressed}) => [
                          styles.slotBtn,
                          isSelected && styles.slotBtnSelected,
                          pressed && styles.slotBtnPressed,
                        ]}
                        onPress={() => handleSelectSlot(item.id, slot)}>
                        <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>
                          {slot}
                        </Text>
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={styles.noSlots}>No slots available for today</Text>
                )}
              </View>

              {item.services.length > 0 ? (
                <>
                  <Text style={styles.sectionTitle}>Services</Text>
                  <Text style={styles.servicesText}>{item.services.join(', ')}</Text>
                </>
              ) : null}

              {selectedSlot ? (
                <Pressable
                  style={({pressed}) => [
                    styles.bookNowBtn,
                    pressed && styles.bookNowBtnPressed,
                  ]}
                  onPress={() => handleBook(item.id, item.businessName)}>
                  <Text style={styles.bookNowText}>Book Now</Text>
                </Pressable>
              ) : null}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  slotBtnSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  slotBtnPressed: {
    transform: [{scale: 0.96}],
  },
  slotText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 13,
  },
  slotTextSelected: {
    color: '#FFF',
  },
  noSlots: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  servicesText: {
    marginTop: 2,
    color: '#334155',
    fontWeight: '500',
  },
  bookNowBtn: {
    marginTop: 14,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookNowBtnPressed: {
    opacity: 0.9,
    transform: [{scale: 0.99}],
  },
  bookNowText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
