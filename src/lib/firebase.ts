"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Configuration Firebase fournie par la famille
const firebaseConfig = {
  apiKey: "AIzaSyCityR0Qv8lmTJ-aKg3KrH_Dsh3Ovi_BBo",
  authDomain: "recettes-famille-8c83c.firebaseapp.com",
  projectId: "recettes-famille-8c83c",
  storageBucket: "recettes-famille-8c83c.firebasestorage.app",
  messagingSenderId: "25368964076",
  appId: "1:25368964076:web:32fa65e7f9a8b196856ec9",
  measurementId: "G-L5XSCB0RZQ",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics chargé seulement si l'environnement le permet
isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {});

/** Structure d'une recette dans Firestore */
export interface Recipe {
  id: string;
  titre: string;
  nom: string;
  description: string;
  image: string | null;
  createdAt: Timestamp | null;
}

/** Données pour créer une recette (sans id ni date) */
export type NewRecipe = Omit<Recipe, "id" | "createdAt">;

/** Ajoute une recette dans la collection "recipes" */
export async function addRecipe(data: NewRecipe): Promise<void> {
  await addDoc(collection(db, "recipes"), {
    titre: data.titre.trim(),
    nom: data.nom.trim(),
    description: data.description.trim(),
    image: data.image,
    createdAt: serverTimestamp(),
  });
}

/** Supprime une recette par son id */
export async function deleteRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, "recipes", id));
}

/**
 * S'abonne aux recettes en temps réel.
 * Tri côté client : les recettes sans date (à l'instant T) apparaissent en premier,
 * puis de la plus récente à la plus ancienne.
 */
export function subscribeRecipes(
  onData: (recipes: Recipe[]) => void,
  onError: (error: Error) => void
): () => void {
  const col = collection(db, "recipes");
  return onSnapshot(
    col,
    (snapshot) => {
      const recipes = snapshot.docs.map((d) => {
        const data = (d.data() ?? {}) as Partial<Omit<Recipe, "id">>;
        return {
          id: d.id,
          titre: data.titre ?? "Recette sans titre",
          nom: data.nom ?? "Anonyme",
          description: data.description ?? "",
          image: data.image ?? null,
          createdAt: data.createdAt ?? null,
        } satisfies Recipe;
      });
      recipes.sort((a, b) => {
        const ta = a.createdAt?.toMillis() ?? Number.MAX_SAFE_INTEGER;
        const tb = b.createdAt?.toMillis() ?? Number.MAX_SAFE_INTEGER;
        return tb - ta;
      });
      onData(recipes);
    },
    onError
  );
}

/** Traduit une erreur Firestore en message compréhensible */
export function getFirebaseErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";
  switch (code) {
    case "permission-denied":
      return "Accès refusé à la base de données. Ouvrez la console Firebase, section Firestore Database > Règles, et autorisez la lecture/écriture de la collection \"recipes\".";
    case "unavailable":
      return "Connexion à Firestore impossible pour le moment. Vérifiez votre connexion internet et réessayez.";
    case "not-found":
    case "failed-precondition":
      return "La base de données Firestore n'est pas encore créée. Créez-la dans la console Firebase (Firestore Database > Créer une base de données).";
    case "resource-exhausted":
      return "Le quota gratuit de Firestore est atteint. Réessayez plus tard.";
    default:
      return "Une erreur est survenue. Vérifiez la configuration Firebase et votre connexion internet.";
  }
}
