import { paymentClient } from './client';
import { Payment, PaymentCreate, PaymentSettle, PaymentSummary } from '../types/payments.types';

export const paymentApi = {
  create: (data: PaymentCreate) =>
    paymentClient.post<Payment>('/payments', data).then(r => r.data),

  getMyPayments: () =>
    paymentClient.get<Payment[]>('/payments/me').then(r => r.data),

  getMySummary: () =>
    paymentClient.get<PaymentSummary>('/payments/me/summary').then(r => r.data),

  getRoomPayments: (roomId: number, status?: 'pending' | 'settled') =>
    paymentClient.get<Payment[]>(`/payments/room/${roomId}`, { params: status ? { status } : {} }).then(r => r.data),

  settle: (paymentId: number, data: PaymentSettle) =>
    paymentClient.patch<Payment>(`/payments/${paymentId}/settle`, data).then(r => r.data),

  getById: (paymentId: number) =>
    paymentClient.get<Payment>(`/payments/${paymentId}`).then(r => r.data),
};