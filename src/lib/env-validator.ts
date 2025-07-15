import { z } from 'zod';

const EnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, 'Supabase anon key is too short'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'Service role key is too short'),
  NEXT_PUBLIC_APP_NAME: z.string().default('POS Admin Panel'),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().optional()
});

export function validateEnvironment(env: Record<string, string | undefined>) {
  try {
    const validatedEnv = EnvSchema.parse(env);
    console.log('✅ Environment configuration validated successfully');
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Environment Validation Errors:', errorMessages);
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

export type ValidatedEnv = z.infer<typeof EnvSchema>;

// Runtime Environment Check
export function checkEnvironmentCompatibility() {
  const currentEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    runtime: process.version,
    platform: process.platform,
  };

  console.log("🌐 Runtime Environment:", currentEnv);

  // Compatibility checks
  const MIN_NODE_VERSION = "18.0.0";
  const compatiblePlatforms = ["darwin", "linux"];

  if (!compatiblePlatforms.includes(process.platform)) {
    console.warn(
      `⚠️ Potential platform compatibility issue: ${process.platform}`
    );
  }

  // Version check
  const [major, minor] = process.version
    .replace("v", "")
    .split(".")
    .map(Number);
  const [minMajor, minMinor] = MIN_NODE_VERSION.split(".").map(Number);

  if (major < minMajor || (major === minMajor && minor < minMinor)) {
    console.warn(
      `⚠️ Node.js version (${process.version}) is below recommended ${MIN_NODE_VERSION}`
    );
  }
}

// Validate on import
if (typeof window === "undefined") {
  try {
    validateEnvironment(process.env);
    checkEnvironmentCompatibility();
  } catch (error) {
    console.error("Fatal Environment Configuration Error:", error);
    process.exit(1);
  }
}
