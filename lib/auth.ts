// lib/auth.ts
/**
 * Authentication utility functions for JWT token management
 */

interface DecodedToken {
    userId: number;
    username: string;
    role_id: number;
    exp: number;
    iat: number;
}

/**
 * Get JWT token from localStorage
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

/**
 * Decode JWT token without verification (client-side only)
 * Note: This doesn't verify the signature, just decodes the payload
 */
const decodeToken = (token: string): DecodedToken | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

/**
 * Clear all authentication data including cookies
 */
export const clearAuth = (): void => {
    if (typeof window === 'undefined') return;

    console.log('🧹 Clearing all auth data...');

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth-storage');

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear cookie by setting it to expire in the past
    // Try multiple variations to ensure it's cleared
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'token=; path=/; max-age=0;';
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    console.log('✅ Auth data cleared');
};

/**
 * Validate token and return decoded data
 * Returns null if token is missing or expired
 */
export const validateToken = (): DecodedToken | null => {
    const token = getToken();
    if (!token) return null;

    if (isTokenExpired(token)) {
        clearAuth();
        return null;
    }

    return decodeToken(token);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return validateToken() !== null;
};
