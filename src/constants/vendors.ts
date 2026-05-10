import {Vendor} from '../types';

export const VENDORS: Vendor[] = [
  {
    id: 'v-1',
    businessName: 'Style Studio',
    category: 'Salon',
    location: 'Andheri, Mumbai',
    availableSlots: ['10:00 AM', '11:00 AM', '01:00 PM', '04:00 PM'],
  },
  {
    id: 'v-2',
    businessName: 'Fit Physio Care',
    category: 'Physiotherapy',
    location: 'Powai, Mumbai',
    availableSlots: ['09:30 AM', '12:30 PM', '03:00 PM', '06:00 PM'],
  },
  {
    id: 'v-3',
    businessName: 'Dental Hub',
    category: 'Dental Clinic',
    location: 'Bandra, Mumbai',
    availableSlots: ['10:30 AM', '02:00 PM', '05:00 PM', '07:00 PM'],
  },
];
