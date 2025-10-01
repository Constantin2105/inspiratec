import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Megaphone, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFromCache, setInCache } from "@/lib/utils/cache";
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const bannerVariants = cva(
  "text-primary-foreground",
  {
    variants: {
      theme: {
        default: "bg-primary",
        success: "bg-green-600",
        warning: "bg-yellow-500",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: {
      theme: "default",
    },
  }
)

const iconComponents = {
  Megaphone: (props) => <Megaphone {...props} />,
  Info: (props) => <Info {...props} />,
  AlertTriangle: (props) => <AlertTriangle {...props} />,
  CheckCircle2: (props) => <CheckCircle2 {...props} />,
};

const NotificationBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const cacheKey = 'cache_active_announcement';
      const cachedData = getFromCache(cacheKey);

      if(cachedData) {
        setAnnouncement(cachedData);
        setIsVisible(true);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          return;
        }

        if (data) {
          setAnnouncement(data);
          setInCache(cacheKey, data);
          setIsVisible(true);
        }
      } catch (error) {
         // Fail silently
      }
    };

    fetchAnnouncement();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !announcement) {
    return null;
  }

  const IconComponent = iconComponents[announcement.icon] || iconComponents.Megaphone;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(bannerVariants({ theme: announcement.theme }))}
        >
          <div className="container-custom mx-auto py-3 px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <div className="flex items-center flex-grow min-w-[200px]">
                <span className="flex p-2 rounded-lg bg-primary-foreground/10">
                  <IconComponent className="h-6 w-6 text-primary-foreground" aria-hidden="true" />
                </span>
                <div className="ml-3 font-medium text-left">
                  <p className="font-bold">{announcement.title}</p>
                  <p className="text-sm">{announcement.content}</p>
                </div>
              </div>

              {announcement.link_url && (
                <div className="w-full sm:w-auto flex-shrink-0 order-3 sm:order-2">
                  <Button asChild variant="outline" className="text-primary bg-primary-foreground hover:bg-primary-foreground/90 w-full sm:w-auto">
                    <Link to={announcement.link_url}>{announcement.link_text || 'En savoir plus'}</Link>
                  </Button>
                </div>
              )}
              
              {/* Adjusted positioning for desktop, keeping mobile absolute position */}
              <div className="order-2 sm:order-3 absolute top-3 right-3 sm:static sm:ml-2">
                <button
                  type="button"
                  className="-mr-1 flex p-2 rounded-md hover:bg-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary-foreground transition-all"
                  onClick={handleClose}
                >
                  <span className="sr-only">Fermer</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBanner;