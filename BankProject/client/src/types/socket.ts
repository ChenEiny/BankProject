export interface TransferNotification {
  transactionId: number;
  amount: number;
  senderEmail: string;
  timestamp: string;
}

export interface ServerToClientEvents {
  TRANSFER_RECEIVED: (data: TransferNotification) => void;
}

export type ClientToServerEvents = Record<string, never>;