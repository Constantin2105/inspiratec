import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext(undefined);

const translateSupabaseError = (error) => {
  if (!error || !error.message) {
    return "Une erreur inattendue est survenue.";
  }
  const message = error.message;
  if (message.includes("Invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (message.includes("User already registered")) {
    return "Un utilisateur avec cet email existe déjà.";
  }
  if (message.includes("Email rate limit exceeded")) {
    return "Trop de tentatives. Veuillez réessayer plus tard.";
  }
  if (message.includes("Password should be at least")) {
    return "Le mot de passe est trop court.";
  }
  if (message.includes("Unable to validate email address: invalid format")) {
    return "Le format de l'adresse email est invalide.";
  }
  if (message.includes("profile not found")) {
      return "Profil utilisateur non trouvé.";
  }
  return message;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const getRedirectPath = useCallback((role) => {
    switch (role) {
      case 'super-admin':
        return '/admin/dashboard';
      case 'expert':
        return '/expert/dashboard';
      case 'company':
        return '/company/dashboard';
      default:
        return '/login';
    }
  }, []);
  
  const getProfileData = useCallback(async (userToFetch) => {
    if (!userToFetch) return null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users_with_details')
        .select('*')
        .eq('id', userToFetch.id)
        .single();

      if (profileError) throw profileError;

      if (profileData.role === 'expert' && profileData.expert_profile_id) {
        const { data: expertDetails, error: expertError } = await supabase
          .from('experts')
          .select('*')
          .eq('id', profileData.expert_profile_id)
          .single();

        if (expertError) {
           console.warn("Impossible de récupérer les détails complets de l'expert :", expertError.message);
           return profileData;
        }
        
        return { ...profileData, ...expertDetails };
      }
      
      return profileData;
    } catch(error) {
      toast({
        variant: "destructive",
        title: "Erreur de profil",
        description: "Impossible de charger les informations de votre profil. Veuillez réessayer.",
      });
      return null;
    }
  }, [toast]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const freshProfile = await getProfileData(user);
      setProfile(freshProfile);
    }
  }, [user, getProfileData]);

  const handleAuthStateChange = useCallback(async (event, session) => {
    setLoading(true);
    const currentUser = session?.user ?? null;
    setSession(session);
    setUser(currentUser);

    if (currentUser) {
      const profileData = await getProfileData(currentUser);
      setProfile(profileData);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [getProfileData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthStateChange('INITIAL_SESSION', session);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthStateChange]);

  const signIn = useCallback(async (email, password, expectedRole) => {
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        const profileData = await getProfileData(data.user);
        if (profileData) {
          if (profileData.role !== expectedRole) {
              await supabase.auth.signOut();
              throw new Error('Accès non autorisé pour ce type de compte.');
          }
          const redirectPath = getRedirectPath(profileData.role);
          navigate(redirectPath, { replace: true });
          return { success: true, redirectPath };
        } else {
            throw new Error("Profil utilisateur non trouvé après connexion.");
        }
      }
      throw new Error("Impossible de vérifier l'utilisateur.");
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur de connexion", description: translateSupabaseError(error) });
      return { success: false, error };
    } finally {
        setAuthLoading(false);
    }
  }, [getProfileData, getRedirectPath, navigate, toast]);

  const signUp = useCallback(async (formData, userType) => {
    setAuthLoading(true);
    const { email, password, ...profileData } = formData;
    
    const metadata = { role: userType, ...profileData };
    try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account-verified`,
            data: metadata,
          },
        });

        if (error) throw error;

        if (data.user) {
           navigate('/email-verification-sent', { state: { email } });
           return { user: data.user };
        }
        return {};
    } catch (error) {
       toast({ variant: "destructive", title: "Erreur d'inscription", description: translateSupabaseError(error) });
      return { error };
    } finally {
        setAuthLoading(false);
    }
  }, [navigate, toast]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erreur de déconnexion Supabase (gérée sans crash) :", error.message);
    }
    
    setProfile(null);
    setUser(null);
    setSession(null);
    navigate('/');
  }, [navigate]);
  
  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    authLoading,
    signIn,
    signUp,
    signOut,
    getRedirectPath,
    refreshProfile
  }), [user, profile, session, loading, authLoading, signIn, signUp, signOut, getRedirectPath, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};