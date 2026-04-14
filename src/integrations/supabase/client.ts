// This file has been hollowed out for the MongoDB migration.
// Supabase logic has been replaced with the custom Flask API.
// Redirecting all calls through a mock to prevent frontend crashes.

const mockClient: any = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => { throw new Error("Supabase is disabled. Use custom auth."); },
    signUp: async () => { throw new Error("Supabase is disabled. Use custom auth."); },
    signOut: async () => {},
    getUser: async () => ({ data: { user: null }, error: null }),
    resetPasswordForEmail: async () => { throw new Error("Use custom auth."); },
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error("Supabase is disabled.") }),
        order: () => ({ limit: () => ({ execute: async () => ({ data: [], error: null }) }) }),
      }),
      order: () => ({ limit: () => ({ execute: async () => ({ data: [], error: null }) }) }),
    }),
    insert: () => ({ execute: async () => ({ data: null, error: new Error("Supabase disabled.") }) }),
  }),
};

export const supabase = mockClient;