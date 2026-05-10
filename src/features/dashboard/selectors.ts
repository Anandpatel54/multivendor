import {RootState} from '../../store';

export const selectVendorStats = (state: RootState, vendorId: string) => {
  const items = state.appointments.filter(a => a.vendorId === vendorId);
  return {
    total: items.length,
    pending: items.filter(a => a.status === 'pending').length,
    completed: items.filter(a => a.status === 'completed').length,
  };
};
