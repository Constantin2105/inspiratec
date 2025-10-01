import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import DocumentViewer from './DocumentViewer';

const AvatarViewer = ({ src, alt, fallback, triggerClassName, avatarClassName }) => {
  return (
    <>
      <Avatar className={triggerClassName}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className={avatarClassName}>{fallback}</AvatarFallback>
      </Avatar>
      {src && (
        <DocumentViewer
          url={src}
          open={false}
          onOpenChange={() => {}}
          documentType="image"
        />
      )}
    </>
  );
};

export default AvatarViewer;