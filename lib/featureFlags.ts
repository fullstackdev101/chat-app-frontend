// Feature flags configuration
export const FEATURES = {
    PAGINATION_ENABLED:
        process.env.NEXT_PUBLIC_PAGINATION_ENABLED === "true" || false,
};

// Helper to check if pagination should be used
export const usePagination = (): boolean => {
    return FEATURES.PAGINATION_ENABLED;
};
