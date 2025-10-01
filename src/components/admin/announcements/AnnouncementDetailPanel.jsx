import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ExpandableText from '@/components/common/ExpandableText';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AnnouncementDetailPanel = ({ announcement, onClose }) => (
  <motion.div
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l z-50 shadow-2xl flex flex-col"
  >
    <div className="flex items-center justify-between p-4 border-b shrink-0">
      <h2 className="text-lg font-semibold truncate">{announcement.title}</h2>
      <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
    </div>
    <ScrollArea className="flex-grow">
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>{announcement.title}</CardTitle>
            <CardDescription>
              {announcement.is_active ? 
                <Badge variant="success">Active</Badge> 
                : <Badge variant="secondary">Inactive</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExpandableText text={announcement.content} />
            {announcement.link_url && (
              <Button asChild className="mt-4">
                <a href={announcement.link_url} target="_blank" rel="noopener noreferrer">
                  {announcement.link_text || 'En savoir plus'}
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  </motion.div>
);

export default AnnouncementDetailPanel;