import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Spinner from '@/components/common/Spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Inbox, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidatureStatusBadge } from '@/components/common/StatusBadges.jsx';

const ApplicationsTab = ({ candidatures, aos, loading, onSelect, selectedId }) => {
    const [missionFilter, setMissionFilter] = useState('all');

    const missionOptions = useMemo(() => {
        if (!candidatures || !aos) return [];
        const missionsWithApps = new Set(candidatures.map(app => app.ao_id));
        const options = aos.filter(ao => missionsWithApps.has(ao.id)).map(ao => ({ value: ao.id, label: ao.title }));
        return [{ value: 'all', label: 'Toutes les missions' }, ...options];
    }, [candidatures, aos]);

    const filteredApplications = useMemo(() => {
        if (!candidatures) return [];
        if (missionFilter === 'all') return candidatures;
        return candidatures.filter(app => app.ao_id === missionFilter);
    }, [candidatures, missionFilter]);
    
    if (loading) return <div className="flex justify-center items-center py-10"><Spinner /></div>;

    if (!candidatures || candidatures.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Boîte de réception des candidatures</CardTitle>
                    <CardDescription>Les candidatures validées par nos équipes apparaîtront ici.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 text-center"><Inbox className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-4 text-lg font-medium">Aucune candidature pour le moment</h3><p className="mt-1 text-sm text-muted-foreground">Les profils qualifiés pour vos missions seront bientôt disponibles.</p></CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Candidatures ({filteredApplications.length})</CardTitle>
                 <div className="pt-2">
                    <Select value={missionFilter} onValueChange={setMissionFilter}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Filtrer par mission" /></SelectTrigger>
                        <SelectContent>{missionOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <ScrollArea className="flex-grow">
                <CardContent className="p-0">
                {filteredApplications.length > 0 ? (
                    <ul className="divide-y">{filteredApplications.map(app => (<li key={app.candidature_id} className={cn("cursor-pointer hover:bg-muted/50 p-4 transition-colors", selectedId === app.candidature_id ? 'bg-muted' : '')} onClick={() => onSelect(app)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 truncate">
                                <Avatar>
                                    <AvatarImage src={app.expert_avatar_url} alt={app.expert_code} />
                                    <AvatarFallback>{app.expert_code.replace('Expert #','').substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="truncate">
                                    <p className="font-semibold truncate">{app.expert_code}</p>
                                    <p className="text-sm text-muted-foreground truncate" title={app.ao_title}>{app.ao_title}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CandidatureStatusBadge status={app.status} />
                                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            </div>
                        </div></li>))}</ul>
                ) : (<div className="p-10 text-center text-muted-foreground"><p>Aucune candidature pour cette mission.</p></div>)}
                </CardContent>
            </ScrollArea>
        </Card>
    );
};

export default ApplicationsTab;