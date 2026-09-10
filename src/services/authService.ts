import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserProfile } from '../types';

const LOCAL_USER_KEY = 'trans_me_current_user_v1';
const CREATOR_PIN_KEY = 'trans_me_creator_pin_v1';
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admind';

export class AuthService {
  /**
   * Get currently logged-in user profile (from LocalStorage or Supabase)
   */
  static getCurrentUser(): UserProfile | null {
    const data = localStorage.getItem(LOCAL_USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Save user session locally
   */
  static setCurrentUser(user: UserProfile | null): void {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
  }

  /**
   * Sign In with Email/Username & Password (or Guest Login)
   */
  static async signIn(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Check if logging in as Admin with exclusive admin credentials
    if ((cleanEmail === ADMIN_USERNAME || cleanEmail === 'admin@translate-me.app') && cleanPass === ADMIN_PASSWORD) {
      const adminProfile: UserProfile = {
        id: 'creator-admin',
        email: 'admin@translate-me.app',
        displayName: 'Admin',
        role: 'creator',
        createdAt: new Date().toISOString()
      };
      this.setCurrentUser(adminProfile);
      return { success: true, user: adminProfile };
    }
    
    if (isSupabaseConfigured() && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            displayName: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
            role: 'reader', // Regular accounts can only be readers
            createdAt: data.user.created_at
          };
          this.setCurrentUser(profile);
          return { success: true, user: profile };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('[AuthService] Supabase sign in failed, falling back to local session:', message);
      }
    }

    // Local / Offline Reader Sign In
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0] || 'Reader',
      role: 'reader',
      createdAt: new Date().toISOString()
    };
    this.setCurrentUser(profile);
    return { success: true, user: profile };
  }

  /**
   * Sign Up Reader Account
   */
  static async signUp(email: string, password?: string, displayName?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const name = displayName?.trim() || cleanEmail.split('@')[0];

    if (isSupabaseConfigured() && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { display_name: name, role: 'reader' }
          }
        });
        if (error) throw error;
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            displayName: name,
            role: 'reader',
            createdAt: data.user.created_at
          };
          this.setCurrentUser(profile);
          return { success: true, user: profile };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('[AuthService] Supabase sign up notice:', message);
      }
    }

    // Local / Offline Sign Up
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      displayName: name,
      role: 'reader',
      createdAt: new Date().toISOString()
    };
    this.setCurrentUser(profile);
    return { success: true, user: profile };
  }

  /**
   * Authenticate Creator / Admin via exclusive admin / admind credentials
   */
  static verifyAdminCredentials(username: string, password?: string): boolean {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (cleanUser === ADMIN_USERNAME && cleanPass === ADMIN_PASSWORD) {
      const adminProfile: UserProfile = {
        id: 'creator-admin',
        email: 'admin@translate-me.app',
        displayName: 'Admin',
        role: 'creator',
        createdAt: new Date().toISOString()
      };
      this.setCurrentUser(adminProfile);
      return true;
    }
    return false;
  }

  /**
   * Legacy Passcode compatibility helper
   */
  static verifyCreatorPasscode(enteredPin: string): boolean {
    return this.verifyAdminCredentials('admin', enteredPin);
  }

  /**
   * Update Creator Passcode
   */
  static setCreatorPasscode(newPin: string): void {
    if (newPin.trim()) {
      localStorage.setItem(CREATOR_PIN_KEY, newPin.trim());
    }
  }

  /**
   * Sign Out
   */
  static async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[AuthService] Supabase sign out warning:', e);
      }
    }
    this.setCurrentUser(null);
  }
}
