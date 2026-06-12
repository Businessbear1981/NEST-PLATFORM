import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEMO_DEPOSITS, DEMO_INVOICES, type DepositStatus } from '@shared/depositDemo';

interface DepositTrackerProps {
  dealId: string;
}

const STATUS_COLORS: Record<DepositStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-700',
  confirmed: 'bg-emerald-500/20 text-emerald-700',
  failed: 'bg-red-500/20 text-red-700',
  refunded: 'bg-[#2D6B3D]/20 text-[#2D6B3D]',
};

const STATUS_ICONS: Record<DepositStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle2 className="w-4 h-4" />,
  failed: <AlertCircle className="w-4 h-4" />,
  refunded: <AlertCircle className="w-4 h-4" />,
};

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  wire: '🔗',
  ach: '🏦',
  check: '📋',
  credit_card: '💳',
};

export function DepositTracker({ dealId }: DepositTrackerProps) {
  const deposits = DEMO_DEPOSITS.filter((dep) => dep.dealId === dealId);
  const invoices = DEMO_INVOICES.filter((inv) => inv.dealId === dealId);

  const confirmedDeposits = deposits.filter((d) => d.status === 'confirmed');
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const failedDeposits = deposits.filter((d) => d.status === 'failed');

  const totalConfirmed = confirmedDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalPending = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalFailed = failedDeposits.reduce((sum, d) => sum + d.amount, 0);

  const getInvoiceNumber = (invoiceId: string) => {
    return invoices.find((inv) => inv.id === invoiceId)?.invoiceNumber || invoiceId;
  };

  const isOverdue = (scheduledDate: Date) => new Date() > scheduledDate;
  const daysUntil = (date: Date) =>
    Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border bg-emerald-500/5">
          <p className="text-xs text-emerald-700 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-600">
            ${(totalConfirmed / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-muted-foreground mt-1">{confirmedDeposits.length} deposits</p>
        </Card>
        <Card className="p-4 border-border bg-yellow-500/5">
          <p className="text-xs text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            ${(totalPending / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-muted-foreground mt-1">{pendingDeposits.length} deposits</p>
        </Card>
        <Card className="p-4 border-border bg-red-500/5">
          <p className="text-xs text-red-700 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            ${(totalFailed / 1000).toFixed(0)}k
          </p>
          <p className="text-xs text-muted-foreground mt-1">{failedDeposits.length} deposits</p>
        </Card>
      </div>

      {/* Deposit Timeline */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Deposit Schedule</h3>
        {deposits.map((deposit, index) => {
          const overdue = isOverdue(deposit.scheduledDate) && deposit.status === 'pending';
          const daysLeft = daysUntil(deposit.scheduledDate);

          return (
            <Card
              key={deposit.id}
              className={`p-4 border-border hover:bg-accent/50 transition-colors ${
                overdue ? 'border-red-500/30 bg-red-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    deposit.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-700'
                      : deposit.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-700'
                        : 'bg-red-500/20 text-red-700'
                  }`}>
                    {PAYMENT_METHOD_ICONS[deposit.paymentMethod]}
                  </div>
                  {index < deposits.length - 1 && (
                    <div className="w-0.5 h-12 bg-border my-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">
                      {getInvoiceNumber(deposit.invoiceId)}
                    </h4>
                    <Badge className={STATUS_COLORS[deposit.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[deposit.status]}
                        {deposit.status}
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">
                        ${deposit.amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Method</p>
                      <p className="font-semibold text-foreground capitalize">
                        {deposit.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {deposit.status === 'confirmed' ? 'Received' : 'Scheduled'}
                      </p>
                      <p
                        className={`font-semibold ${
                          overdue ? 'text-red-600' : 'text-foreground'
                        }`}
                      >
                        {(deposit.receivedDate || deposit.scheduledDate).toLocaleDateString()}
                        {deposit.status === 'pending' && daysLeft >= 0 && (
                          <span className="text-muted-foreground ml-1">({daysLeft}d)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Confirmation</p>
                      <p className="font-semibold text-foreground">
                        {deposit.confirmationNumber || '—'}
                      </p>
                    </div>
                  </div>

                  {deposit.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{deposit.notes}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {deposit.status === 'pending' && (
                    <Button variant="outline" size="sm">
                      Resend
                    </Button>
                  )}
                  {deposit.status === 'confirmed' && (
                    <Button variant="ghost" size="sm" disabled>
                      ✓ Confirmed
                    </Button>
                  )}
                  {deposit.status === 'failed' && (
                    <Button variant="outline" size="sm" className="text-red-600">
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Deposit */}
      <Button className="w-full gap-2">
        <CreditCard className="w-4 h-4" />
        Record New Deposit
      </Button>
    </div>
  );
}
