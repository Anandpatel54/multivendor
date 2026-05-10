import {configureStore} from '@reduxjs/toolkit';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import authReducer from '../features/auth/authSlice';
import vendorsReducer from '../features/vendors/vendorsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendors: vendorsReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
