// features/billing/models/invoice.model.ts
export interface Invoice {
  userName: any;
  id: string;
  userId: string;
  userFullName?: string;
  createdDate: Date;
  dueDate: Date;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  transactions?: Transaction[];
}

export enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
  Overdue = 'Overdue'
}

export interface InvoiceItem {
  id: string;
  bookingId: string;
  spaceId?: string;
  spaceName?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  bookingStart?: Date;
  bookingEnd?: Date;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  date: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  referenceNumber: string;
}

export enum PaymentMethod {
  CreditCard = 'CreditCard',
  BankTransfer = 'BankTransfer',
  Cash = 'Cash',
  PayPal = 'PayPal'
}

export enum TransactionStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
  Refunded = 'Refunded'
}