import dayjs from 'dayjs';

export interface LedgerAccount {
  id: string;
  name: string;
  type: 'vendor' | 'customer' | 'department' | 'asset' | 'liability' | 'expense' | 'revenue';
  code: string;
  description?: string;
  balance: number;
  currency: string;
  parentAccountId?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LedgerTransaction {
  id: string;
  date: string | Date;
  reference: string;
  description: string;
  entries: LedgerEntry[];
  status: 'draft' | 'posted' | 'cancelled';
  relatedTo?: {
    type: 'wastage' | 'job' | 'purchase' | 'sale' | 'expense' | 'payment';
    id: string;
  };
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  currency: string;
  description?: string;
}

export interface Payment {
  id: string;
  date: string | Date;
  amount: number;
  currency: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'card' | 'other';
  reference: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  relatedTransactions: string[];
  payer: {
    type: 'vendor' | 'customer' | 'employee' | 'other';
    id: string;
    name: string;
  };
  payee: {
    type: 'vendor' | 'customer' | 'employee' | 'other';
    id: string;
    name: string;
  };
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string | Date;
  dueDate: string | Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
  }>;
  notes?: string;
  termsAndConditions?: string;
  relatedTo?: {
    type: 'wastage' | 'job' | 'sale' | 'other';
    id: string;
  };
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Expense {
  id: string;
  date: string | Date;
  amount: number;
  currency: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'other';
  receipt?: string;
  expenseAccountId: string;
  expenseAccountName: string;
  paidTo: string;
  approvedBy?: string;
  approvedAt?: string | Date;
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Revenue {
  id: string;
  date: string | Date;
  amount: number;
  currency: string;
  source: string;
  description: string;
  status: 'pending' | 'received' | 'cancelled';
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'other';
  revenueAccountId: string;
  revenueAccountName: string;
  receivedFrom: string;
  relatedTo?: {
    type: 'recycling' | 'sale' | 'other';
    id: string;
  };
  createdBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface FinancialReportParams {
  startDate: string | Date;
  endDate: string | Date;
  accountId?: string;
  category?: string;
  status?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  currency: string;
  period: {
    start: string | Date;
    end: string | Date;
  };
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export interface VendorPaymentSummary {
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currency: string;
  lastPaymentDate?: string | Date;
}
