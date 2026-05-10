import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Role, UserProfile} from '../../types';
import axios from 'axios';
import {requestOtpApi, RequestOtpResponse, verifyOtpApi} from '../../api/authApi';
import {clearOtpSession} from '../../services/firebaseAuth';

type AuthState = {
  selectedRole: Role;
  pendingMobile: string;
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  users: UserProfile[];
  authLoading: boolean;
  authError: string | null;
  authToken: string | null;
};

const initialState: AuthState = {
  selectedRole: 'user',
  pendingMobile: '',
  isAuthenticated: false,
  currentUser: null,
  users: [],
  authLoading: false,
  authError: null,
  authToken: null,
};

const makeId = () => `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

function resolveOrCreateUser(state: AuthState, payload: {uid: string; role: Role; mobile: string; name: string}) {
  const existing = state.users.find(
    u => u.mobile === payload.mobile && u.role === payload.role,
  );

  const loggedInUser: UserProfile =
    existing ?? {
      id: payload.uid || makeId(),
      name: payload.name || (payload.role === 'vendor' ? 'New Vendor' : 'New User'),
      mobile: payload.mobile,
      role: payload.role,
      vendorId: payload.role === 'vendor' ? 'v-1' : undefined,
    };

  if (!existing) {
    state.users.unshift(loggedInUser);
  }

  state.currentUser = loggedInUser;
  state.selectedRole = loggedInUser.role;
  state.isAuthenticated = true;
  state.pendingMobile = '';
  state.authError = null;
}

type RequestOtpPayload = {
  mobile: string;
  role: Role;
};

type VerifyOtpResponse = {
  token: string;
  user: {
    role: Role;
    mobile: string;
  };
  message: string;
};

export const requestOtp = createAsyncThunk<RequestOtpResponse, RequestOtpPayload, {rejectValue: string}>(
  'auth/requestOtp',
  async ({mobile, role}, {rejectWithValue}) => {
    try {
      return await requestOtpApi({mobile, role});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      return rejectWithValue(message);
    }
  },
);

export const verifyOtp = createAsyncThunk<VerifyOtpResponse, {code: string}, {rejectValue: string}>(
  'auth/verifyOtp',
  async ({code}, {rejectWithValue}) => {
    try {
      const response = await verifyOtpApi({otp: code});
      return {
        token: response.token,
        user: {
          role: response.user.role,
          mobile: response.user.mobile,
        },
        message: response.message,
      };
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error instanceof Error
            ? error.message
            : 'Invalid OTP';
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<Role>) => {
      state.selectedRole = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (!state.currentUser) {
        return;
      }
      const updated = {...state.currentUser, ...action.payload};
      state.currentUser = updated;
      state.users = state.users.map(user => (user.id === updated.id ? updated : user));
    },
    clearAuthError: state => {
      state.authError = null;
    },
    completeLocalLogin: state => {
      const mobile = state.pendingMobile || '+910000000000';
      resolveOrCreateUser(state, {
        uid: makeId(),
        mobile,
        role: state.selectedRole,
        name: state.selectedRole === 'vendor' ? 'Demo Vendor' : 'Demo User',
      });
    },
    logout: state => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.pendingMobile = '';
      state.authError = null;
      state.authToken = null;
      clearOtpSession();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(requestOtp.pending, state => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.authLoading = false;
        state.pendingMobile = action.payload.mobile;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? 'Failed to send OTP';
      })
      .addCase(verifyOtp.pending, state => {
        state.authLoading = true;
        state.authError = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.authLoading = false;
        state.authToken = action.payload.token;
        resolveOrCreateUser(state, {
          uid: makeId(),
          mobile: action.payload.user.mobile,
          role: action.payload.user.role,
          name: action.payload.user.role === 'vendor' ? 'Vendor User' : 'App User',
        });
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload ?? 'Invalid OTP';
      });
  },
});

export const {logout, setRole, updateProfile, clearAuthError, completeLocalLogin} = authSlice.actions;
export default authSlice.reducer;
