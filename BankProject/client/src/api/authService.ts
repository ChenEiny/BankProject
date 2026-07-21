import { AxiosError } from 'axios';
import api from './axios';
import { User } from '../types';

export interface LoginResponse {
  user?: User;
  message?: string;
  error?: string;
}

export const authService = 
{
  async login(credentials: { email: string; password: string }): Promise<{ user?: User }> 
  {
    try 
    {
      const res = await api.post('/auth/login', credentials);
      return { user: res.data?.user || res.data?.data?.user };
    } catch (err: unknown) 
    {
      const axiosError = err as AxiosError<LoginResponse | string>;
      const responseData = axiosError.response?.data;
      
      let errorText = '';
      if (typeof responseData === 'string') 
      {
        errorText = responseData;
      } else if (responseData && typeof responseData === 'object') 
      {
        errorText = responseData.error || responseData.message || '';
      }

      const lowerError = errorText.toLowerCase();
      if (lowerError.includes('already logged in') || lowerError.includes('log out before logging')) 
      {
        const userObj = typeof responseData === 'object' ? responseData?.user : undefined;
        return { user: userObj };
      }

      throw new Error(errorText || axiosError.message);
    }
  },

  async logout(): Promise<void> 
  {
    await api.post('/auth/logout');
  }
};