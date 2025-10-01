import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { aoStatusConfig, candidatureStatusConfig, interviewStatusConfig } from '@/lib/utils/status';

const getRoleSpecificConfig = (config, status, role) => {
  const statusConfig = config[status];
  if (!statusConfig) {
    return { label: 'Inconnu', variant: 'secondary' };
  }

  const label = statusConfig.labels?.[role] || statusConfig.labels?.default || 'Inconnu';
  const variant = statusConfig.variants?.[role] || statusConfig.variant || 'secondary';

  return { label, variant };
};

export const AoStatusBadge = ({ status }) => {
  const config = aoStatusConfig[status] || { label: 'Inconnu', variant: 'secondary' };
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export const CandidatureStatusBadge = ({ status }) => {
  const { user } = useAuth();
  const { label, variant } = getRoleSpecificConfig(candidatureStatusConfig, status, user?.role);
  
  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

export const InterviewStatusBadge = ({ status }) => {
  const { user } = useAuth();
  const { label, variant } = getRoleSpecificConfig(interviewStatusConfig, status, user?.role);

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};