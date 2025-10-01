import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const createUserFunctionCode = `import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, role, metadata } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { ...metadata, role: role },
    });

    if (error) {
      console.error('Error creating user:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (inviteError) {
        console.error('Error sending invite:', inviteError);
    }

    return new Response(JSON.stringify({ user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('Server error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
`;

const AdminEdgeFunctions = () => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(createUserFunctionCode);
    setCopied(true);
    toast({ title: 'Copié !', description: 'Le code de la fonction a été copié dans le presse-papiers.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Fonctions Edge - Admin InspiraTec</title>
        <meta name="description" content="Présentation des fonctions Edge utilisées pour les opérations sécurisées." />
      </Helmet>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold">Fonctions Edge</h1>
          <p className="text-muted-foreground">
            Ce sont des scripts sécurisés qui s'exécutent sur les serveurs de Supabase pour effectuer des actions sensibles.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>create-user</CardTitle>
                <CardDescription>
                  Cette fonction gère la création de nouveaux utilisateurs de manière sécurisée.
                </CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre><code className="text-sm text-white font-mono">{createUserFunctionCode}</code></pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdminEdgeFunctions;