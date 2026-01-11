import { createClient } from '@supabase/supabase-js';

/**
 * URL bazy danych Supabase z zmiennych środowiskowych
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
/**
 * Klucz anonimowy Supabase z zmiennych środowiskowych
 */
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Instancja klienta Supabase
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Typ bazy danych Supabase z typowaniem dla tabel
 */
export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          amount: number;
          currency: string;
          paid_by: string;
          participants: string[];
          created_at: string;
          archived: boolean;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          amount: number;
          currency?: string;
          paid_by: string;
          participants: string[];
          created_at?: string;
          archived?: boolean;
        };
        Update: {
          id?: string;
          group_id?: string;
          name?: string;
          amount?: number;
          currency?: string;
          paid_by?: string;
          participants?: string[];
          created_at?: string;
          archived?: boolean;
        };
      };
    };
  };
}
