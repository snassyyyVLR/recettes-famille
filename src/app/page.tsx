"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddRecipeDialog } from "@/components/recipe/add-recipe-dialog";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { RecipeDetailDialog } from "@/components/recipe/recipe-detail-dialog";
import {
  getFirebaseErrorMessage,
  subscribeRecipes,
  type Recipe,
} from "@/lib/firebase";
import { getInitials } from "@/lib/recipe-utils";
import {
  BookOpen,
  Carrot,
  ChefHat,
  Cherry,
  CookingPot,
  Croissant,
  Heart,
  IceCreamCone,
  Plus,
  Salad,
  Search,
  SearchX,
  Sparkles,
  TriangleAlert,
  Users,
  UtensilsCrossed,
} from "lucide-react";

type SortKey = "recent" | "ancien" | "az" | "za";

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Recipe | null>(null);

  // Abonnement temps réel aux recettes de la famille
  useEffect(() => {
    const unsubscribe = subscribeRecipes(
      (data) => {
        setRecipes(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(getFirebaseErrorMessage(err));
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const authors = useMemo(() => {
    const counts = new Map<string, number>();
    recipes.forEach((r) =>
      counts.set(r.nom, (counts.get(r.nom) ?? 0) + 1)
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([nom, count]) => ({ nom, count }));
  }, [recipes]);

  const visible = useMemo(() => {
    let list = recipes;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.titre, r.nom, r.description].some((field) =>
          field.toLowerCase().includes(q)
        )
      );
    }
    if (authorFilter) list = list.filter((r) => r.nom === authorFilter);

    const sorted = [...list];
    switch (sort) {
      case "ancien":
        sorted.reverse();
        break;
      case "az":
        sorted.sort((a, b) => a.titre.localeCompare(b.titre, "fr"));
        break;
      case "za":
        sorted.sort((a, b) => b.titre.localeCompare(a.titre, "fr"));
        break;
    }
    return sorted;
  }, [recipes, search, sort, authorFilter]);

  const isFiltered = Boolean(search.trim() || authorFilter);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* En-tête */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-700 text-white shadow-md shadow-primary/30">
              <ChefHat className="size-5" aria-hidden />
            </div>
            <div className="leading-tight">
              <p className="font-serif text-lg font-bold">Recettes Famille</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Le carnet de toute la famille
              </p>
            </div>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="h-10 rounded-full px-4 shadow-md shadow-primary/25 sm:px-5"
          >
            <Plus className="size-4" aria-hidden />
            <span className="hidden sm:inline">Ajouter une recette</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Héros */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-secondary/50 to-background">
          {/* Icônes décoratives */}
          <div
            className="pointer-events-none absolute inset-0 hidden md:block"
            aria-hidden
          >
            <Carrot className="absolute left-[8%] top-10 size-10 -rotate-12 text-orange-300/50" />
            <Croissant className="absolute right-[10%] top-16 size-10 rotate-12 text-amber-400/40" />
            <CookingPot className="absolute bottom-8 left-[15%] size-9 rotate-6 text-rose-300/50" />
            <Cherry className="absolute bottom-14 right-[16%] size-9 -rotate-6 text-rose-400/40" />
            <Salad className="absolute left-[45%] top-6 size-8 rotate-45 text-lime-500/30" />
            <IceCreamCone className="absolute bottom-6 right-[38%] size-8 -rotate-12 text-orange-300/40" />
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6 sm:py-20">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/25 bg-white/70 px-4 py-1.5 text-sm text-primary shadow-sm backdrop-blur"
            >
              <Sparkles className="size-3.5" aria-hidden />
              Le carnet de recettes de la famille
            </Badge>

            <h1 className="text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Nos recettes,{" "}
              <span className="italic text-primary">notre famille</span>
            </h1>

            <p className="max-w-2xl text-pretty text-base leading-relaxed text-foreground/70 sm:text-lg">
              Les plats du dimanche, les desserts de fête et les petits secrets
              de cuisine : tout est réuni ici, partagé par ceux qu&apos;on aime.
            </p>

            <Button
              size="lg"
              onClick={() => setAddOpen(true)}
              className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/25"
            >
              <Plus className="size-5" aria-hidden />
              Partager une recette
            </Button>

            {!loading && !error && (
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" aria-hidden />
                  {recipes.length} recette{recipes.length > 1 ? "s" : ""} dans
                  le carnet
                </span>
                <span className="flex items-center gap-2">
                  <Users className="size-4 text-primary" aria-hidden />
                  {authors.length} cuisinier{authors.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Recettes */}
        <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Barre d'outils */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une recette ou un cuisinier..."
                  aria-label="Rechercher une recette"
                  className="h-11 rounded-full bg-white pl-10 shadow-sm"
                />
              </div>
              <Select
                value={sort}
                onValueChange={(value) => setSort(value as SortKey)}
              >
                <SelectTrigger
                  aria-label="Trier les recettes"
                  className="h-11 w-full rounded-full bg-white shadow-sm sm:w-52"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récentes</SelectItem>
                  <SelectItem value="ancien">Plus anciennes</SelectItem>
                  <SelectItem value="az">Titre (A à Z)</SelectItem>
                  <SelectItem value="za">Titre (Z à A)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par cuisinier */}
            {authors.length > 0 && (
              <div
                className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="Filtrer par cuisinier"
              >
                <button
                  type="button"
                  onClick={() => setAuthorFilter(null)}
                  aria-pressed={authorFilter === null}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    authorFilter === null
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  Toutes
                </button>
                {authors.map(({ nom, count }) => (
                  <button
                    key={nom}
                    type="button"
                    onClick={() =>
                      setAuthorFilter(authorFilter === nom ? null : nom)
                    }
                    aria-pressed={authorFilter === nom}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      authorFilter === nom
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[9px] font-bold ${
                        authorFilter === nom
                          ? "bg-white/25"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {getInitials(nom)}
                    </span>
                    {nom}
                    <span
                      className={
                        authorFilter === nom ? "opacity-80" : "text-muted-foreground/60"
                      }
                    >
                      ({count})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="mt-6 sm:mt-8">
            {error ? (
              <Alert className="rounded-xl border-destructive/30 bg-destructive/5">
                <TriangleAlert className="size-5 text-destructive" aria-hidden />
                <AlertTitle className="text-destructive">
                  Impossible de charger le carnet de recettes
                </AlertTitle>
                <AlertDescription className="leading-relaxed">
                  {error}
                </AlertDescription>
              </Alert>
            ) : loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <Skeleton className="aspect-[4/3] rounded-none" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-white/60 px-6 py-16 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-rose-100">
                  {isFiltered ? (
                    <SearchX className="size-7 text-primary/70" aria-hidden />
                  ) : (
                    <UtensilsCrossed className="size-7 text-primary/70" aria-hidden />
                  )}
                </div>
                {isFiltered ? (
                  <>
                    <h2 className="font-serif text-xl font-semibold">
                      Aucune recette trouvée
                    </h2>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Aucun résultat pour « {search.trim() || authorFilter} ».
                      Essayez un autre mot ou regardez toutes les recettes.
                    </p>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => {
                        setSearch("");
                        setAuthorFilter(null);
                      }}
                    >
                      Voir toutes les recettes
                    </Button>
                  </>
                ) : (
                  <>
                    <h2 className="font-serif text-xl font-semibold">
                      Le carnet est encore vide
                    </h2>
                    <p className="max-w-md text-sm text-muted-foreground">
                      Soyez la première personne à partager une recette :
                      un plat signature, un dessert de fête ou un classique
                      de famille !
                    </p>
                    <Button
                      className="rounded-full"
                      onClick={() => setAddOpen(true)}
                    >
                      <Plus className="size-4" aria-hidden />
                      Partager la première recette
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(index * 0.05, 0.4),
                      ease: "easeOut",
                    }}
                  >
                    <RecipeCard recipe={recipe} onOpen={setSelected} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="mt-auto border-t border-border/60 bg-secondary/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1.5 px-4 py-6 text-center sm:px-6">
          <p className="flex items-center gap-2 font-serif font-semibold text-foreground/80">
            <ChefHat className="size-4 text-primary" aria-hidden />
            Recettes Famille
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Fait avec
            <Heart
              className="size-3.5 fill-primary text-primary"
              aria-hidden
            />
            pour toute la famille
          </p>
        </div>
      </footer>

      {/* Fenêtres */}
      <AddRecipeDialog open={addOpen} onOpenChange={setAddOpen} />
      <RecipeDetailDialog
        recipe={selected}
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
      />
    </div>
  );
}
