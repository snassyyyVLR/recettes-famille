"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { deleteRecipe, getFirebaseErrorMessage, type Recipe } from "@/lib/firebase";
import { formatRecipeDateLong, getInitials } from "@/lib/recipe-utils";
import { CalendarDays, Heart, Loader2, Trash2, UtensilsCrossed } from "lucide-react";

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDetailDialog({
  recipe,
  open,
  onOpenChange,
}: RecipeDetailDialogProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  if (!recipe) return null;

  const handleDelete = async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      toast({
        title: "Recette supprimée",
        description: `« ${recipe.titre} » a été retirée du carnet.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Suppression impossible",
        description: getFirebaseErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {recipe.image ? (
          <div className="overflow-hidden rounded-xl">
            <img
              src={recipe.image}
              alt={`Photo de : ${recipe.titre}`}
              className="max-h-80 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100">
            <UtensilsCrossed className="size-10 text-orange-300/80" aria-hidden />
          </div>
        )}

        <DialogHeader className="gap-3">
          <DialogTitle className="text-left font-serif text-2xl font-bold leading-tight sm:text-3xl">
            {recipe.titre}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Avatar className="size-6 border border-primary/20">
                <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                  {getInitials(recipe.nom)}
                </AvatarFallback>
              </Avatar>
              Par {recipe.nom}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" aria-hidden />
              {formatRecipeDateLong(recipe.createdAt)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="whitespace-pre-line rounded-xl bg-secondary/50 p-4 text-[15px] leading-relaxed text-foreground/90">
          {recipe.description}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Heart className="size-4 fill-primary text-primary" aria-hidden />
            Partagée avec amour
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette recette ?</AlertDialogTitle>
                <AlertDialogDescription>
                  « {recipe.titre} » sera définitivement retirée du carnet de
                  famille. Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Suppression...
                    </>
                  ) : (
                    "Oui, supprimer"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
