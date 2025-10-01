import { differenceInYears } from 'date-fns';

export const calculateExpertProfileCompleteness = (profile) => {
  if (!profile || profile.role !== 'expert') return { percentage: 0, missingFields: [], filledFields: 0, totalFields: 0 };

  const fields = [
    { key: 'expert_phone', label: 'Numéro de téléphone' },
    { key: 'expert_title', label: 'Titre professionnel' },
    { key: 'expert_bio', label: 'Biographie' },
    { key: 'years_of_experience', label: 'Années d\'expérience' },
    { key: 'availability', label: 'Disponibilité' },
    { key: 'daily_rate', label: 'TJM' },
    { key: 'skills', label: 'Compétences' },
    { key: 'portfolio_links', label: 'Portfolio' },
    { key: 'cv_url', label: 'CV' },
  ];

  let filledFields = 0;
  const missingFields = [];

  fields.forEach(field => {
    const value = profile[field.key];
    if (value && (!Array.isArray(value) || value.length > 0)) {
      filledFields++;
    } else {
      missingFields.push(field.label);
    }
  });

  const totalFields = fields.length;
  const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100;

  return { percentage, missingFields, filledFields, totalFields };
};

export const calculateCompanyProfileCompleteness = (profile) => {
  if (!profile || profile.role !== 'company') return { percentage: 0, missingFields: [], filledFields: 0, totalFields: 0 };

  const fields = [
    { key: 'siren', label: 'SIREN' },
    { key: 'representative_position', label: 'Poste du représentant' },
    { key: 'company_phone', label: 'Numéro de téléphone' },
    { key: 'website', label: 'Site Web' },
    { key: 'address', label: 'Adresse' },
    { key: 'city', label: 'Ville' },
    { key: 'postal_code', label: 'Code Postal' },
    { key: 'country', label: 'Pays' },
    { key: 'company_description', label: 'Description' },
    // Removed: { key: 'avatar_url', label: 'Logo', check: (val) => val && !val.includes('48e2ca79dc3d8b990ed2ad14c818b96b') },
  ];

  let filledFields = 0;
  const missingFields = [];

  fields.forEach(field => {
    const value = profile[field.key];
    const isFilled = field.check ? field.check(value) : (value && (!Array.isArray(value) || value.length > 0));
    
    if (isFilled) {
      filledFields++;
    } else {
      missingFields.push(field.label);
    }
  });

  const totalFields = fields.length;
  const percentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100;

  return { percentage, missingFields, filledFields, totalFields };
};