export type Role = 'user' | 'vendor';

export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  email?: string;
  address?: string;
  vendorId?: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  category: string;
  location: string;
  availableSlots: string[];
}

export interface RescheduleRequest {
  requestedSlot: string;
  requestedBy: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  vendorId: string;
  slotTime: string;
  bookingName?: string;
  bookingEmail?: string;
  bookingAddress?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  rescheduleRequested?: RescheduleRequest;
}
