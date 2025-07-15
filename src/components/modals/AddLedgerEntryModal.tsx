"use client";

import { useState } from "react";

interface AddLedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function AddLedgerEntryModal({
  isOpen,
  onClose,
  userId,
  userName,
}: AddLedgerEntryModalProps) {
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
          userId,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Ledger Entry</h2>
        <p className="text-sm text-gray-600 mb-4">User: {userName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
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
              className="w-full border rounded px-3 py-2"
            >
              <option value="credit">Credit (Add Money)</option>
              <option value="debit">Debit (Deduct Money)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., Monthly subscription payment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="adjustment">Adjustment</option>
              <option value="fee">Fee</option>
              <option value="credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Sub Category
            </label>
            <input
              type="text"
              value={formData.subCategory}
              onChange={(e) =>
                setFormData({ ...formData, subCategory: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., subscription, one-time"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reference Number
            </label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) =>
                setFormData({ ...formData, referenceNumber: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
              placeholder="Transaction ID or receipt number"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
