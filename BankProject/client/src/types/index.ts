export interface User {
  id: string;
  email: string;
  phone?: string;
}

export interface Account {
  accountId: string;
  email: string;
  phone: string;
  balance: number;
}

export interface Transaction {
  id: string;
  sender_email: string;
  receiver_email: string;
  amount: number;
  created_at: string;
}