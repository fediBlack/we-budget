<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- En-tête -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">WeBudget</h1>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ou
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            créez un nouveau compte
          </router-link>
        </p>
      </div>

      <!-- Formulaire -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- Message d'erreur -->
        <Alert
          v-if="authStore.error"
          variant="error"
          :title="authStore.error"
        />

        <!-- Champs -->
        <div class="space-y-4">
          <Input
            v-model="form.email"
            type="email"
            label="Adresse email"
            placeholder="vous@exemple.com"
            required
            autocomplete="email"
          />

          <Input
            v-model="form.password"
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <!-- Bouton -->
        <div>
          <Button
            type="submit"
            :loading="authStore.loading"
            :disabled="authStore.loading"
            class="w-full"
          >
            Se connecter
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Button, Input, Alert } from 'vue3-ui-kit';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});

async function handleLogin() {
  try {
    await authStore.login(form);
    // Redirection vers le dashboard après connexion
    router.push('/dashboard');
  } catch (error) {
    // L'erreur est déjà gérée par le store
  }
}
</script>
