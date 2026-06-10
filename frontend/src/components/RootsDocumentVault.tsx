import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Clock, AlertCircle, Tag, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DEMO_DOCUMENTS, type RootsDocument, type DocumentStatus } from '@shared/rootsDemo';

const STATUS_COLORS: Record<DocumentStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-700',
  uploaded: 'bg-blue-500/20 text-blue-700',
  processing: 'bg-cyan-500/20 text-cyan-700',
  ocr_complete: 'bg-emerald-500/20 text-emerald-700',
  tagged: 'bg-purple-500/20 text-purple-700',
  approved: 'bg-emerald-500/20 text-emerald-700',
  rejected: 'bg-red-500/20 text-red-700',
};

const STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  uploaded: <Upload className="w-4 h-4" />,
  processing: <Clock className="w-4 h-4" />,
  ocr_complete: <CheckCircle2 className="w-4 h-4" />,
  tagged: <Tag className="w-4 h-4" />,
  approved: <CheckCircle2 className="w-4 h-4" />,
  rejected: <AlertCircle className="w-4 h-4" />,
};

interface RootsDocumentVaultProps {
  dealId: string;
}

export function RootsDocumentVault({ dealId }: RootsDocumentVaultProps) {
  const [documents, setDocuments] = useState<RootsDocument[]>(
    DEMO_DOCUMENTS.filter((doc) => doc.dealId === dealId)
  );
  const [selectedDoc, setSelectedDoc] = useState<RootsDocument | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | ''>('');

  const allTags = Array.from(new Set(documents.flatMap((doc) => doc.tags)));
  const allStatuses = Array.from(new Set(documents.map((doc) => doc.status)));

  const filteredDocs = documents.filter((doc) => {
    const matchesTag = !filterTag || doc.tags.includes(filterTag);
    const matchesStatus = !filterStatus || doc.status === filterStatus;
    return matchesTag && matchesStatus;
  });

  const handleAddTag = (docId: string, newTag: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId && !doc.tags.includes(newTag)
          ? { ...doc, tags: [...doc.tags, newTag] }
          : doc
      )
    );
  };

  const handleRemoveTag = (docId: string, tagToRemove: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId
          ? { ...doc, tags: doc.tags.filter((t) => t !== tagToRemove) }
          : doc
      )
    );
  };

  const handleApprove = (docId: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId ? { ...doc, approvalStatus: 'approved' } : doc
      )
    );
  };

  const handleReject = (docId: string) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === docId ? { ...doc, approvalStatus: 'rejected' } : doc
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Document Vault</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {documents.length} documents • {documents.filter((d) => d.approvalStatus === 'approved').length} approved
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | '')}
          className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Statuses</option>
          {allStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
        >
          <option value="">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="p-4 border-border hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                    <Badge variant="outline" className={STATUS_COLORS[doc.status]}>
                      <span className="flex items-center gap-1">
                        {STATUS_ICONS[doc.status]}
                        {doc.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      Uploaded by {doc.uploadedBy} on {doc.uploadedAt.toLocaleDateString()} •{' '}
                      {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                    {doc.status === 'processing' && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all"
                            style={{ width: `${doc.ocrProgress || 0}%` }}
                          />
                        </div>
                        <span>{doc.ocrProgress}% OCR</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDoc(doc)}
                  className="gap-1"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                {doc.approvalStatus === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(doc.id)}
                      className="gap-1 text-emerald-600 border-emerald-600/30 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(doc.id)}
                      className="gap-1 text-red-600 border-red-600/30 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </>
                )}
                {doc.approvalStatus === 'approved' && (
                  <Badge className="bg-emerald-500/20 text-emerald-700">Approved</Badge>
                )}
                {doc.approvalStatus === 'rejected' && (
                  <Badge className="bg-red-500/20 text-red-700">Rejected</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Document Detail Dialog */}
      {selectedDoc && (
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedDoc.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedDoc.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={STATUS_COLORS[selectedDoc.status]}>
                    {selectedDoc.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded By</p>
                  <p className="font-medium">{selectedDoc.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedDoc.uploadedAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{(selectedDoc.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">v{selectedDoc.version}</p>
                </div>
              </div>

              {/* Tags Management */}
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDoc.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(selectedDoc.id, tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add new tag..."
                  className="mt-2 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      handleAddTag(selectedDoc.id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              {/* Approval */}
              {selectedDoc.approvalStatus === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      handleApprove(selectedDoc.id);
                      setSelectedDoc(null);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    Approve Document
                  </Button>
                  <Button
                    onClick={() => {
                      handleReject(selectedDoc.id);
                      setSelectedDoc(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Reject
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
