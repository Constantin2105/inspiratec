export const aoStatusConfig = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' },
  SUBMITTED: { label: 'Soumis', variant: 'warning' },
  PUBLISHED: { label: 'Publié', variant: 'success' },
  REJECTED: { label: 'Rejeté', variant: 'destructive' },
  ARCHIVED: { label: 'Archivé', variant: 'info' },
  EXPIRED: { label: 'Expiré', variant: 'secondary' },
  FILLED: { label: 'Pourvu', variant: 'success' },
};

export const candidatureStatusConfig = {
  DRAFT: { 
    variant: 'secondary',
    labels: { default: "Brouillon" }
  },
  SUBMITTED: { 
    variant: 'warning',
    labels: {
      expert: "Soumise",
      'super-admin': "À traiter",
      default: "Soumise"
    }
  },
  VALIDATED: {
    variant: 'info',
    labels: {
      expert: "Transmise",
      'super-admin': "Transmise",
      company: "Candidature à traiter",
      default: "Transmise"
    }
  },
  REJECTED_BY_ADMIN: {
    variant: 'destructive',
    labels: {
      expert: "Rejetée",
      'super-admin': "Rejetée",
      default: "Rejetée"
    }
  },
  REJECTED_BY_ENTERPRISE: {
    variant: 'destructive',
    labels: {
      expert: "Rejetée",
      'super-admin': "Rejetée",
      company: "Rejetée",
      default: "Rejetée"
    }
  },
  INTERVIEW_REQUESTED: {
    variant: 'default',
    variants: {
      expert: 'success',
      'super-admin': 'warning',
      company: 'warning'
    },
    labels: {
      expert: "Entretien",
      'super-admin': "Entretien à valider",
      company: "En attente de confirmation",
      default: "Entretien"
    }
  },
  HIRED: {
    variant: 'success',
    labels: {
      expert: "Recruté",
      'super-admin': "Recruté",
      company: "Recruté",
      default: "Recruté"
    }
  },
  FILLED: {
    variant: 'default',
    labels: {
      expert: "Pourvu",
      default: "Pourvu"
    }
  },
  WITHDRAWN: { 
    variant: 'outline',
    labels: { default: "Retirée" }
  },
};

export const interviewStatusConfig = {
  PENDING: {
    variant: 'warning',
    labels: {
      'super-admin': "Entretien à valider",
      company: "En attente de confirmation",
      default: "En attente"
    }
  },
  CONFIRMED: {
    variant: 'success',
    labels: {
      expert: "Confirmé",
      'super-admin': "Entretien confirmé",
      company: "Confirmé",
      default: "Confirmé"
    }
  },
  COUNTER_PROPOSAL: {
    variant: 'info',
    labels: { default: "Contre-proposition" }
  },
  COMPLETED: {
    variant: 'default',
    labels: { default: "Terminé" }
  },
  CANCELLED: {
    variant: 'destructive',
    labels: {
      expert: "Annulé",
      'super-admin': "Annulé",
      company: "Annulé",
      default: "Annulé"
    }
  },
};

export const getStatusBadgeVariant = (status) => {
  return aoStatusConfig[status]?.variant || 'default';
};

export const getStatusLabel = (status) => {
  return aoStatusConfig[status]?.label || status;
};