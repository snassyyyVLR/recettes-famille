import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

/** Renvoie les initiales d'un prénom/nom (ex. "Marie" -> "M") */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const initials = parts.map((p) => p.charAt(0).toUpperCase()).join("");
  return initials || "?";
}

/** Date courte pour les cartes (ex. "12 nov. 2026") */
export function formatRecipeDate(timestamp: Timestamp | null): string {
  if (!timestamp) return "À l'instant";
  try {
    return format(timestamp.toDate(), "d MMM yyyy", { locale: fr });
  } catch {
    return "";
  }
}

/** Date longue pour la vue détaillée (ex. "12 novembre 2026") */
export function formatRecipeDateLong(timestamp: Timestamp | null): string {
  if (!timestamp) return "Tout juste partagée";
  try {
    return format(timestamp.toDate(), "d MMMM yyyy", { locale: fr });
  } catch {
    return "";
  }
}
