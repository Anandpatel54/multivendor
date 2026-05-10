import {httpClient} from './httpClient';

export type RequestOtpRequest = {
  mobile: string;
  role: 'user' | 'vendor';
};

export type RequestOtpResponse = {
  message: string;
  mobile: string;
  otp: string;
  note: string;
};

export type VerifyOtpRequest = {
  otp: string;
};

export type VerifyOtpResponse = {
  message: string;
  token: string;
  user: {
    role: 'user' | 'vendor';
    mobile: string;
  };
};

export async function requestOtpApi(payload: RequestOtpRequest): Promise<RequestOtpResponse> {
  const response = await httpClient.post<RequestOtpResponse>('/auth/request-otp', payload);
  return response.data;
}

export async function verifyOtpApi(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const response = await httpClient.post<VerifyOtpResponse>('/auth/verify-otp', payload);
  return response.data;
}
