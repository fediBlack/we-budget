import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/client';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const useAuthStore = defineStore('auth', () => {
  // 🔐 État
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ✅ Getters
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isPremium = computed(() => user.value?.role === 'PREMIUM');

  // 📝 Actions

  /**
   * Enregistrer un nouvel utilisateur
   */
  async function register(credentials: RegisterCredentials) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', credentials);
      
      // Sauvegarder les tokens et l'utilisateur
      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      return data.user;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Connecter un utilisateur
   */
  async function login(credentials: LoginCredentials) {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);

      user.value = data.user;
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      return data.user;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Email ou mot de passe incorrect';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Déconnecter l'utilisateur
   */
  async function logout() {
    loading.value = true;
    error.value = null;

    try {
      // Appeler l'API pour supprimer les refresh tokens
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      // Nettoyer l'état local même si l'API échoue
      user.value = null;
      accessToken.value = null;
      refreshToken.value = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      loading.value = false;
    }
  }

  /**
   * Récupérer les infos de l'utilisateur connecté
   */
  async function fetchCurrentUser() {
    if (!accessToken.value) {
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const { data } = await apiClient.get<User>('/auth/me');
      user.value = data;
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Session expirée';
      // Si 401, déconnecter
      if (err.response?.status === 401) {
        await logout();
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Initialiser le store au chargement de l'app
   */
  async function initialize() {
    if (accessToken.value) {
      try {
        await fetchCurrentUser();
      } catch {
        // Si échec, les tokens seront nettoyés par fetchCurrentUser
      }
    }
  }

  return {
    // État
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isPremium,
    // Actions
    register,
    login,
    logout,
    fetchCurrentUser,
    initialize,
  };
});
