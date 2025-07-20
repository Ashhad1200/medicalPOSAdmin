"use client";

import { useState, useEffect, useRef } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting: boolean;
  dangerLevel?: "low" | "medium" | "high";
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting,
  dangerLevel = "high"
}: DeleteConfirmationModalProps) {
  const [reason, setReason] = useState("");
  const [requireReason, setRequireReason] = useState(dangerLevel === "high");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-focus the textarea when modal opens and reason is required
  useEffect(() => {
    if (isOpen && requireReason && textareaRef.current) {
      // Delay focus to ensure modal is fully rendered
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, requireReason]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !isDeleting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isDeleting]);

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      // Focus the textarea if reason is required but empty
      textareaRef.current?.focus();
      return;
    }
    onConfirm(reason.trim() || undefined);
  };

  const handleClose = () => {
    if (!isDeleting) {
      setReason("");
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      handleClose();
    }
  };

  // Prevent modal content clicks from bubbling to backdrop
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const getBorderColor = () => {
    switch (dangerLevel) {
      case "low": return "border-yellow-500";
      case "medium": return "border-orange-500";
      case "high": return "border-red-500";
      default: return "border-red-500";
    }
  };

  const getButtonColor = () => {
    switch (dangerLevel) {
      case "low": return "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400";
      case "medium": return "bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400";
      case "high": return "bg-red-600 hover:bg-red-700 disabled:bg-red-400";
      default: return "bg-red-600 hover:bg-red-700 disabled:bg-red-400";
    }
  };

  const getIconColor = () => {
    switch (dangerLevel) {
      case "low": return "text-yellow-600";
      case "medium": return "text-orange-600";
      case "high": return "text-red-600";
      default: return "text-red-600";
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="p-6">
          <div className="flex items-center mb-6 pb-4 border-b border-white/10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">{title}</h3>
              <p className="text-sm text-white/70 mt-1">This action cannot be undone</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white/80 mb-4 leading-relaxed">{message}</p>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-sm font-medium text-white mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Item to delete:
              </p>
              <p className="text-sm text-white/90 font-mono bg-white/10 px-3 py-2 rounded-lg break-all border border-white/20">
                {itemName}
              </p>
            </div>
          </div>

          {requireReason && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-3">
                Reason for deletion <span className="text-red-400">*</span>
              </label>
              <textarea
                ref={textareaRef}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                onKeyDown={(e) => {
                  // Allow Ctrl+Enter or Cmd+Enter to submit
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleConfirm();
                  }
                  // Prevent event bubbling that might cause issues
                  e.stopPropagation();
                }}
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 
                          focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          resize-none transition-all duration-200"
                rows={4}
                placeholder="Please provide a reason for this deletion..."
                disabled={isDeleting}
                required
                autoComplete="off"
                spellCheck={true}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-white/60">
                  This will be logged for audit purposes
                </p>
                <p className="text-xs text-white/50">
                  Ctrl+Enter to submit
                </p>
              </div>
              {requireReason && !reason.trim() && (
                <div className="flex items-center mt-2">
                  <svg className="w-4 h-4 mr-1 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-red-400">
                    Please provide a reason to continue
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 
                        focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting || (requireReason && !reason.trim())}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 
                         focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-all duration-200 font-medium"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : (
                `Delete ${dangerLevel === "high" ? "Permanently" : ""}`
              )}
            </button>
          </div>

          {dangerLevel === "high" && (
            <div className="mt-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-300">Warning</h4>
                  <p className="text-sm text-red-200/90 mt-1">
                    This action will permanently delete the item and cannot be reversed. All associated data will be lost.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
