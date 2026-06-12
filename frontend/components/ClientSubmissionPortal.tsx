"use client";
import React, { useState } from 'react';
import { Upload, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DEMO_SUBMISSIONS } from '@shared/depositDemo';

interface ClientSubmissionPortalProps {
  dealId: string;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-700',
  received: 'bg-blue-500/20 text-blue-700',
  approved: 'bg-emerald-500/20 text-emerald-700',
  rejected: 'bg-red-500/20 text-red-700',
};

const STATUS_ICONS = {
  pending: <Clock className="w-4 h-4" />,
  received: <FileText className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  rejected: <AlertCircle className="w-4 h-4" />,
};

const TYPE_LABELS = {
  initial: 'Initial Submission',
  update: 'Project Update',
  evidence: 'Evidence Package',
  approval: 'Approval Request',
};

export function ClientSubmissionPortal({ dealId }: ClientSubmissionPortalProps) {
  const submissions = DEMO_SUBMISSIONS.filter((sub) => sub.dealId === dealId);
  const [selectedSubmission, setSelectedSubmission] = useState<(typeof submissions)[0] | null>(null);

  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Submissions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {submissions.length} submissions • {approvedCount} approved • {pendingCount} pending
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              New Submission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Submission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Submission Type</label>
                <select className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground">
                  <option value="update">Project Update</option>
                  <option value="evidence">Evidence Package</option>
                  <option value="approval">Approval Request</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Documents</label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag files here or click to browse
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                  rows={3}
                  placeholder="Add any notes about this submission..."
                />
              </div>
              <Button className="w-full">Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Submissions</p>
          <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
        </Card>
        <Card className="p-4 border-border bg-emerald-500/5">
          <p className="text-xs text-emerald-700 mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
        </Card>
        <Card className="p-4 border-border bg-yellow-500/5">
          <p className="text-xs text-yellow-700 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </Card>
      </div>

      {/* Submissions Timeline */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Submission History</h3>
        {submissions.map((submission, index) => (
          <Card
            key={submission.id}
            className="p-4 border-border hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setSelectedSubmission(submission)}
          >
            <div className="flex items-start gap-4">
              {/* Timeline Indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    submission.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-700'
                      : submission.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-700'
                        : submission.status === 'rejected'
                          ? 'bg-red-500/20 text-red-700'
                          : 'bg-blue-500/20 text-blue-700'
                  }`}
                >
                  {STATUS_ICONS[submission.status]}
                </div>
                {index < submissions.length - 1 && (
                  <div className="w-0.5 h-12 bg-border my-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">
                    {TYPE_LABELS[submission.type as keyof typeof TYPE_LABELS]}
                  </h4>
                  <Badge className={STATUS_COLORS[submission.status]}>
                    <span className="flex items-center gap-1">
                      {STATUS_ICONS[submission.status]}
                      {submission.status}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-semibold text-foreground">
                      {submission.submittedDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">By</p>
                    <p className="font-semibold text-foreground">{submission.submittedBy}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Documents</p>
                    <p className="font-semibold text-foreground">{submission.documents.length}</p>
                  </div>
                  {submission.approvalDate && (
                    <div>
                      <p className="text-muted-foreground">Approved</p>
                      <p className="font-semibold text-emerald-600">
                        {submission.approvalDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {submission.notes && (
                  <p className="text-xs text-muted-foreground">{submission.notes}</p>
                )}
              </div>

              {/* Action */}
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {TYPE_LABELS[selectedSubmission.type as keyof typeof TYPE_LABELS]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedSubmission.status]}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Submitted By</p>
                  <p className="font-medium">{selectedSubmission.submittedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {selectedSubmission.submittedDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Documents</p>
                  <p className="font-medium">{selectedSubmission.documents.length}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-sm font-semibold mb-2">Documents</p>
                <div className="space-y-2">
                  {selectedSubmission.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border border-border rounded">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground flex-1">{doc}</span>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedSubmission.notes && (
                <div>
                  <p className="text-sm font-semibold mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.notes}</p>
                </div>
              )}

              {/* Approval Info */}
              {selectedSubmission.approvalDate && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/30 rounded-lg">
                  <p className="text-xs font-medium text-emerald-700 mb-1">Approved</p>
                  <p className="text-sm text-emerald-700">
                    {selectedSubmission.approvalDate.toLocaleDateString()} by{' '}
                    {selectedSubmission.approvedBy}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1">
                    Request Changes
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Approve
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
