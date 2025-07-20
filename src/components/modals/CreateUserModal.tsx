"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useCreateUser } from "@/hooks/useAdminAPI";
import { useOrganizations } from "@/hooks/useAdminAPI";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Organization } from "@/config/database.types";

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
    roleInPOS: "counter" as const, // Add POS role field
    organizationId: "",

    // Access Control
    subscriptionStatus: "pending" as const,
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
  const { appUser } = useAuth();
  console.log(appUser)
  // Update form data when appUser is available
  useEffect(() => {
    if (appUser?.email) {
      setFormData(prev => ({
        ...prev,
        createdBy: appUser.id,
        approvedBy: appUser.i
      }));
    }
  }, [appUser]);

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
    if (!formData.roleInPOS) {
      newErrors.roleInPOS = "POS Role is required";
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
      roleInPOS: "counter",
      organizationId: "",
      subscriptionStatus: "pending",
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
          <label className="block text-sm font-medium mb-3 text-white">
            {label} {required && <span className="text-red-400">*</span>}
          </label>
          <input
            type={type}
            required={required}
            value={value}
            onChange={handleInputChange}
            disabled={disabled}
            className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50
                       focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200
                       disabled:bg-white/5 disabled:cursor-not-allowed backdrop-blur-sm ${
                         errors[name]
                           ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                           : "hover:bg-white/15"
                       }`}
            placeholder={placeholder}
            autoComplete="off"
          />
          {errors[name] && (
            <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errors[name]}</span>
            </p>
          )}
          {helpText && !errors[name] && (
            <p className="text-white/60 text-xs mt-2">{helpText}</p>
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="glass-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
        onClick={handleModalClick}
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold gradient-text">
                Create New User
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={createUser.isPending}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-red-400 font-semibold">
                  Please fix the following errors:
                </h3>
              </div>
              <ul className="text-red-300 text-sm space-y-2">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field} className="flex items-center space-x-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-2 bg-white/5 rounded-xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={createUser.isPending}
                  className={`${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  } flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 relative`}
                >
                  <span className="text-lg">{tab.icon}</span>
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
                  }) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                    </span>
                  )}
                </button>
              ))}
            </div>
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
                  <label className="block text-sm font-medium mb-3 text-white">
                    Admin Panel Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => updateFormData("role", e.target.value)}
                    disabled={createUser.isPending}
                    className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:bg-white/5 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-white/15 ${
                      errors.role
                        ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                        : ""
                    }`}
                  >
                    <option value="user" className="bg-gray-800 text-white">User</option>
                    <option value="manager" className="bg-gray-800 text-white">Manager</option>
                    <option value="admin" className="bg-gray-800 text-white">Admin</option>
                  </select>
                  <p className="text-white/60 text-xs mt-2">
                    Controls access to admin panel features
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    POS Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.roleInPOS}
                    onChange={(e) =>
                      updateFormData("roleInPOS", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:bg-white/5 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-white/15 ${
                      errors.roleInPOS
                        ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                        : ""
                    }`}
                  >
                    <option value="counter" className="bg-gray-800 text-white">Counter Staff</option>
                    <option value="pharmacist" className="bg-gray-800 text-white">Pharmacist</option>
                    <option value="manager" className="bg-gray-800 text-white">Store Manager</option>
                    <option value="admin" className="bg-gray-800 text-white">System Admin</option>
                  </select>
                  <p className="text-white/60 text-xs mt-2">
                    Role in the main POS system (required for login)
                  </p>
                  {errors.roleInPOS && (
                    <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.roleInPOS}</span>
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-3 text-white">
                    Organization <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.organizationId}
                    onChange={(e) =>
                      updateFormData("organizationId", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:bg-white/5 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-white/15 ${
                      errors.organizationId
                        ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50"
                        : ""
                    }`}
                  >
                    <option value="" className="bg-gray-800 text-white">Select Organization</option>
                    {organizations?.map((org: Organization) => (
                      <option key={org.id} value={org.id} className="bg-gray-800 text-white">
                        {org.name} ({org.code})
                      </option>
                    ))}
                  </select>
                  {errors.organizationId && (
                    <p className="text-red-400 text-xs mt-2 flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{errors.organizationId}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Access Control Tab */}
            {activeTab === "access" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Subscription Status
                  </label>
                  <select
                    value={formData.subscriptionStatus}
                    onChange={(e) =>
                      updateFormData("subscriptionStatus", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:bg-white/5 disabled:cursor-not-allowed backdrop-blur-sm hover:bg-white/15"
                  >
                    <option value="pending" className="bg-gray-800 text-white">Pending</option>
                    <option value="active" className="bg-gray-800 text-white">Active</option>
                    <option value="suspended" className="bg-gray-800 text-white">Suspended</option>
                    <option value="expired" className="bg-gray-800 text-white">Expired</option>
                  </select>
                </div>



                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isTrialUser}
                        onChange={(e) =>
                          updateFormData("isTrialUser", e.target.checked)
                        }
                        disabled={createUser.isPending}
                        className="mr-3 h-5 w-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500/50 focus:ring-2 disabled:opacity-50"
                      />
                      <div>
                        <span className="text-sm font-medium text-white">
                          Trial User
                        </span>
                        <p className="text-xs text-white/60 mt-1">User is on trial period</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          updateFormData("isActive", e.target.checked)
                        }
                        disabled={createUser.isPending}
                        className="mr-3 h-5 w-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500/50 focus:ring-2 disabled:opacity-50"
                      />
                      <div>
                        <span className="text-sm font-medium text-white">
                          Active Account
                        </span>
                        <p className="text-xs text-white/60 mt-1">Account is active and can login</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isEmailVerified}
                        onChange={(e) =>
                          updateFormData("isEmailVerified", e.target.checked)
                        }
                        disabled={createUser.isPending}
                        className="mr-3 h-5 w-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500/50 focus:ring-2 disabled:opacity-50"
                      />
                      <div>
                        <span className="text-sm font-medium text-white">
                          Email Verified
                        </span>
                        <p className="text-xs text-white/60 mt-1">Email address is verified</p>
                      </div>
                    </label>

                    <label className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.twoFactorEnabled}
                        onChange={(e) =>
                          updateFormData("twoFactorEnabled", e.target.checked)
                        }
                        disabled={createUser.isPending}
                        className="mr-3 h-5 w-5 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500/50 focus:ring-2 disabled:opacity-50"
                    />
                       <div>
                         <span className="text-sm font-medium text-white">
                           Two Factor Enabled
                         </span>
                         <p className="text-xs text-white/60 mt-1">2FA authentication enabled</p>
                       </div>
                     </label>
                   </div>
                 </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Theme
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => updateFormData("theme", e.target.value)}
                    disabled={createUser.isPending}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="light" className="bg-gray-800 text-white">Light</option>
                    <option value="dark" className="bg-gray-800 text-white">Dark</option>
                    <option value="auto" className="bg-gray-800 text-white">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => updateFormData("language", e.target.value)}
                    disabled={createUser.isPending}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="en" className="bg-gray-800 text-white">English</option>
                    <option value="es" className="bg-gray-800 text-white">Spanish</option>
                    <option value="fr" className="bg-gray-800 text-white">French</option>
                    <option value="de" className="bg-gray-800 text-white">German</option>
                    <option value="hi" className="bg-gray-800 text-white">Hindi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => updateFormData("timezone", e.target.value)}
                    disabled={createUser.isPending}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="UTC" className="bg-gray-800 text-white">UTC</option>
                    <option value="America/New_York" className="bg-gray-800 text-white">Eastern Time</option>
                    <option value="America/Chicago" className="bg-gray-800 text-white">Central Time</option>
                    <option value="America/Denver" className="bg-gray-800 text-white">Mountain Time</option>
                    <option value="America/Los_Angeles" className="bg-gray-800 text-white">Pacific Time</option>
                    <option value="Asia/Kolkata" className="bg-gray-800 text-white">India Standard Time</option>
                    <option value="Europe/London" className="bg-gray-800 text-white">London Time</option>
                  </select>
                </div>

                <InputField
                  label="Created By"
                  name="createdBy"
                  value={formData.createdBy}
                  onChange={(value) => updateFormData("createdBy", value)}
                  placeholder="Current admin"
                  helpText="Auto-filled with current admin"
                  disabled={true}
                />

                <InputField
                  label="Approved By"
                  name="approvedBy"
                  value={formData.approvedBy}
                  onChange={(value) => updateFormData("approvedBy", value)}
                  placeholder="Current admin"
                  helpText="Auto-filled with current admin"
                  disabled={true}
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
                  <label className="block text-sm font-medium mb-2 text-white">
                    Deactivation Reason
                  </label>
                  <textarea
                    value={formData.deactivationReason}
                    onChange={(e) =>
                      updateFormData("deactivationReason", e.target.value)
                    }
                    disabled={createUser.isPending}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    rows={3}
                    placeholder="Reason for future deactivation (if applicable)"
                  />
                  <p className="text-white/60 text-xs mt-1">
                    Only needed if user will be deactivated
                  </p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
              <div className="text-sm text-white/60">
                Fields marked with * are required
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={createUser.isPending}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all duration-200 font-medium"
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
