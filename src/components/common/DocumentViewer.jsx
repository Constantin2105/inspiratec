import React, { useState, useEffect } from 'react';
    import { AnimatePresence, motion } from 'framer-motion';
    import { X, Loader2 } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabase/client';

    const parseSupabaseUrl = (url) => {
      try {
        const urlObject = new URL(url);
        const pathSegments = urlObject.pathname.split('/');
        const bucketIndex = pathSegments.indexOf('object') + 2; 
        if (bucketIndex > 1 && bucketIndex < pathSegments.length) {
          const bucketName = pathSegments[bucketIndex];
          const filePath = pathSegments.slice(bucketIndex + 1).join('/');
          return { bucket: bucketName, path: filePath };
        }
      } catch (e) {
        // Not a valid URL, or does not match pattern
      }
      return null;
    };

    const DocumentViewer = ({ documentUrl, documentName, onOpenChange }) => {
        const [signedUrl, setSignedUrl] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState(null);
        const { toast } = useToast();
        
        const isImage = documentName && /\.(jpg|jpeg|png|gif|webp)$/i.test(documentName);

        useEffect(() => {
            const getDocument = async () => {
                if (!documentUrl) {
                    setError("Aucun document à afficher.");
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                setError(null);
                setSignedUrl(null);

                const parsed = parseSupabaseUrl(documentUrl);

                if (parsed && parsed.bucket && parsed.path) {
                    const { data, error: signedUrlError } = await supabase.storage
                        .from(parsed.bucket)
                        .createSignedUrl(parsed.path, 3600); // 1 hour validity

                    if (signedUrlError) {
                        console.error("Error creating signed URL:", signedUrlError);
                        setError("Impossible de charger le document. Vous n'avez peut-être pas la permission de voir ce fichier.");
                        toast({
                            title: "Erreur d'autorisation",
                            description: "Vous n'avez peut-être pas la permission de voir ce document.",
                            variant: "destructive",
                        });
                    } else {
                        setSignedUrl(data.signedUrl);
                    }
                } else {
                    // It's not a parsable Supabase URL, assume it's a direct public link
                    setSignedUrl(documentUrl);
                }
                
                setIsLoading(false);
            };

            getDocument();
        }, [documentUrl, toast]);

        const handleClose = () => {
            if (onOpenChange) {
                onOpenChange(false);
            }
        };

        return (
            <AnimatePresence>
                {documentUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                            className="relative bg-background rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col items-center justify-center overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={handleClose}
                                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/50 text-foreground hover:bg-background/80 transition-colors"
                                aria-label="Fermer"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {isLoading && (
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    <p>Chargement du document...</p>
                                </div>
                            )}

                            {!isLoading && error && (
                                 <div className="flex flex-col items-center justify-center gap-4 text-destructive p-8 text-center">
                                    <X className="h-12 w-12" />
                                    <p className="font-semibold">Erreur de chargement</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {!isLoading && !error && signedUrl && (
                                isImage ? (
                                    <img src={signedUrl} alt={documentName} className="object-contain w-full h-full" />
                                ) : (
                                    <iframe src={signedUrl} className="w-full h-full border-0" title={documentName}></iframe>
                                )
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    };

    export default DocumentViewer;