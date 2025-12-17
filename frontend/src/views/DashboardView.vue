<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">WeBudget</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-700">
              Bonjour, <strong>{{ authStore.user?.name }}</strong>
            </span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Tableau de bord
            </h3>
            <div class="mt-5">
              <dl class="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <!-- Carte utilisateur -->
                <div class="bg-blue-50 overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-blue-900 truncate">
                      Profil utilisateur
                    </dt>
                    <dd class="mt-1 text-3xl font-semibold text-blue-600">
                      {{ authStore.user?.role }}
                    </dd>
                    <dd class="mt-2 text-sm text-blue-700">
                      {{ authStore.user?.email }}
                    </dd>
                  </div>
                </div>

                <!-- Badge vérifié -->
                <div class="bg-green-50 overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-green-900 truncate">
                      Email vérifié
                    </dt>
                    <dd class="mt-1 text-3xl font-semibold text-green-600">
                      {{ authStore.user?.emailVerified ? 'Oui' : 'Non' }}
                    </dd>
                  </div>
                </div>

                <!-- Token actif -->
                <div class="bg-purple-50 overflow-hidden shadow rounded-lg">
                  <div class="px-4 py-5 sm:p-6">
                    <dt class="text-sm font-medium text-purple-900 truncate">
                      Session active
                    </dt>
                    <dd class="mt-1 text-3xl font-semibold text-purple-600">
                      ✓ Connecté
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Message de bienvenue -->
        <div class="mt-8 bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Bienvenue sur WeBudget ! 🎉
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Votre système d'authentification est maintenant opérationnel. Vous êtes connecté avec succès !
              </p>
            </div>
            <div class="mt-5">
              <p class="text-sm text-gray-700">
                <strong>Prochaines fonctionnalités :</strong>
              </p>
              <ul class="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Gestion des comptes personnels et partagés</li>
                <li>Suivi des transactions et dépenses</li>
                <li>Événements et dépenses partagées</li>
                <li>Messagerie et notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>
