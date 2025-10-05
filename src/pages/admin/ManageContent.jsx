import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminBlogPage from '@/pages/admin/AdminBlog';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import ManageAnnouncements from '@/pages/admin/ManageAnnouncements';
import { Newspaper, MessageSquare, Megaphone } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils/cn';
import AnnouncementDetailPanel from '@/components/admin/announcements/AnnouncementDetailPanel';
import TestimonialDetailPanel from '@/components/admin/testimonials/TestimonialDetailPanel';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';

const ManageContent = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeTab = searchParams.get('tab') || 'blog';
    const { toast } = useToast();
    const { refreshData } = useAdmin();
    const [activePanel, setActivePanel] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleSelect = (type, item) => {
        if (activePanel && activePanel.type === type && activePanel.id === item.id) {
            setActivePanel(null);
        } else {
            setActivePanel({ type, ...item });
        }
    };

    const handleClosePanel = () => {
        setActivePanel(null);
    };

    const handleTabChange = (value) => {
        setSearchParams({ tab: value });
        handleClosePanel();
    };

    const handleEditItem = (item) => {
        const path = `/admin/${item.type}s/edit/${item.id}`;
        navigate(path);
        handleClosePanel();
    };

    const handleDeleteItem = async(item) => {
        const { error } = await supabase.from(`${item.type}s`).delete().eq('id', item.id);

        if (error) {
            toast({
                title: "Erreur",
                description: `Impossible de supprimer l'élément.`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Succès",
                description: `L'élément a été supprimé.`,
            });
            await refreshData();
            handleClosePanel();
            setRefreshKey(prev => prev + 1);
        }
    };

    return ( <
        >
        <
        Helmet >
        <
        title > Gestion de Contenu - Admin < /title> < /
        Helmet > <
        div className = { cn("relative transition-all duration-300", activePanel ? "pr-0 md:pr-[448px]" : "") } >
        <
        div className = "space-y-6" >
        <
        motion.div initial = {
            { opacity: 0, y: -20 }
        }
        animate = {
            { opacity: 1, y: 0 }
        } >
        <
        h1 className = "text-3xl font-bold" > Gestion de Contenu < /h1> <
        p className = "text-muted-foreground" > Gérez les articles de blog, les témoignages et les annonces. < /p> < /
        motion.div >

        <
        Tabs value = { activeTab }
        onValueChange = { handleTabChange }
        className = "w-full" >
        <
        TabsList className = "grid w-full grid-cols-1 sm:grid-cols-3" >
        <
        TabsTrigger value = "blog" > < Newspaper className = "mr-2 h-4 w-4" / > Blog < /TabsTrigger> <
        TabsTrigger value = "testimonials" > < MessageSquare className = "mr-2 h-4 w-4" / > Témoignages < /TabsTrigger> <
        TabsTrigger value = "announcements" > < Megaphone className = "mr-2 h-4 w-4" / > Annonces < /TabsTrigger> < /
        TabsList > <
        TabsContent value = "blog"
        className = "mt-4" >
        <
        AdminBlogPage isTabbedView = { true }
        /> < /
        TabsContent > <
        TabsContent value = "testimonials"
        className = "mt-4" >
        <
        AdminTestimonials onSelect = {
            (item) => handleSelect('testimonial', item)
        }
        selectedId = { activePanel && activePanel.type === 'testimonial' ? activePanel.id : null }
        refreshKey = { refreshKey }
        onAction = {
            (action, item) => {
                if (action === 'delete') handleDeleteItem(item);
            }
        }
        /> < /
        TabsContent > <
        TabsContent value = "announcements"
        className = "mt-4" >
        <
        ManageAnnouncements onSelect = {
            (item) => handleSelect('announcement', item)
        }
        selectedId = { activePanel && activePanel.type === 'announcement' ? activePanel.id : null }
        refreshKey = { refreshKey }
        onAction = {
            (action, item) => {
                if (action === 'delete') handleDeleteItem(item);
            }
        }
        /> < /
        TabsContent > <
        /Tabs> < /
        div > <
        /div> <
        AnimatePresence > {
            activePanel && activePanel.type === 'announcement' && ( <
                AnnouncementDetailPanel announcement = { activePanel }
                onClose = { handleClosePanel }
                onEdit = { handleEditItem }
                onDelete = { handleDeleteItem }
                />
            )
        } {
            activePanel && activePanel.type === 'testimonial' && ( <
                TestimonialDetailPanel testimonial = { activePanel }
                onClose = { handleClosePanel }
                onEdit = { handleEditItem }
                onDelete = { handleDeleteItem }
                />
            )
        } <
        /AnimatePresence> < / >
    );
};

export default ManageContent;