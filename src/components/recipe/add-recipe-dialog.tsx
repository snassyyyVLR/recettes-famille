"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addRecipe, getFirebaseErrorMessage } from "@/lib/firebase";
import { compressImage } from "@/lib/image";
import {
  ChefHat,
  ImagePlus,
  Loader2,
  PenLine,
  RotateCcw,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormErrors {
  nom?: string;
  titre?: string;
  description?: string;
}

export function AddRecipeDialog({ open, onOpenChange }: AddRecipeDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nom, setNom] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const resetForm = () => {
    setNom("");
    setTitre("");
    setDescription("");
    setImage(null);
    setErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (submitting) return;
    onOpenChange(next);
    if (!next) resetForm();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Photo ignorée",
        description: "Choisissez une image (JPG, PNG, WebP...).",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({
        title: "Photo trop lourde",
        description: "Choisissez une photo de moins de 15 Mo.",
        variant: "destructive",
      });
      return;
    }
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
    } catch {
      toast({
        title: "Photo ignorée",
        description: "Impossible de lire cette image.",
        variant: "destructive",
      });
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    if (!nom.trim()) nextErrors.nom = "Indiquez votre nom.";
    if (!titre.trim()) nextErrors.titre = "Donnez un titre à la recette.";
    if (description.trim().length < 10) {
      nextErrors.description = "Décrivez la recette (au moins 10 caractères).";
    }
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await addRecipe({ titre, nom, description, image });
      toast({
        title: "Recette partagée !",
        description: `Merci ${nom.trim()}, « ${titre.trim()} » rejoint le carnet de famille.`,
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Impossible d'enregistrer la recette",
        description: getFirebaseErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-2xl">
            <ChefHat className="size-6 text-primary" aria-hidden />
            Partager une recette
          </DialogTitle>
          <DialogDescription>
            Ajoutez un plat au carnet de la famille. Aucun compte nécessaire.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
          {/* Ton nom */}
          <div className="grid gap-2">
            <Label htmlFor="nom">
              Ton nom <span className="text-primary">*</span>
            </Label>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex. Mamie Jeanne"
                className="h-11 rounded-xl pl-9"
                aria-invalid={Boolean(errors.nom)}
                autoComplete="name"
                maxLength={60}
              />
            </div>
            {errors.nom && (
              <p className="text-sm text-destructive" role="alert">
                {errors.nom}
              </p>
            )}
          </div>

          {/* Titre */}
          <div className="grid gap-2">
            <Label htmlFor="titre">
              Titre de la recette <span className="text-primary">*</span>
            </Label>
            <div className="relative">
              <UtensilsCrossed
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="titre"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex. Tarte aux pommes de Mamie"
                className="h-11 rounded-xl pl-9"
                aria-invalid={Boolean(errors.titre)}
                maxLength={100}
              />
            </div>
            {errors.titre && (
              <p className="text-sm text-destructive" role="alert">
                {errors.titre}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              La recette <span className="text-primary">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                "Ingrédients :\n- 500 g de farine\n- 3 œufs\n\nPréparation :\n1. Mélangez tout...\n2. Enfournez 30 min à 180 °C."
              }
              className="min-h-40 rounded-xl leading-relaxed"
              aria-invalid={Boolean(errors.description)}
              maxLength={10000}
            />
            <p className="text-xs text-muted-foreground">
              Décrivez les ingrédients et les étapes, comme si vous la dictiez à un proche.
            </p>
            {errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {errors.description}
              </p>
            )}
          </div>

          {/* Photo (facultatif) */}
          <div className="grid gap-2">
            <Label htmlFor="photo">Photo du plat (facultatif)</Label>
            <input
              ref={fileInputRef}
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />

            {image ? (
              <div className="grid gap-2">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={image}
                    alt="Aperçu de la photo choisie"
                    className="max-h-56 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    aria-label="Retirer la photo"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Changer la photo
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-4 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-60"
              >
                {compressing ? (
                  <>
                    <Loader2 className="size-6 animate-spin" aria-hidden />
                    <span className="text-sm">Préparation de la photo...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-6" aria-hidden />
                    <span className="text-sm font-medium">
                      Ajouter une photo du plat
                    </span>
                    <span className="text-xs">
                      Depuis votre galerie ou votre appareil photo
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Boutons */}
          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6"
              disabled={submitting || compressing}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Enregistrement...
                </>
              ) : (
                <>
                  <PenLine className="size-4" aria-hidden />
                  Partager la recette
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
