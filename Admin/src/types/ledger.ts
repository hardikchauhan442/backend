import { Dayjs } from 'dayjs';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  amount: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: Customer | string;
  date: string | Date | Dayjs;
  dueDate: string | Date | Dayjs;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
  updatedBy?: string;
}
