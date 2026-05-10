import {createSlice} from '@reduxjs/toolkit';
import {VENDORS} from '../../constants/vendors';

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState: VENDORS,
  reducers: {},
});

export default vendorsSlice.reducer;
