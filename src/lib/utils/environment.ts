/**
 * Platform-agnostic environment variable access for Next.js API routes
 * Supports Cloudflare Workers, Vercel, and Node.js environments
 */

export interface EnvironmentConfig {
  HPKV_API_KEY: string;
  HPKV_API_BASE_URL: string;
}

/**
 * Gets environment variables in a platform-agnostic way
 * First tries Cloudflare context, falls back to process.env
 */
export async function getEnvironmentConfig(): Promise<EnvironmentConfig> {
  // Try Cloudflare Workers context first
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    const { env } = getCloudflareContext();
    
    if (env.HPKV_API_KEY && env.HPKV_API_BASE_URL) {
      return {
        HPKV_API_KEY: env.HPKV_API_KEY as string,
        HPKV_API_BASE_URL: env.HPKV_API_BASE_URL as string,
      };
    }
  } catch {
    // Cloudflare context not available, continue to process.env
  }
  
  // Fallback to Node.js process.env (works in Vercel and local dev)
  const apiKey = process.env.HPKV_API_KEY;
  const apiBaseUrl = process.env.HPKV_API_BASE_URL;
  
  if (!apiKey || !apiBaseUrl) {
    throw new Error('Missing required environment variables: HPKV_API_KEY and HPKV_API_BASE_URL');
  }
  
  return {
    HPKV_API_KEY: apiKey,
    HPKV_API_BASE_URL: apiBaseUrl,
  };
} 