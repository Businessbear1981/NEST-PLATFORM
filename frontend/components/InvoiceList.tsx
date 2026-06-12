"use client";
import React, { useState } from 'react';
import { Eye, Download, Send, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DEMO_INVOICES,
  getTotalInvoiced,
  getTotalDeposited,
  getOutstandingBalance,
  type Invoice,
  type InvoiceStatus,
} from '@shared/depositDemo';

interface InvoiceListProps {
  dealId: string;
  onViewInvoice?: (invoice: Invoice) => void;
  onPayInvoice?: (invoice: Invoice) => void;
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-500/20 text-slate-700',
  sent: 'bg-blue-500/20 text-blue-700',
  viewed: 'bg-cyan-500/20 text-cyan-700',
  partial: 'bg-yellow-500/20 text-yellow-700',
  paid: 'bg-emerald-500/20 text-emerald-700',
  overdue: 'bg-red-500/20 text-red-700',
  cancelled: 'bg-slate-500/20 text-slate-700',
};

const STATUS_ICONS: Record<InvoiceStatus, React.ReactNode> = {
  draft: <Clock className="w-4 h-4" />,
  sent: <Send className="w-4 h-4" />,
  viewed: <Eye className="w-4 h-4" />,
  partial: <AlertCircle className="w-4 h-4" />,
  paid: <CheckCircle2 className="w-4 h-4" />,
  overdue: <AlertCircle className="w-4 h-4" />,
  cancelled: <Clock className="w-4 h-4" />,
};

export function InvoiceList({ dealId, onViewInvoice, onPayInvoice }: InvoiceListProps) {
  const invoices = DEMO_INVOICES.filter((inv) => inv.dealId === dealId);
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null);

  const totalInvoiced = getTotalInvoiced(dealId);
  const totalDeposited = getTotalDeposited(dealId);
  const outstanding = getOutstandingBalance(dealId);

  const isOverdue = (dueDate: Date) => new Date() > dueDate;
  const daysUntilDue = (dueDate: Date) => Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Invoiced</p>
          <p className="text-2xl font-bold text-foreground">
            ${(totalInvoiced / 1000).toFixed(0)}k
          </p>
        </Card>
        <Card className="p-4 border-border bg-emerald-500/5">
          <p className="text-xs text-emerald-700 mb-1">Received</p>
          <p className="text-2xl font-bold text-emerald-600">
            ${(totalDeposited / 1000).toFixed(0)}k
          </p>
        </Card>
        <Card className="p-4 border-border bg-yellow-500/5">
          <p className="text-xs text-yellow-700 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-yellow-600">
            ${(outstanding / 1000).toFixed(0)}k
          </p>
        </Card>
      </div>

      {/* Invoices Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Invoices</h3>
        {invoices.map((invoice) => {
          const overdue = isOverdue(invoice.dueDate) && invoice.status !== 'paid';
          const daysLeft = daysUntilDue(invoice.dueDate);

          return (
            <Card
              key={invoice.id}
              className={`p-4 border-border hover:bg-accent/50 transition-colors ${
                overdue ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{invoice.invoiceNumber}</h4>
                    <Badge className={STATUS_COLORS[invoice.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[invoice.status]}
                        {invoice.status}
                      </span>
                    </Badge>
                    {overdue && (
                      <Badge className="bg-red-500/20 text-red-700">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Overdue
                        </span>
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{invoice.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">
                        ${(invoice.amount / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Issued</p>
                      <p className="font-semibold text-foreground">
                        {invoice.issuedDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due</p>
                      <p
                        className={`font-semibold ${
                          overdue ? 'text-red-600' : daysLeft < 7 ? 'text-yellow-600' : 'text-foreground'
                        }`}
                      >
                        {invoice.dueDate.toLocaleDateString()}
                        {!overdue && daysLeft >= 0 && (
                          <span className="text-muted-foreground ml-1">({daysLeft}d)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-semibold text-foreground">{invoice.lineItems.length}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (onViewInvoice) {
                        onViewInvoice(invoice);
                        return;
                      }
                      setSelectedInvoice(invoice);
                    }}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  {invoice.status === 'draft' && (
                    <Button size="sm" className="gap-1">
                      <Send className="w-4 h-4" />
                      Send
                    </Button>
                  )}
                  {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="gap-1"
                      onClick={() => onPayInvoice?.(invoice)}
                    >
                      Pay Invoice
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Invoice Detail Dialog */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedInvoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedInvoice.status]}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground">
                    ${selectedInvoice.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issued</p>
                  <p className="font-medium">{selectedInvoice.issuedDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due</p>
                  <p className="font-medium">{selectedInvoice.dueDate.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <p className="text-sm font-semibold mb-3">Line Items</p>
                <div className="space-y-2 border border-border rounded-lg p-3">
                  {selectedInvoice.lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × ${item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        ${item.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm font-semibold mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
