export type PaymentStatus = 'pending' | 'settled';

export interface Payment {
  id: number;
  room_id: number;
  from_user: string;
  to_user: string;
  amount: number;
  status: PaymentStatus;
  upi_ref?: string;
  note?: string;
  created_at: string;
  settled_at?: string;
}

export interface PaymentCreate {
  room_id: number;
  to_user: string;
  amount: number;
  upi_ref?: string;
  note?: string;
}

export interface PaymentSettle {
  upi_ref?: string;
}

export interface PaymentSummary {
  total_paid: number;
  total_received: number;
  pending_out: number;
  pending_in: number;
  transaction_count: number;
}