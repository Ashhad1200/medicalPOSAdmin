"use client";

import { useState } from "react";

interface AddOrganizationLedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
}

export default function AddOrganizationLedgerEntryModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
}: AddOrganizationLedgerEntryModalProps) {
  const [formData, setFormData] = useState({
    transactionType: "credit" as "credit" | "debit",
    description: "",
    amount: "",
    category: "payment",
    subCategory: "",
    paymentMethod: "cash",
    referenceNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add ledger entry");
      }

      onClose();
      setFormData({
        transactionType: "credit",
        description: "",
        amount: "",
        category: "payment",
        subCategory: "",
        paymentMethod: "cash",
        referenceNumber: "",
      });
    } catch (error) {
      console.error("Failed to add ledger entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-gray-900/70 to-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-400/30 rounded-lg backdrop-blur-sm">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Add Ledger Entry</h2>
            <p className="text-sm text-gray-400">Organization: {organizationName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={formData.transactionType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  transactionType: e.target.value as any,
                })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            >
              <option value="credit">Credit (Add Money)</option>
              <option value="debit">Debit (Deduct Money)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              placeholder="e.g., Monthly subscription payment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            >
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="adjustment">Adjustment</option>
              <option value="fee">Fee</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sub Category
            </label>
            <input
              type="text"
              value={formData.subCategory}
              onChange={(e) =>
                setFormData({ ...formData, subCategory: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              placeholder="e.g., subscription, one-time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData({ ...formData, referenceNumber: e.target.value })
              }
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
              placeholder="Transaction ID or receipt number"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}