import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarPlus as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Combobox } from '@/components/ui/combobox';

const DocumentFilter = ({ initialFilters, onApplyFilters, users }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    if (users) {
      const options = users.map(user => ({
        value: user.id,
        label: user.display_name || user.email,
      }));
      setUserOptions(options);
    }
  }, [users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const resetFilters = {
      searchTerm: '',
      uploaderId: '',
      recipientId: '',
      startDate: null,
      endDate: null,
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="searchTerm">Nom du fichier</Label>
        <Input
          id="searchTerm"
          name="searchTerm"
          placeholder="Rechercher par nom..."
          value={filters.searchTerm}
          onChange={handleInputChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Envoyé par</Label>
        <Combobox
          options={userOptions}
          value={filters.uploaderId}
          onChange={(value) => handleSelectChange('uploaderId', value)}
          placeholder="Sélectionner un expéditeur..."
          searchPlaceholder="Rechercher un utilisateur..."
          noResultsText="Aucun utilisateur trouvé."
        />
      </div>

      <div className="space-y-2">
        <Label>Destinataire</Label>
        <Combobox
          options={userOptions}
          value={filters.recipientId}
          onChange={(value) => handleSelectChange('recipientId', value)}
          placeholder="Sélectionner un destinataire..."
          searchPlaceholder="Rechercher un utilisateur..."
          noResultsText="Aucun utilisateur trouvé."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date) => handleDateChange('startDate', date)}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date) => handleDateChange('endDate', date)}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={handleReset}>Réinitialiser</Button>
        <Button type="submit">Appliquer</Button>
      </div>
    </form>
  );
};

export default DocumentFilter;