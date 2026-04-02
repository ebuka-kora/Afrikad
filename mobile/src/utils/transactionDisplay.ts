/**
 * Normalize API transaction rows for list UI (wallet vs card, status).
 */

import { COLORS } from '../constants/theme';

export type TransactionSource = 'card' | 'wallet';

export type NormalizedTxStatus = 'success' | 'failed' | 'pending';

export interface NormalizedTransaction {
  id: string;
  merchant: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: NormalizedTxStatus;
  /** Backend transaction type (deposit, payment, etc.) */
  type: string;
  date: string;
  source: TransactionSource;
}

/** Deposits are treated as incoming for + / green amount styling when successful. */
export function isIncomingTransactionType(txType: string | undefined): boolean {
  return String(txType || '').toLowerCase() === 'deposit';
}

/** Same rules as transaction details: "+" only for successful deposits; pending deposit has no sign. */
export function transactionAmountPrefix(status: NormalizedTxStatus, txType: string | undefined): string {
  const incoming = isIncomingTransactionType(txType);
  if (status === 'pending') return incoming ? '' : '−';
  if (status === 'success' && incoming) return '+';
  return '−';
}

export function transactionAmountColor(status: NormalizedTxStatus, txType: string | undefined): string {
  const incoming = isIncomingTransactionType(txType);
  if (status === 'failed') return COLORS.error;
  if (status === 'pending') return COLORS.warning;
  if (incoming) return COLORS.accent;
  return COLORS.text;
}

/** Card: virtual card payment or explicit card_payment type. Everything else = wallet (NGN wallet, etc.). */
export function deriveTransactionSource(tx: any): TransactionSource {
  const pm = String(tx?.paymentMethod ?? '').toLowerCase();
  const type = String(tx?.type ?? '').toLowerCase();
  if (pm === 'virtual_card' || type === 'card_payment') return 'card';
  return 'wallet';
}

export function normalizeTransactionStatus(tx: any): NormalizedTxStatus {
  const s = String(tx?.status ?? '').toLowerCase();
  if (s === 'failed' || s === 'error' || s === 'cancelled') return 'failed';
  if (s === 'pending' || s === 'processing') return 'pending';
  return 'success';
}

/** Human-readable label for backend `type` enum */
export function transactionTypeLabel(type: string | undefined): string {
  const t = String(type || 'payment').toLowerCase();
  const map: Record<string, string> = {
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    payment: 'Payment',
    fx_conversion: 'Currency exchange',
    card_payment: 'Card payment',
  };
  return map[t] || 'Transaction';
}

export function normalizeTransactionRow(tx: any): NormalizedTransaction {
  return {
    id: String(tx._id ?? tx.id ?? ''),
    merchant: String(tx.merchantName ?? tx.description ?? '—'),
    amount: Number(tx.amount) || 0,
    currency: (tx.currency === 'USD' ? 'USD' : 'NGN') as 'NGN' | 'USD',
    type: String(tx.type ?? 'payment'),
    date: tx.createdAt ? String(tx.createdAt) : '',
    status: normalizeTransactionStatus(tx),
    source: deriveTransactionSource(tx),
  };
}
