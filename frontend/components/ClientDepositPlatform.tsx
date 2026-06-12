"use client";
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, FileText, Upload, Receipt, DollarSign } from 'lucide-react';
import { InvoiceList } from './InvoiceList';
import { DepositTracker } from './DepositTracker';
import { ClientSubmissionPortal } from './ClientSubmissionPortal';
import { InvoiceDetailView } from './InvoiceDetailView';
import { PaymentProcessing } from './PaymentProcessing';
import { getInvoicesByDeal, type Invoice } from '@shared/depositDemo';

interface ClientDepositPlatformProps {
  dealId: string;
  dealName?: string;
}

export function ClientDepositPlatform({
  dealId,
  dealName = 'Deal',
}: ClientDepositPlatformProps) {
  const invoices = getInvoicesByDeal(dealId);
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(() => invoices[0] ?? null);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('detail');
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('pay');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Client Deposit Platform</h1>
        <p className="text-muted-foreground mt-1">
          Invoicing, payments, and submissions for {dealName}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Invoices</span>
          </TabsTrigger>
          <TabsTrigger value="detail" className="gap-2">
            <Receipt className="w-4 h-4" />
            <span className="hidden sm:inline">Detail</span>
          </TabsTrigger>
          <TabsTrigger value="pay" className="gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Pay</span>
          </TabsTrigger>
          <TabsTrigger value="deposits" className="gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Deposits</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Submissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <InvoiceList
            dealId={dealId}
            onViewInvoice={handleViewInvoice}
            onPayInvoice={handlePayInvoice}
          />
        </TabsContent>

        <TabsContent value="detail" className="mt-6">
          {selectedInvoice ? (
            <InvoiceDetailView invoiceId={selectedInvoice.id} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Select an invoice from the invoice list to open its detail workspace.
            </div>
          )}
        </TabsContent>

        <TabsContent value="pay" className="mt-6">
          {selectedInvoice ? (
            <PaymentProcessing amount={selectedInvoice.amount} invoiceId={selectedInvoice.id} />
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Select a payable invoice to prefill the payment workflow.
            </div>
          )}
        </TabsContent>

        <TabsContent value="deposits" className="mt-6">
          <DepositTracker dealId={dealId} />
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <ClientSubmissionPortal dealId={dealId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
