"use client";
import { useState } from 'react';
import React from 'react';
import { FileText, Download, Eye, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEMO_DEPOSITS, DEMO_INVOICES, type Invoice as DemoInvoice } from '@shared/depositDemo';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';
  dueDate: Date;
  createdDate: Date;
  lineItems: LineItem[];
  paymentHistory: PaymentRecord[];
  linkedDocuments: Document[];
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  method: string;
  reference: string;
  status: 'confirmed' | 'pending' | 'failed';
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: Date;
  size: string;
}

const buildInvoiceView = (sourceInvoice?: DemoInvoice): Invoice => {
  if (!sourceInvoice) {
    return {
  id: 'inv-001',
  number: 'INV-2026-001',
  amount: 250000,
  status: 'partial',
  dueDate: new Date('2026-06-07'),
  createdDate: new Date('2026-05-07'),
  lineItems: [
    { id: 'li1', description: 'Feasibility Analysis & Due Diligence', quantity: 1, unitPrice: 75000, total: 75000 },
    { id: 'li2', description: 'Credit Memo & Rating Support', quantity: 1, unitPrice: 85000, total: 85000 },
    { id: 'li3', description: 'Surety & Insurance Coordination', quantity: 1, unitPrice: 60000, total: 60000 },
    { id: 'li4', description: 'Bond Placement & Investor Relations', quantity: 1, unitPrice: 30000, total: 30000 },
  ],
  paymentHistory: [
    { id: 'pay1', date: new Date('2026-05-15'), amount: 100000, method: 'Wire Transfer', reference: 'REF-001', status: 'confirmed' },
    { id: 'pay2', date: new Date('2026-05-22'), amount: 75000, method: 'ACH', reference: 'REF-002', status: 'confirmed' },
    { id: 'pay3', date: new Date('2026-05-30'), amount: 75000, method: 'Wire Transfer', reference: 'REF-003', status: 'pending' },
  ],
  linkedDocuments: [
    { id: 'doc1', name: 'Feasibility Report', type: 'PDF', uploadedDate: new Date('2026-05-07'), size: '2.4 MB' },
    { id: 'doc2', name: 'Credit Memo', type: 'PDF', uploadedDate: new Date('2026-05-10'), size: '1.8 MB' },
    { id: 'doc3', name: 'Surety Packet', type: 'ZIP', uploadedDate: new Date('2026-05-12'), size: '5.2 MB' },
  ],
      approvalStatus: 'approved',
    };
  }

  const linkedDeposits = DEMO_DEPOSITS.filter((deposit) => deposit.invoiceId === sourceInvoice.id);
  const paymentHistory: PaymentRecord[] = linkedDeposits.map((deposit) => ({
    id: deposit.id,
    date: deposit.receivedDate ?? deposit.scheduledDate,
    amount: deposit.amount,
    method: deposit.paymentMethod.toUpperCase(),
    reference: deposit.confirmationNumber ?? deposit.notes ?? deposit.id,
    status: deposit.status === 'confirmed' ? 'confirmed' : deposit.status === 'pending' ? 'pending' : 'failed',
  }));

  return {
    id: sourceInvoice.id,
    number: sourceInvoice.invoiceNumber,
    amount: sourceInvoice.amount,
    status: sourceInvoice.status === 'viewed' ? 'sent' : sourceInvoice.status === 'cancelled' ? 'draft' : sourceInvoice.status,
    dueDate: sourceInvoice.dueDate,
    createdDate: sourceInvoice.issuedDate,
    lineItems: sourceInvoice.lineItems.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.amount,
    })),
    paymentHistory,
    linkedDocuments: [
      { id: `${sourceInvoice.id}-doc-1`, name: `${sourceInvoice.invoiceNumber} Statement`, type: 'PDF', uploadedDate: sourceInvoice.issuedDate, size: '1.2 MB' },
      { id: `${sourceInvoice.id}-doc-2`, name: `${sourceInvoice.invoiceNumber} Evidence Packet`, type: 'ZIP', uploadedDate: sourceInvoice.issuedDate, size: '4.8 MB' },
    ],
    approvalStatus: sourceInvoice.status === 'paid' ? 'approved' : 'pending',
  };
};

export function InvoiceDetailView({ invoiceId }: { invoiceId?: string }) {
  const sourceInvoice = DEMO_INVOICES.find((item) => item.id === invoiceId) ?? DEMO_INVOICES[0];
  const invoice = buildInvoiceView(sourceInvoice);
  const [activeTab, setActiveTab] = useState('overview');

  const totalPaid = invoice.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = invoice.amount - totalPaid;
  const paymentProgress = (totalPaid / invoice.amount) * 100;

  const statusColor = {
    draft: 'bg-slate-500',
    sent: 'bg-cyan-500',
    partial: 'bg-yellow-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
  };

  const approvalColor = {
    pending: 'bg-slate-600 text-slate-100',
    approved: 'bg-green-600 text-green-100',
    rejected: 'bg-red-600 text-red-100',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-cyan-500" />
            Invoice {invoice.number}
          </h1>
          <p className="text-muted-foreground mt-1">
            Created {invoice.createdDate.toLocaleDateString()} • Due {invoice.dueDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge className={`${statusColor[invoice.status]} text-white`}>
            {invoice.status.toUpperCase()}
          </Badge>
          <Badge className={approvalColor[invoice.approvalStatus]}>
            {invoice.approvalStatus.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#C4A048]">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-[#C4A048]">${(invoice.amount / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-sm text-muted-foreground mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-400">${(totalPaid / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-400">${(outstanding / 1000).toFixed(0)}K</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-foreground">Payment Progress</p>
              <p className="text-sm text-[#C4A048]">{paymentProgress.toFixed(0)}%</p>
            </div>
            <Progress value={paymentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lineItems">Line Items</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#C4A048]">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-mono text-foreground">{invoice.number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice ID</p>
                  <p className="font-mono text-foreground">{invoice.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created Date</p>
                  <p className="text-foreground">{invoice.createdDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-foreground">{invoice.dueDate.toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Items */}
        <TabsContent value="lineItems" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#C4A048]">Invoice Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoice.lineItems.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-bold text-[#C4A048]">${item.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-slate-700 rounded-lg border border-slate-600 mt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-foreground">Total</p>
                    <p className="text-2xl font-bold text-[#C4A048]">${invoice.amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History */}
        <TabsContent value="payments" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#C4A048]">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.paymentHistory.map((payment) => (
                <div key={payment.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{payment.method}</p>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            payment.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-400'
                              : payment.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {payment.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">Ref: {payment.reference}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${payment.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{payment.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Linked Documents */}
        <TabsContent value="documents" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#C4A048]">Linked Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoice.linkedDocuments.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="font-semibold text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {doc.size} • {doc.uploadedDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600 hover:border-cyan-500">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 hover:border-cyan-500">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
