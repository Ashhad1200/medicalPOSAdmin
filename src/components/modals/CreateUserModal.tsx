"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useCreateUser } from "@/hooks/useAdminAPI";
import { useOrganizations } from "@/hooks/useAdminAPI";
import { toast } from "sonner";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormErrors {
  [key: string]: string;
}

type TabType = "basic" | "access" | "advanced";

export default function CreateUserModal({
  isOpen,
  onClose,
}: CreateUserModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [errors, setErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    email: "",
    password: "",
    username: "",
    fullName: "",
    phone: "",
    avatar: "",

    // Role & Organization
    role: "user" as const,
    selectedRole: "",
    roleInPOS: "",
    organizationId: "",

    // Access Control
    subscriptionStatus: "pending" as const,
    accessValidTill: "",
    trialEndsAt: "",
    isTrialUser: true,
    isActive: false,
    isEmailVerified: false,

    // Security
    twoFactorEnabled: false,

    // Preferences
    theme: "light" as const,
    language: "en" as const,
    timezone: "UTC" as const,

    // Management
    createdBy: "",
    approvedBy: "",
    approvedAt: "",
    deactivationReason: "",
  });

  const { data: organizations } = useOrganizations();
  const createUser = useCreateUser();

  // Handle escape key and prevent body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !createUser.isPending) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, createUser.isPending]);

  // Memoize validation functions to prevent re-creation
  const validateEmail = useCallback((email: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  }, []);

  const validatePassword = useCallback((password: string): string => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length < 8)
      return "Consider using at least 8 characters for better security";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "For better security, include uppercase, lowercase, and numbers";
    }
    return "";
  }, []);

  const validateUsername = useCallback((username: string): string => {
    if (!username) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (!/^[a-zA-Z0-9_-]+$/.test(username))
      return "Username can only contain letters, numbers, hyphens, and underscores";
    return "";
  }, []);

  const validatePhone = useCallback((phone: string): string => {
    if (phone && !/^\+?[\d\s-()]+$/.test(phone))
      return "Please enter a valid phone number";
    return "";
  }, []);

  const validateUrl = useCallback((url: string): string => {
    if (url) {
      try {
        new URL(url);
      } catch {
        return "Please enter a valid URL";
      }
    }
    return "";
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Basic validation
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    newErrors.username = validateUsername(formData.username);
    newErrors.phone = validatePhone(formData.phone);
    newErrors.avatar = validateUrl(formData.avatar);

    // Required fields
    if (!formData.organizationId) {
      newErrors.organizationId = "Organization is required";
    }

    // Date validation
    if (formData.accessValidTill && formData.trialEndsAt) {
      const accessDate = new Date(formData.accessValidTill);
      const trialDate = new Date(formData.trialEndsAt);
      if (trialDate > accessDate) {
        newErrors.trialEndsAt =
          "Trial end date cannot be after access expiry date";
      }
    }

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    formData,
    validateEmail,
    validatePassword,
    validateUsername,
    validatePhone,
    validateUrl,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        // Find first tab with errors and switch to it
        const errorFields = Object.keys(errors);
        const basicFields = [
          "email",
          "password",
          "username",
          "fullName",
          "phone",
          "avatar",
          "role",
          "roleInPOS",
          "organizationId",
        ];
        const accessFields = [
          "subscriptionStatus",
          "selectedRole",
          "accessValidTill",
          "trialEndsAt",
        ];

        if (errorFields.some((field) => basicFields.includes(field))) {
          setActiveTab("basic");
        } else if (errorFields.some((field) => accessFields.includes(field))) {
          setActiveTab("access");
        } else {
          setActiveTab("advanced");
        }
        return;
      }

      try {
        // Prepare data for submission - transform camelCase to snake_case
        const submitData = {
          email: formData.email,
          password: formData.password,
          username: formData.username,
          full_name: formData.fullName,
          phone: formData.phone,
          avatar_url: formData.avatar,
          role: formData.role,
          role_in_pos: formData.roleInPOS,
          organization_id: formData.organizationId,
          subscription_status: formData.subscriptionStatus,
          access_valid_till: formData.accessValidTill || undefined,
          trial_ends_at: formData.trialEndsAt || undefined,
          is_trial_user: formData.isTrialUser,
          is_active: formData.isActive,
          is_email_verified: formData.isEmailVerified,
          two_factor_enabled: formData.twoFactorEnabled,
          theme: formData.theme,
          language: formData.language,
          timezone: formData.timezone,
          created_by: formData.createdBy,
          approved_by: formData.approvedBy,
          approved_at: formData.approvedAt || undefined,
          deactivation_reason: formData.deactivationReason,
        };

        await createUser.mutateAsync(submitData);

        toast.success(`User ${formData.username} created successfully!`);
        handleClose();
        resetForm();
      } catch (error) {
        console.error("Failed to create user:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create user";
        toast.error(errorMessage);
        setErrors({
          submit: errorMessage,
        });
      }
    },
    [formData, validateForm, errors, createUser]
  );

  const resetForm = useCallback(() => {
    setFormData({
      email: "",
      password: "",
      username: "",
      fullName: "",
      phone: "",
      avatar: "",
      role: "user",
      selectedRole: "",
      roleInPOS: "",
      organizationId: "",
      subscriptionStatus: "pending",
      accessValidTill: "",
      trialEndsAt: "",
      isTrialUser: true,
      isActive: false,
      isEmailVerified: false,
      twoFactorEnabled: false,
      theme: "light",
      language: "en",
      timezone: "UTC",
      createdBy: "",
      approvedBy: "",
      approvedAt: "",
      deactivationReason: "",
    });
    setErrors({});
    setActiveTab("basic");
  }, []);

  const handleClose = useCallback(() => {
    if (!createUser.isPending) {
      resetForm();
      onClose();
    }
  }, [createUser.isPending, resetForm, onClose]);

  // Optimize updateFormData to prevent re-renders
  const updateFormData = useCallback(
    (field: string, value: string | boolean) => {
      setFormData((prev) => {
        // Only update if the value actually changed
        if (prev[field as keyof typeof prev] === value) {
          return prev;
        }
        return { ...prev, [field]: value };
      });

      // Clear error for this field when user starts typing
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    },
    []
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !createUser.isPending) {
        handleClose();
      }
    },
    [createUser.isPending, handleClose]
  );

  // Prevent modal content clicks from bubbling
  const handleModalClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Memoize InputField component to prevent re-creation
  const InputField = useMemo(() => {
    return function InputFieldComponent({
      label,
      name,
      type = "text",
      required = false,
      placeholder = "",
      value,
      onChange,
      helpText = "",
      disabled = false,
    }: {
      label: string;
      name: string;
      type?: string;
      required?: boolean;
      placeholder?: string;
      value: string;
      onChange: (value: string) => void;
      helpText?: string;
      disabled?: boolean;
    }) {
      const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        },
        [onChange]
      );

      return (
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type={type}
            required={required}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className={`w-full border rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500
                       focus:outline-none focus:ring-2 transition-colors duration-200
                       disabled:bg-gray-100 disabled:cursor-not-allowed ${
                         errors[name]
                           ? "border-red-500 focus:ring-red-500"
                           : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                       }`}
            placeholder={placeholder}
            autoComplete="off"
          />
          {errors[name] && (
            <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
          )}
          {helpText && !errors[name] && (
            <p className="text-gray-500 text-xs mt-1">{helpText}</p>
          )}
        </div>
      );
    };
  }, [errors]);

  // Memoize tab configuration
  const tabs = useMemo(
    () => [
      { id: "basic" as const, label: "Basic Info", icon: "👤" },
      { id: "access" as const, label: "Access Control", icon: "🔐" },
      { id: "advanced" as const, label: "Advanced", icon: "⚙️" },
    ],
    []
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={handleModalClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Create New User
            </h2>
            <button
              onClick={handleClose}
              disabled={createUser.isPending}
              className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-red-800 font-medium mb-2">
                Please fix the following errors:
              </h3>
              <ul className="text-red-700 text-sm space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={createUser.isPending}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 disabled:opacity-50`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {/* Show error indicator */}
                  {Object.keys(errors).some((field) => {
                    const basicFields = [
                      "email",
                      "password",
                      "username",
                      "fullName",
                      "phone",
                      "avatar",
                      "role",
                      "roleInPOS",
                      "organizationId",
                    ];
                    const accessFields = [
                      "subscriptionStatus",
                      "selectedRole",
                      "accessValidTill",
                      "trialEndsAt",
                    ];
                    if (tab.id === "basic") return basicFields.includes(field);
                    if (tab.id === "access")
                      return accessFields.includes(field);
                    return (
                      !basicFields.includes(field) &&
                      !accessFields.includes(field)
                    );
                  }) && <span className="text-red-500">•</span>}
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(value) => updateFormData("email", value)}
                  placeholder="user@example.com"
                  helpText="User will receive login credentials at this email"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(value) => updateFormData("password", value)}
                  placeholder="Minimum 6 characters"
                  helpText="Strong passwords include uppercase, lowercase, and numbers"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Username"
                  name="username"
                  required
                  value={formData.username}
                  onChange={(value) => updateFormData("username", value)}
                  placeholder="Unique username"
                  helpText="Used for login and system identification"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(value) => updateFormData("fullName", value)}
                  placeholder="John Doe"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => updateFormData("phone", value)}
                  placeholder="+1234567890"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Avatar URL"
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={(value) => updateFormData("avatar", value)}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={createUser.isPending}
                />

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Admin Panel Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => updateFormData("role", e.target.value)}
                    disabled={createUser.isPending}
                    className={`w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.role
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-1">
                    Controls access to admin panel features
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    POS Role
                  </label>
                  <select
                    value={formData.roleInPOS}
                    onChange={(e) =>
                      updateFormData("roleInPOS", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select POS Role</option>
                    <option value="counter">Counter Staff</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="manager">Store Manager</option>
                    <option value="admin">System Admin</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-1">
                    Role in the main POS system
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) =>
                      updateFormData("organizationId", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className={`w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.organizationId
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Select Organization</option>
                    {organizations?.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                  {errors.organizationId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.organizationId}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Access Control Tab */}
            {activeTab === "access" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Subscription Status
                  </label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) =>
                      updateFormData("subscriptionStatus", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <InputField
                  label="Selected Role"
                  name="selectedRole"
                  value={formData.selectedRole}
                  onChange={(value) => updateFormData("selectedRole", value)}
                  placeholder="Additional role information"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Access Valid Until"
                  name="accessValidTill"
                  type="date"
                  value={formData.accessValidTill}
                  onChange={(value) => updateFormData("accessValidTill", value)}
                  helpText="Leave empty for unlimited access"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Trial Ends At"
                  name="trialEndsAt"
                  type="date"
                  value={formData.trialEndsAt}
                  onChange={(value) => updateFormData("trialEndsAt", value)}
                  helpText="When trial period expires"
                  disabled={createUser.isPending}
                />

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isTrialUser}
                      onChange={(e) =>
                        updateFormData("isTrialUser", e.target.checked)
                      }
                      disabled={createUser.isPending}
                      className="mr-2 h-4 w-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Trial User
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        updateFormData("isActive", e.target.checked)
                      }
                      disabled={createUser.isPending}
                      className="mr-2 h-4 w-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active Account
                    </span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isEmailVerified}
                      onChange={(e) =>
                        updateFormData("isEmailVerified", e.target.checked)
                      }
                      disabled={createUser.isPending}
                      className="mr-2 h-4 w-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Email Verified
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.twoFactorEnabled}
                      onChange={(e) =>
                        updateFormData("twoFactorEnabled", e.target.checked)
                      }
                      disabled={createUser.isPending}
                      className="mr-2 h-4 w-4 text-blue-600 rounded disabled:opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      2FA Enabled
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Theme
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => updateFormData("theme", e.target.value)}
                    disabled={createUser.isPending}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateFormData("language", e.target.value)}
                    disabled={createUser.isPending}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => updateFormData("timezone", e.target.value)}
                    disabled={createUser.isPending}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Kolkata">India Standard Time</option>
                    <option value="Europe/London">London Time</option>
                  </select>
                </div>

                <InputField
                  label="Created By"
                  name="createdBy"
                  value={formData.createdBy}
                  onChange={(value) => updateFormData("createdBy", value)}
                  placeholder="Admin user ID"
                  helpText="Leave empty to use current admin"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Approved By"
                  name="approvedBy"
                  value={formData.approvedBy}
                  onChange={(value) => updateFormData("approvedBy", value)}
                  placeholder="Approver user ID"
                  disabled={createUser.isPending}
                />

                <InputField
                  label="Approval Date"
                  name="approvedAt"
                  type="date"
                  value={formData.approvedAt}
                  onChange={(value) => updateFormData("approvedAt", value)}
                  disabled={createUser.isPending}
                />

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Deactivation Reason
                  </label>
                  <textarea
                    value={formData.deactivationReason}
                    onChange={(e) =>
                      updateFormData("deactivationReason", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className="w-full border rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
                    rows={3}
                    placeholder="Reason for future deactivation (if applicable)"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Only needed if user will be deactivated
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Fields marked with * are required
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={createUser.isPending}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {createUser.isPending ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
