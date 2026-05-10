import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Appointment, AppointmentStatus} from '../../types';

type UpdatePayload = {
  appointmentId: string;
  status: AppointmentStatus;
};

type ReschedulePayload = {
  appointmentId: string;
  newSlot: string;
  requestedBy: string;
};

const initialState: Appointment[] = [];

const makeId = () => `appt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    bookAppointment: (
      state,
      action: PayloadAction<{
        userId: string;
        vendorId: string;
        slotTime: string;
        bookingName?: string;
        bookingEmail?: string;
        bookingAddress?: string;
      }>,
    ) => {
      const now = new Date().toISOString();
      state.unshift({
        id: makeId(),
        userId: action.payload.userId,
        vendorId: action.payload.vendorId,
        slotTime: action.payload.slotTime,
        bookingName: action.payload.bookingName,
        bookingEmail: action.payload.bookingEmail,
        bookingAddress: action.payload.bookingAddress,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
    },
    updateAppointmentStatus: (state, action: PayloadAction<UpdatePayload>) => {
      const target = state.find(item => item.id === action.payload.appointmentId);
      if (!target) {
        return;
      }
      target.status = action.payload.status;
      target.updatedAt = new Date().toISOString();
    },
    requestReschedule: (state, action: PayloadAction<ReschedulePayload>) => {
      const target = state.find(item => item.id === action.payload.appointmentId);
      if (!target) {
        return;
      }
      target.status = 'pending';
      target.rescheduleRequested = {
        requestedSlot: action.payload.newSlot,
        requestedBy: action.payload.requestedBy,
        createdAt: new Date().toISOString(),
      };
      target.updatedAt = new Date().toISOString();
    },
    handleRescheduleRequest: (
      state,
      action: PayloadAction<{appointmentId: string; accepted: boolean}>,
    ) => {
      const target = state.find(item => item.id === action.payload.appointmentId);
      if (!target || !target.rescheduleRequested) {
        return;
      }
      if (action.payload.accepted) {
        target.slotTime = target.rescheduleRequested.requestedSlot;
        target.status = 'accepted';
      }
      target.rescheduleRequested = undefined;
      target.updatedAt = new Date().toISOString();
    },
  },
});

export const {
  bookAppointment,
  handleRescheduleRequest,
  requestReschedule,
  updateAppointmentStatus,
} = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
