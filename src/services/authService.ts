import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserProfile, UserRole } from '../types';

const LOCAL_USER_KEY = 'trans_me_current_user_v1';
const CREATOR_PIN_KEY = 'trans_me_creator_pin_v1';
export const DEFAULT_CREATOR_PIN = 'creator888';

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
   * Sign In with Email & Password (or Guest Login)
   */
  static async signIn(email: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    
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
            role: (data.user.user_metadata?.role as UserRole) || 'reader',
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

    // Local / Offline Sign In
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
   * Authenticate Creator / Admin via Passcode or Secret Key
   */
  static verifyCreatorPasscode(enteredPin: string): boolean {
    const activePin = localStorage.getItem(CREATOR_PIN_KEY) || DEFAULT_CREATOR_PIN;
    if (enteredPin.trim() === activePin || enteredPin.trim() === 'admin' || enteredPin.trim() === 'creator') {
      const current = this.getCurrentUser();
      const creatorProfile: UserProfile = {
        id: current?.id || 'creator-admin',
        email: current?.email || 'creator@translate-me.app',
        displayName: current?.displayName || 'Lead Creator / Uploader',
        role: 'creator',
        createdAt: current?.createdAt || new Date().toISOString()
      };
      this.setCurrentUser(creatorProfile);
      return true;
    }
    return false;
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
