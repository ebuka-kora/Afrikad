/**
 * Maps API / mock transaction rows into user-facing notification items.
 */

export type NotificationKind = 'success' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  /** Ionicons glyph name */
  iconName: string;
}

type TxType = 'deposit' | 'withdrawal' | 'payment' | 'fx_conversion' | 'card_payment';

function normalizeStatus(raw: string | undefined): 'completed' | 'failed' | 'pending' | 'processing' {
  const s = String(raw || '').toLowerCase();
  if (s === 'success' || s === 'completed') return 'completed';
  if (s === 'failed' || s === 'error' || s === 'cancelled') return 'failed';
  if (s === 'processing') return 'processing';
  return 'pending';
}

function normalizeType(raw: string | undefined): TxType {
  const t = String(raw || 'payment') as TxType;
  const allowed: TxType[] = ['deposit', 'withdrawal', 'payment', 'fx_conversion', 'card_payment'];
  return allowed.includes(t) ? t : 'payment';
}

function formatMoney(currency: string | undefined, amount: number | undefined): string {
  if (amount == null || Number.isNaN(Number(amount))) return '';
  const n = Number(amount);
  const c = currency === 'USD' ? 'USD' : 'NGN';
  if (c === 'NGN') return `₦${n.toLocaleString()}`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function merchantLabel(tx: any): string {
  const m = tx.merchantName ?? tx.merchant ?? '';
  const s = String(m).trim();
  if (!s || s.toLowerCase() === 'unknown merchant') return 'the merchant';
  return s.length > 36 ? `${s.slice(0, 33)}…` : s;
}

function isSafeUserMessage(msg: string | undefined): boolean {
  if (!msg || typeof msg !== 'string') return false;
  const t = msg.trim();
  if (t.length < 3 || t.length > 220) return false;
  if (/at\s+\w+\s*\(|stack|ECONNREFUSED|undefined|NaN|Error:/i.test(t)) return false;
  return true;
}

function iconFor(kind: NotificationKind, txType: TxType): string {
  if (kind === 'error') return 'alert-circle';
  if (kind === 'info') return 'time-outline';
  switch (txType) {
    case 'deposit':
      return 'arrow-down-circle';
    case 'withdrawal':
      return 'arrow-up-circle';
    case 'fx_conversion':
      return 'swap-horizontal';
    case 'card_payment':
      return 'card-outline';
    default:
      return 'checkmark-circle';
  }
}

function transactionToNotification(tx: any, index: number, readSet: Set<string>): NotificationItem {
  const id = String(tx._id ?? tx.id ?? index);
  const status = normalizeStatus(tx.status);
  const txType = normalizeType(tx.type);
  const merchant = merchantLabel(tx);
  const amt = formatMoney(tx.currency, tx.amount);
  const timeRaw = tx.createdAt ?? tx.updatedAt ?? tx.date;
  const time = timeRaw ? new Date(timeRaw) : new Date();

  const read = readSet.has(id);

  if (status === 'failed') {
    const err = tx.errorMessage;
    const message = isSafeUserMessage(err)
      ? err
      : txType === 'withdrawal'
        ? "We couldn't send this withdrawal. Check your details and balance, then try again."
        : txType === 'deposit'
          ? "We couldn't complete this top-up. Try again or use another method."
          : "We couldn't complete this payment. Check your balance and try again, or contact support if it keeps happening.";

    return {
      id,
      kind: 'error',
      title: txType === 'withdrawal' ? "Withdrawal didn't go through" : "Payment didn't go through",
      message,
      time,
      read,
      iconName: iconFor('error', txType),
    };
  }

  if (status === 'pending' || status === 'processing') {
    const title =
      txType === 'deposit'
        ? 'Top-up in progress'
        : txType === 'withdrawal'
          ? 'Withdrawal in progress'
          : 'Processing payment';

    const message =
      txType === 'withdrawal'
        ? "We're moving your money. You'll get an update when it's done."
        : txType === 'deposit'
          ? "We're confirming your payment. This usually takes a few minutes."
          : "We're confirming with your bank. Hang tight—this won't take long.";

    return {
      id,
      kind: 'info',
      title,
      message,
      time,
      read,
      iconName: iconFor('info', txType),
    };
  }

  // completed
  let title = 'Payment received';
  let message = amt ? `Your ${amt} transaction is complete.` : 'Your transaction is complete.';

  switch (txType) {
    case 'deposit':
      title = 'Wallet topped up';
      message = amt ? `${amt} was added to your wallet.` : 'Your wallet was funded successfully.';
      break;
    case 'withdrawal':
      title = 'Withdrawal sent';
      message = amt
        ? `${amt} is on its way to your bank.`
        : 'Your withdrawal was sent successfully.';
      break;
    case 'fx_conversion':
      title = 'Exchange complete';
      message = amt
        ? `Your currency exchange for ${amt} is done.`
        : 'Your currency exchange completed successfully.';
      break;
    case 'card_payment':
      title = 'Card payment successful';
      message = amt
        ? `You paid ${amt} to ${merchant}.`
        : `Card payment to ${merchant} went through.`;
      break;
    case 'payment':
    default:
      title = 'Payment successful';
      message = amt
        ? `You paid ${amt} to ${merchant}.`
        : `Payment to ${merchant} went through.`;
      break;
  }

  return {
    id,
    kind: 'success',
    title,
    message,
    time,
    read,
    iconName: iconFor('success', txType),
  };
}

function sortedTransactionsForNotifications(transactions: any[]): any[] {
  if (!Array.isArray(transactions) || transactions.length === 0) return [];

  const sorted = [...transactions].sort((a, b) => {
    const ta = new Date(a.createdAt ?? a.updatedAt ?? a.date ?? 0).getTime();
    const tb = new Date(b.createdAt ?? b.updatedAt ?? b.date ?? 0).getTime();
    return tb - ta;
  });

  return sorted.slice(0, 20);
}

/** Same ID order as `notificationsFromTransactions` — use for unread counts and storage. */
export function getNotificationIdsFromTransactions(transactions: any[]): string[] {
  return sortedTransactionsForNotifications(transactions).map((tx, index) =>
    String(tx._id ?? tx.id ?? index)
  );
}

export function notificationsFromTransactions(
  transactions: any[],
  readIds?: string[]
): NotificationItem[] {
  const txs = sortedTransactionsForNotifications(transactions);
  const readSet = new Set(readIds ?? []);
  return txs.map((tx, index) => transactionToNotification(tx, index, readSet));
}
