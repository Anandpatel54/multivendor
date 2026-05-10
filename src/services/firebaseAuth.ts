import {Role} from '../types';

type BackendUser = {
  uid: string;
  mobile: string;
  role: Role;
  name: string;
  isNewUser: boolean;
};

let pendingPhoneNumber: string | null = null;
const usersByPhone = new Map<string, Omit<BackendUser, 'isNewUser'>>();

function inferRoleFromPhone(phoneNumber: string): Role {
  const lastDigit = Number(phoneNumber.slice(-1));
  return Number.isNaN(lastDigit) ? 'user' : lastDigit % 2 === 0 ? 'vendor' : 'user';
}

export async function sendOtpToPhone(phoneNumber: string) {
  pendingPhoneNumber = phoneNumber;
}

export async function verifyOtpCode(code: string): Promise<BackendUser> {
  if (!pendingPhoneNumber) {
    throw new Error('No OTP session found. Please request OTP again.');
  }

  if (!/^\d{6}$/.test(code)) {
    throw new Error('OTP verification failed. Please try again.');
  }

  const existingUser = usersByPhone.get(pendingPhoneNumber);
  let user: BackendUser;

  if (existingUser) {
    user = {...existingUser, isNewUser: false};
  } else {
    const createdUser: Omit<BackendUser, 'isNewUser'> = {
      uid: `mock-${Date.now()}`,
      mobile: pendingPhoneNumber,
      role: inferRoleFromPhone(pendingPhoneNumber),
      name: 'New User',
    };
    usersByPhone.set(pendingPhoneNumber, createdUser);
    user = {...createdUser, isNewUser: true};
  }

  pendingPhoneNumber = null;
  return user;
}

export function clearOtpSession() {
  pendingPhoneNumber = null;
}
