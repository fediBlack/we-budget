<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- En-tête -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">WeBudget</h1>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ou
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            connectez-vous à votre compte existant
          </router-link>
        </p>
      </div>

      <!-- Formulaire -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- Message d'erreur -->
        <Alert
          v-if="authStore.error"
          variant="error"
          :title="authStore.error"
        />

        <!-- Message de succès -->
        <Alert
          v-if="successMessage"
          variant="success"
          :title="successMessage"
        />

        <!-- Champs -->
        <div class="space-y-4">
          <Input
            v-model="form.name"
            type="text"
            label="Nom complet"
            placeholder="Jean Dupont"
            required
            autocomplete="name"
          />

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
            autocomplete="new-password"
            :error="form.password && form.password.length < 8 ? 'Minimum 8 caractères' : ''"
          />

          <Input
            v-model="form.confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            required
            autocomplete="new-password"
            :error="passwordMismatch ? 'Les mots de passe ne correspondent pas' : ''"
          />
        </div>

        <!-- Bouton -->
        <div>
          <Button
            type="submit"
            :loading="authStore.loading"
            :disabled="authStore.loading || passwordMismatch"
            class="w-full"
          >
            Créer mon compte
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Button, Input, Alert } from 'vue3-ui-kit';

const router = useRouter();
const authStore = useAuthStore();
const successMessage = ref('');

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const passwordMismatch = computed(() => {
  return form.password && form.confirmPassword && form.password !== form.confirmPassword;
});

async function handleRegister() {
  if (passwordMismatch.value) {
    return;
  }

  try {
    await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    successMessage.value = 'Compte créé avec succès ! Redirection...';
    
    // Redirection après un court délai
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  } catch (error) {
    // L'erreur est déjà gérée par le store
  }
}
</script>
