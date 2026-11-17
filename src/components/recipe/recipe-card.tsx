"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, UtensilsCrossed } from "lucide-react";
import type { Recipe } from "@/lib/firebase";
import { formatRecipeDate, getInitials } from "@/lib/recipe-utils";

interface RecipeCardProps {
  recipe: Recipe;
  onOpen: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onOpen }: RecipeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(recipe)}
      aria-label={`Voir la recette : ${recipe.titre}, partagée par ${recipe.nom}`}
      className="group h-full w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <Card className="h-full gap-0 overflow-hidden rounded-xl border-border/70 py-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/10">
        {/* Image ou joli fond de remplacement */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={`Photo de : ${recipe.titre}`}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 transition-transform duration-500 group-hover:scale-105">
              <UtensilsCrossed
                className="size-10 text-orange-300/80"
                aria-hidden
              />
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-2.5 p-4">
          <h3 className="line-clamp-1 font-serif text-lg font-semibold leading-snug text-foreground">
            {recipe.titre}
          </h3>

          <div className="flex items-center gap-2">
            <Avatar className="size-6 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                {getInitials(recipe.nom)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm text-muted-foreground">
              Par {recipe.nom}
            </span>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/90">
            {recipe.description}
          </p>

          <p className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-muted-foreground/70">
            <Clock className="size-3" aria-hidden />
            {formatRecipeDate(recipe.createdAt)}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
