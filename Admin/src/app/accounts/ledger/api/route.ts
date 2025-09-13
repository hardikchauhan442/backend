import { NextResponse } from 'next/server';
import { LedgerAccount, LedgerTransaction, Payment, Invoice, Expense, Revenue } from '../types';

// In-memory storage for demonstration
let accounts: LedgerAccount[] = [];
let transactions: LedgerTransaction[] = [];
let payments: Payment[] = [];
let invoices: Invoice[] = [];
let expenses: Expense[] = [];
let revenues: Revenue[] = [];

// Helper function to generate ID
const generateId = (prefix: string) => 
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// GET /api/accounts/ledger
// Get all ledger data (for demonstration purposes)
export async function GET() {
  return NextResponse.json({
    accounts,
    transactions,
    payments,
    invoices,
    expenses,
    revenues,
  });
}

// POST /api/accounts/ledger
// Create a new ledger item based on type
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, ...itemData } = data;
    
    let newItem;
    const now = new Date().toISOString();
    
    switch (type) {
      case 'account':
        newItem = {
          ...itemData,
          id: generateId('acc'),
          balance: itemData.balance || 0,
          isActive: itemData.isActive !== false,
          createdAt: now,
          updatedAt: now,
        } as LedgerAccount;
        accounts.push(newItem);
        break;
        
      case 'transaction':
        newItem = {
          ...itemData,
          id: generateId('txn'),
          date: itemData.date || now,
          status: itemData.status || 'draft',
          entries: itemData.entries || [],
          createdAt: now,
          updatedAt: now,
        } as LedgerTransaction;
        transactions.push(newItem);
        break;
        
      case 'payment':
        newItem = {
          ...itemData,
          id: generateId('pay'),
          date: itemData.date || now,
          status: itemData.status || 'pending',
          createdAt: now,
          updatedAt: now,
        } as Payment;
        payments.push(newItem);
        break;
        
      case 'invoice':
        newItem = {
          ...itemData,
          id: generateId('inv'),
          invoiceNumber: `INV-${Date.now()}`,
          date: itemData.date || now,
          dueDate: itemData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: itemData.status || 'draft',
          amount: itemData.amount || 0,
          tax: itemData.tax || 0,
          discount: itemData.discount || 0,
          totalAmount: (itemData.amount || 0) + (itemData.tax || 0) - (itemData.discount || 0),
          items: itemData.items || [],
          createdAt: now,
          updatedAt: now,
        } as Invoice;
        invoices.push(newItem);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid type specified' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(newItem, { status: 201 });
    
  } catch (error) {
    console.error('Error creating ledger item:', error);
    return NextResponse.json(
      { error: 'Failed to create ledger item' },
      { status: 500 }
    );
  }
}

// Other API routes for specific resources
// These would be in separate files in a real application

export async function PUT(request: Request) {
  // Implementation for updating ledger items
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}

export async function DELETE(request: Request) {
  // Implementation for deleting ledger items
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
