import React, { useState, useCallback, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Spinner from '@/components/common/Spinner';
import { Building, User, Phone, Globe, Save, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import AvatarViewer from '@/components/common/AvatarViewer';

const profileSchema = z.object({
  name: z.string().min(2, "Le nom de l'entreprise est requis."),
  representative_first_name: z.string().min(2, "Le prénom est requis."),
  representative_last_name: z.string().min(2, "Le nom est requis."),
  representative_position: z.string().optional(),
  phone_number: z.string().optional(),
  website: z.string().url("Veuillez entrer une URL valide.").optional().or(z.literal('')),
  siren: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  description: z.string().optional(),
});

const ProfileTab = ({ profile, loading }) => {
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [isCityPopoverOpen, setIsCityPopoverOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      representative_first_name: '',
      representative_last_name: '',
      representative_position: '',
      phone_number: '',
      website: '',
      siren: '',
      address: '',
      city: '',
      postal_code: '',
      country: '',
      description: '',
    }
  });
  
  const getInitials = (name) => {
    if (!name) return 'E';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fetchCitySuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${query}&fields=nom,code,codesPostaux&format=json&geometry=centre`);
      const data = await response.json();
      setCitySuggestions(data);
      if (data.length > 0) {
        setIsCityPopoverOpen(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des villes:", error);
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'postal_code') {
        fetchCitySuggestions(value.postal_code);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, fetchCitySuggestions]);

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.company_name || '',
        representative_first_name: profile.representative_first_name || '',
        representative_last_name: profile.representative_last_name || '',
        representative_position: profile.representative_position || '',
        phone_number: profile.company_phone || '',
        website: profile.website || '',
        siren: profile.siren || '',
        address: profile.address || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'France',
        description: profile.company_description || '',
      });
    }
  }, [profile, form.reset]);

  const onSubmit = async (data) => {
    const { error: companyError } = await supabase
      .from('companies')
      .update({ ...data, profile_completed: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
      
    if (companyError) {
      toast({ variant: "destructive", title: "Erreur", description: `La mise à jour a échoué: ${companyError.message}` });
      return;
    }
    
    const { error: userError } = await supabase
      .from('users')
      .update({ display_name: data.name, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (userError) {
      toast({ variant: "destructive", title: "Erreur", description: `La mise à jour du nom d'utilisateur a échoué: ${userError.message}` });
    } else {
      toast({ title: "Succès", description: "Votre profil a été mis à jour." });
      await refreshProfile();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-10"><Spinner /></div>;
  }
  
  if (!profile) return null;
  
  const displayName = profile?.display_name || "Profil de l'entreprise";

  return (
    <Card>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative group">
              <AvatarViewer
                src={profile?.avatar_url}
                alt={displayName}
                fallback={getInitials(displayName)}
                triggerClassName="w-24 h-24 border-4 border-background shadow-md"
                avatarClassName="text-3xl"
              />
               <p className="text-sm text-muted-foreground mt-2 text-center max-w-[96px]">Le logo est géré par l'admin.</p>
            </div>
            <div className="flex-grow">
              <CardTitle className="text-3xl">{displayName}</CardTitle>
              <CardDescription>Gérez les informations publiques et internes de votre entreprise.</CardDescription>
               {profile && !profile.company_profile_completed && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                      <p className="font-medium">
                      Votre profil est incomplet. Pensez à le compléter pour attirer les meilleurs talents et publier des missions !
                      </p>
                  </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name"><Building className="inline-block mr-2 h-4 w-4" />Nom de l'entreprise</Label>
              <Controller name="name" control={form.control} render={({ field }) => <Input id="name" {...field} />} />
              {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siren">SIREN</Label>
              <Controller name="siren" control={form.control} render={({ field }) => <Input id="siren" {...field} />} />
              {form.formState.errors.siren && <p className="text-sm text-destructive">{form.formState.errors.siren.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="representative_first_name"><User className="inline-block mr-2 h-4 w-4" />Prénom du représentant</Label>
              <Controller name="representative_first_name" control={form.control} render={({ field }) => <Input id="representative_first_name" {...field} />} />
              {form.formState.errors.representative_first_name && <p className="text-sm text-destructive">{form.formState.errors.representative_first_name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="representative_last_name">Nom du représentant</Label>
              <Controller name="representative_last_name" control={form.control} render={({ field }) => <Input id="representative_last_name" {...field} />} />
              {form.formState.errors.representative_last_name && <p className="text-sm text-destructive">{form.formState.errors.representative_last_name.message}</p>}
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="representative_position"><UserCheck className="inline-block mr-2 h-4 w-4" />Poste du représentant (optionnel)</Label>
              <Controller name="representative_position" control={form.control} render={({ field }) => <Input id="representative_position" {...field} placeholder="Ex: CEO, CTO, Responsable RH..." />} />
              {form.formState.errors.representative_position && <p className="text-sm text-destructive">{form.formState.errors.representative_position.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number"><Phone className="inline-block mr-2 h-4 w-4" />Numéro de téléphone</Label>
              <Controller name="phone_number" control={form.control} render={({ field }) => <Input id="phone_number" {...field} type="tel" />} />
              {form.formState.errors.phone_number && <p className="text-sm text-destructive">{form.formState.errors.phone_number.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website"><Globe className="inline-block mr-2 h-4 w-4" />Site Web</Label>
              <Controller name="website" control={form.control} render={({ field }) => <Input id="website" {...field} type="url" placeholder="https://exemple.com" />} />
              {form.formState.errors.website && <p className="text-sm text-destructive">{form.formState.errors.website.message}</p>}
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Controller name="address" control={form.control} render={({ field }) => <Input id="address" {...field} />} />
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code Postal</Label>
                  <Controller name="postal_code" control={form.control} render={({ field }) => <Input id="postal_code" {...field} autoComplete="off" />} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Popover open={isCityPopoverOpen} onOpenChange={setIsCityPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Controller name="city" control={form.control} render={({ field }) => <Input id="city" {...field} autoComplete="off" />} />
                    </PopoverTrigger>
                    {citySuggestions.length > 0 && (
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher une ville..." className="h-9" />
                          <CommandEmpty>Aucune ville trouvée.</CommandEmpty>
                          <CommandGroup>
                            {citySuggestions.map((suggestion) => (
                              <CommandItem
                                key={suggestion.code}
                                value={suggestion.nom}
                                onSelect={(currentValue) => {
                                  form.setValue("city", currentValue, { shouldValidate: true });
                                  setCitySuggestions([]);
                                  setIsCityPopoverOpen(false);
                                }}
                              >
                                {suggestion.nom}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Controller name="country" control={form.control} render={({ field }) => <Input id="country" {...field} />} />
                </div>
            </div>


            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description de l'entreprise</Label>
              <Controller name="description" control={form.control} render={({ field }) => <Textarea id="description" {...field} rows={5} />} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Mettre à jour le profil
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileTab;