import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, File, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase/client';

const DocumentUploader = ({ onFileSelect, onFileClear, isUploading, disabled }) => {
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: disabled || isUploading,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
  });
  
  const handleClearFile = () => {
    setFile(null);
    onFileClear();
  };

  if (file) {
    return (
      <div className="border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <File className="h-8 w-8 text-primary" />
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClearFile} disabled={isUploading}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div {...getRootProps()} className={`border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center transition-colors ${isUploading || disabled ? 'cursor-not-allowed bg-muted/20' : 'cursor-pointer hover:bg-muted/50'} ${isDragActive ? 'bg-muted/50 border-primary' : ''}`}>
      <input {...getInputProps()} />
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-4 text-sm text-muted-foreground">
        {isDragActive ? 'Déposez le fichier ici...' : 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner'}
      </p>
      <p className="text-xs text-muted-foreground/80 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
    </div>
  );
};

const DocumentUploaderWithStandaloneButton = ({ onUploadSuccess, uploaderId, onUploadStateChange }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
     accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
  });

  const handleUpload = async () => {
    if (!file || !uploaderId) return;

    setIsUploading(true);
    if(onUploadStateChange) onUploadStateChange(true);

    try {
      const fileExtension = file.name.split('.').pop();
      const filePath = `${uploaderId}/${uuidv4()}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('shared-documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }
      
      await onUploadSuccess({ filePath, fileName: file.name });
      setFile(null);

    } catch (error) {
      toast({
        title: 'Erreur de téléversement',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if(onUploadStateChange) onUploadStateChange(false);
    }
  };

  if (!file) {
    return (
      <div {...getRootProps()} className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors">
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          {isDragActive ? 'Déposez le fichier ici...' : 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner'}
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <File className="h-8 w-8 text-primary" />
        <div>
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? 'Envoi...' : 'Envoyer'}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploader;