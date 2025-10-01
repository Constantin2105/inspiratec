import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Spinner from '@/components/common/Spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Inbox, ChevronRight, Users, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import AdminApplicationDetailPanel from './AdminApplicationDetailPanel';
import { candidatureStatusConfig } from '@/lib/utils/status';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { AnimatePresence, motion } from 'framer-motion';
import ProgressRing from '@/components/ui/progress-ring';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EmptyApplicationsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed">
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucune candidature trouvée</h3>
        <p className="mt-1 text-sm text-muted-foreground">Ajustez vos filtres ou attendez de nouvelles candidatures.</p>
    </div>
);

const ApplicationDetailsPlaceholder = () => (
     <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <p className="mt-4">Sélectionnez une candidature pour voir les détails.</p>
        </div>
    </Card>
);


const AdminApplicationsTab = ({ candidatures, loading }) => {
    const [selectedApp, setSelectedApp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    
    const filteredApplications = useMemo(() => {
        if (!candidatures) return [];
        return candidatures.filter(app => {
             const searchMatch = app.expert_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 app.ao_title?.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = selectedStatus === 'ALL' || app.status === selectedStatus;
            return searchMatch && statusMatch;
        });
    }, [candidatures, searchTerm, selectedStatus]);

    const handleRowClick = (app) => {
        setSelectedApp(app);
    };

    const handlePanelClose = () => {
        setSelectedApp(null);
    };

    useEffect(() => {
        if (selectedApp) {
            const updatedApp = candidatures.find(c => c.id === selectedApp.id);
            setSelectedApp(updatedApp || null);
            if (!updatedApp) {
                handlePanelClose();
            }
        }
    }, [candidatures, selectedApp]);

    const availableStatuses = useMemo(() => {
        if (!candidatures) return [];
        const statusSet = new Set(candidatures.map(c => c.status));
        return Object.entries(candidatureStatusConfig)
            .filter(([statusKey]) => statusSet.has(statusKey));
    }, [candidatures]);

    return (
        <div className="mt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                    <Input 
                        placeholder="Rechercher par expert ou mission..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-auto md:max-w-sm"
                    />
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous</SelectItem>
                            <SelectSeparator />
                            {availableStatuses.map(([status, { labels }]) => (
                                <SelectItem key={status} value={status}>
                                    {labels['super-admin'] || labels.default}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1 h-[calc(100vh-22rem)] flex flex-col">
                        <CardHeader>
                            <CardTitle>Candidatures ({filteredApplications.length})</CardTitle>
                            <CardDescription>Liste des candidatures reçues.</CardDescription>
                        </CardHeader>
                        <ScrollArea className="flex-grow">
                        <CardContent className="p-0">
                            {filteredApplications.length > 0 ? (
                                <TooltipProvider>
                                <ul className="divide-y">
                                    {filteredApplications.map(app => (
                                        <li 
                                            key={app.id} 
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50 p-4 transition-colors", 
                                                selectedApp?.id === app.id && 'bg-muted',
                                                app.status === 'SUBMITTED' && "bg-yellow-100/50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 hover:bg-yellow-100/70 dark:hover:bg-yellow-900/30"
                                            )}
                                            onClick={() => handleRowClick(app)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 truncate">
                                                    <Avatar>
                                                        <AvatarImage src={app.expert_profile_picture_url} alt={app.expert_name} />
                                                        <AvatarFallback>{app.expert_name ? app.expert_name.substring(0, 2).toUpperCase() : 'EX'}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="truncate">
                                                        <p className={cn(
                                                            "font-semibold truncate",
                                                            (app.status === 'REJECTED_BY_ADMIN' || app.status === 'REJECTED_BY_ENTERPRISE') && "text-destructive"
                                                        )}>
                                                            {app.expert_name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground truncate" title={app.ao_title}>{app.ao_title}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {app.matching_score && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div>
                                                                    <ProgressRing progress={app.matching_score} size={32} strokeWidth={3} />
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Score de matching: {app.matching_score}%</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                </TooltipProvider>
                            ) : <EmptyApplicationsPlaceholder />}
                        </CardContent>
                        </ScrollArea>
                    </Card>
                    <div className="md:col-span-2">
                        {selectedApp ? (
                             <AnimatePresence>
                                <motion.div
                                    key={selectedApp.id}
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="h-full"
                                >
                                    <AdminApplicationDetailPanel 
                                        application={selectedApp} 
                                        onClose={handlePanelClose}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        ) : <ApplicationDetailsPlaceholder />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApplicationsTab;