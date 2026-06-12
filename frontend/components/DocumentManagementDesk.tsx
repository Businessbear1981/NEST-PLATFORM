"use client";
/*
Document Management System Desk: Upload, organize, tag, compliance tracking, audit trail.
*/
import { Upload, FileText, Tag, Lock, CheckCircle2, AlertCircle, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export interface Document {
  id: string;
  name: string;
  type: "Prospectus" | "Indenture" | "Rating Letter" | "Insurance Cert" | "Feasibility Study" | "Financial Statements" | "Covenant Schedule" | "Other";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  status: "Pending Review" | "Approved" | "Rejected" | "Archived";
  tags: string[];
  complianceChecks: { check: string; passed: boolean }[];
  auditTrail: { action: string; user: string; timestamp: string }[];
}

interface DocumentManagementDeskProps {
  documents: Document[];
  onUpload?: (file: File) => void;
  onApprove?: (docId: string) => void;
  onReject?: (docId: string) => void;
}

export function DocumentManagementDesk({ documents, onApprove, onReject }: DocumentManagementDeskProps) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filteredDocs = documents.filter((doc) => {
    const typeMatch = filterType === "All" || doc.type === filterType;
    const statusMatch = filterStatus === "All" || doc.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const selectedDocument = documents.find((d) => d.id === selectedDoc);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-mono">Document Upload</CardTitle>
          <CardDescription>Add prospectus, indenture, ratings, insurance, financials, feasibility studies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-[#1E4A2E] rounded p-6 text-center hover:border-cyan-400 cursor-pointer transition">
            <Upload size={24} className="mx-auto mb-2 text-[#C4A048]" />
            <p className="text-sm font-mono text-[#EDE8DC]">Drop files or click to upload</p>
            <p className="text-xs text-[#7A9A82] mt-1">Prospectus, Indenture, Rating Letter, Insurance Cert, Feasibility, Financials, Covenants</p>
          </div>
        </CardContent>
      </Card>

      {/* Filter & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-[#EDE8DC]">{documents.length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-400">{documents.filter((d) => d.status === "Approved").length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-400">{documents.filter((d) => d.status === "Pending Review").length}</p>
        </div>
        <div className="border border-[#1E4A2E] rounded p-3">
          <p className="text-xs text-[#7A9A82] mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-400">{documents.filter((d) => d.status === "Rejected").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-xs px-2 py-1 bg-[#0D2218] border border-[#1E4A2E] rounded text-[#EDE8DC]"
        >
          <option>All Types</option>
          <option>Prospectus</option>
          <option>Indenture</option>
          <option>Rating Letter</option>
          <option>Insurance Cert</option>
          <option>Feasibility Study</option>
          <option>Financial Statements</option>
          <option>Covenant Schedule</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-2 py-1 bg-[#0D2218] border border-[#1E4A2E] rounded text-[#EDE8DC]"
        >
          <option>All Status</option>
          <option>Pending Review</option>
          <option>Approved</option>
          <option>Rejected</option>
          <option>Archived</option>
        </select>
      </div>

      {/* Document List */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2 text-xs font-mono text-[#7A9A82] px-3 py-2 border-b border-[#1E4A2E]">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Uploaded</div>
          <div className="col-span-3">Actions</div>
        </div>

        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id)}
            className={`grid grid-cols-12 gap-2 text-xs px-3 py-2 border border-[#1E4A2E] rounded cursor-pointer transition ${
              selectedDoc === doc.id ? "bg-[#0D2218] border-cyan-400" : "hover:bg-[#030A06]"
            }`}
          >
            <div className="col-span-3 flex items-center gap-2 font-mono text-[#EDE8DC]">
              <FileText size={14} />
              {doc.name}
            </div>
            <div className="col-span-2 text-[#7A9A82]">{doc.type}</div>
            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded text-xs font-mono ${
                  doc.status === "Approved"
                    ? "bg-emerald-900 text-emerald-300"
                    : doc.status === "Pending Review"
                      ? "bg-yellow-900 text-yellow-300"
                      : doc.status === "Rejected"
                        ? "bg-red-900 text-red-300"
                        : "bg-[#1E4A2E] text-[#EDE8DC]"
                }`}
              >
                {doc.status}
              </span>
            </div>
            <div className="col-span-2 text-[#7A9A82]">{doc.uploadedAt}</div>
            <div className="col-span-3 flex gap-1">
              <button className="p-1 hover:bg-[#1E4A2E] rounded">
                <Download size={12} className="text-[#7A9A82]" />
              </button>
              <button className="p-1 hover:bg-[#1E4A2E] rounded">
                <Tag size={12} className="text-[#7A9A82]" />
              </button>
              <button className="p-1 hover:bg-[#1E4A2E] rounded">
                <Trash2 size={12} className="text-[#7A9A82]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Panel */}
      {selectedDocument && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-mono">{selectedDocument.name}</CardTitle>
                <CardDescription>{selectedDocument.type}</CardDescription>
              </div>
              <span className="text-xs text-[#7A9A82]">{selectedDocument.size}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metadata */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-2">Metadata</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[#7A9A82]">Uploaded By</p>
                  <p className="font-mono text-[#EDE8DC]">{selectedDocument.uploadedBy}</p>
                </div>
                <div>
                  <p className="text-[#7A9A82]">Date</p>
                  <p className="font-mono text-[#EDE8DC]">{selectedDocument.uploadedAt}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {selectedDocument.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-[#0D2218] border border-[#1E4A2E] rounded text-xs text-[#EDE8DC]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance Checks */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-2">Compliance Checks</p>
              <div className="space-y-1">
                {selectedDocument.complianceChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {check.passed ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={14} className="text-red-400" />
                    )}
                    <span className="text-[#EDE8DC]">{check.check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="border-t border-[#1E4A2E] pt-4">
              <p className="text-xs font-mono text-[#7A9A82] mb-2">Audit Trail</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedDocument.auditTrail.map((entry, idx) => (
                  <div key={idx} className="text-xs text-[#7A9A82]">
                    <span className="font-mono text-[#7A9A82]">{entry.timestamp}</span> — {entry.action} by {entry.user}
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Actions */}
            {selectedDocument.status === "Pending Review" && (
              <div className="border-t border-[#1E4A2E] pt-4 flex gap-2">
                <button
                  onClick={() => onApprove?.(selectedDocument.id)}
                  className="flex-1 px-3 py-2 bg-emerald-900 text-emerald-300 rounded text-xs font-mono hover:bg-emerald-800"
                >
                  Approve
                </button>
                <button
                  onClick={() => onReject?.(selectedDocument.id)}
                  className="flex-1 px-3 py-2 bg-red-900 text-red-300 rounded text-xs font-mono hover:bg-red-800"
                >
                  Reject
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
