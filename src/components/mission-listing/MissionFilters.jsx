import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const sectors = [
  "Informatique", "Finance", "Santé", "E-commerce", "Industrie", "Services", "Autre"
];

const contractTypes = [
  "Temps plein", "Temps partiel", "Projet"
];

const MissionFilters = ({ filters, setFilters, onReset }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-lg border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            name="keyword"
            placeholder="Mot-clé, compétence, entreprise..."
            value={filters.keyword}
            onChange={handleInputChange}
            className="pl-10"
          />
        </div>
        <Select onValueChange={(value) => handleSelectChange('sector', value)} value={filters.sector}>
          <SelectTrigger>
            <SelectValue placeholder="Secteur d'activité" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map(sector => (
              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          name="location"
          placeholder="Lieu (ex: Paris, Lyon)"
          value={filters.location}
          onChange={handleInputChange}
        />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="remote" 
            checked={filters.remote}
            onCheckedChange={(checked) => handleSwitchChange('remote', checked)}
          />
          <Label htmlFor="remote">Télétravail total</Label>
        </div>
        <Button onClick={onReset} variant="ghost" className="text-sm">
          <X className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
      </div>
    </div>
  );
};

export default MissionFilters;