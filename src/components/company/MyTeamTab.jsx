import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Users, ShieldCheck } from 'lucide-react';
import Spinner from '@/components/common/Spinner';
import AvatarViewer from '@/components/common/AvatarViewer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MyTeamTab = ({ hiredCandidatures, loading }) => {
    console.log('📊 Mon Équipe - Experts recrutés:', hiredCandidatures);

    if (loading) {
        return ( <
            div className = "flex justify-center items-center py-10" >
            <
            Spinner / >
            <
            /div>
        );
    }

    const handleViewDossier = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return ( <
            Card >
            <
            CardHeader >
            <
            div className = "flex items-center gap-3" >
            <
            ShieldCheck className = "h-8 w-8 text-primary" / >
            <
            div >
            <
            CardTitle > Mon Équipe < /CardTitle> <
            CardDescription >
            Retrouvez ici tous les experts que vous avez recrutés pour vos missions. <
            /CardDescription> < /
            div > <
            /div> < /
            CardHeader > <
            CardContent > {
                hiredCandidatures.length > 0 ? ( <
                    div className = "overflow-x-auto" >
                    <
                    Table >
                    <
                    TableHeader >
                    <
                    TableRow >
                    <
                    TableHead > Expert < /TableHead> <
                    TableHead > Mission < /TableHead> <
                    TableHead > Date de recrutement < /TableHead> <
                    TableHead className = "text-right" > Dossier < /TableHead> < /
                    TableRow > <
                    /TableHeader> <
                    TableBody > {
                        hiredCandidatures.map((candidature) => ( <
                                TableRow key = { candidature.id } >
                                <
                                TableCell className = "font-medium" >
                                <
                                div className = "flex items-center gap-2" >
                                <
                                AvatarViewer src = { candidature.expert_avatar_url }
                                alt = { candidature.expert_name || 'Expert' }
                                fallback = { candidature.expert_name ? candidature.expert_name.substring(0, 2).toUpperCase() : 'EX' }
                                /> <
                                div >
                                <
                                p className = "font-semibold" > { candidature.expert_name || 'Expert' } < /p> {
                                candidature.expert_title && ( <
                                    p className = "text-sm text-muted-foreground" > { candidature.expert_title } < /p>
                                )
                            } <
                            /div> < /
                            div > <
                            /TableCell> <
                            TableCell > { candidature.ao_title } < /TableCell> <
                            TableCell > { format(new Date(candidature.updated_at), 'd MMMM yyyy', { locale: fr }) } <
                            /TableCell> <
                            TableCell className = "text-right" >
                            <
                            Button variant = "outline"
                            size = "sm"
                            onClick = {
                                () => handleViewDossier(candidature.dossier_candidature_url)
                            }
                            disabled = {!candidature.dossier_candidature_url } >
                            <
                            FileText className = "mr-2 h-4 w-4" / >
                            Voir <
                            /Button> < /
                            TableCell > <
                            /TableRow>
                        ))
                } <
                /TableBody> < /
                Table > <
                /div>
            ): ( <
                div className = "flex flex-col items-center justify-center h-96 text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed" >
                <
                Users className = "w-16 h-16 text-muted-foreground mb-4" / >
                <
                h2 className = "text-xl font-bold" > Votre équipe est en cours de constitution < /h2> <
                p className = "text-muted-foreground mt-2 max-w-md" >
                Lorsque vous recruterez des experts, ils apparaîtront dans cette section. <
                /p> < /
                div >
            )
        } <
        /CardContent> < /
    Card >
);
};

export default MyTeamTab;