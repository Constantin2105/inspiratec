import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Spinner from '@/components/common/Spinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { aoStatusConfig } from '@/lib/utils/status';
import { AoStatusBadge } from '@/components/common/StatusBadges.jsx';
import { cn } from '@/lib/utils/cn';

const AdminAOsTab = ({ aos, loading, onSelectAo, selectedId }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const filteredAos = useMemo(() => {
    if (!aos) return [];
    return aos.filter(ao => {
      const searchMatch = ao.title.toLowerCase().includes(searchTerm.toLowerCase()) || ao.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = selectedStatus === 'ALL' || ao.status === selectedStatus;
      return searchMatch && statusMatch;
    });
  }, [aos, searchTerm, selectedStatus]);

  return (
    <div className="mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Input 
            placeholder="Rechercher par titre ou entreprise..."
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
              {Object.entries(aoStatusConfig).map(([status, { label }]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-auto">
            <Button onClick={() => navigate('/admin/aos/new')} className="w-full md:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un AO
            </Button>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Date de soumission</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAos.length > 0 ? filteredAos.map((ao) => (
                <TableRow 
                  key={ao.id} 
                  onClick={() => onSelectAo(ao)} 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50", 
                    selectedId === ao.id && "bg-muted",
                    ao.status === 'SUBMITTED' && "bg-yellow-100/50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 hover:bg-yellow-100/70 dark:hover:bg-yellow-900/30"
                  )}
                >
                  <TableCell className="font-medium">{ao.title}</TableCell>
                  <TableCell>{ao.company_name || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(ao.created_at), 'd MMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>
                    <AoStatusBadge status={ao.status} />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan="4" className="h-24 text-center">
                    Aucun appel d'offres trouvé pour les filtres sélectionnés.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminAOsTab;