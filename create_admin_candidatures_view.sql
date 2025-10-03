-- =====================================================
-- Vue pour l'admin - Candidatures avec données de matching
-- =====================================================
-- Cette vue joint les candidatures avec les informations de matching
-- qui existent déjà dans la table matchings

-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS admin_candidatures_view CASCADE;

-- Créer la nouvelle vue
CREATE VIEW admin_candidatures_view AS
SELECT 
    c.id,
    c.ao_id,
    c.expert_id,
    c.applied_at,
    c.updated_at,
    c.motivation,
    c.tjm_propose,
    c.date_disponibilite,
    c.projets_similaires,
    c.motif_refus,
    c.linkedin_url,
    c.cv_url,
    c.dossier_candidature_url,
    c.status,
    c.admin_rejection_reason,
    c.company_rejection_reason,
    c.matching_id,
    c.upload_type,
    
    -- Score de matching stocké dans candidatures
    c.matching_score,
    
    -- Données détaillées depuis la table matchings (si matching_id existe)
    m.score as matching_score_detailed,
    m.reasons as matching_reasons,
    m.features as matching_features,
    m.source as matching_source,
    m.threshold as matching_threshold,
    
    -- Informations de l'expert
    e.first_name || ' ' || e.last_name as expert_name,
    u_expert.email as expert_email,
    e.phone_number as expert_phone,
    e.linkedin_url as expert_linkedin_url,
    e.profile_picture_url as expert_profile_picture_url,
    e.title as expert_title,
    
    -- Informations de l'AO
    ao.title as ao_title,
    ao.company_id,
    ao.description as ao_description,
    
    -- Informations de l'entreprise
    comp.name as company_name

FROM candidatures c
LEFT JOIN matchings m ON c.matching_id = m.id
LEFT JOIN experts e ON c.expert_id = e.id
LEFT JOIN users u_expert ON e.user_id = u_expert.id
LEFT JOIN aos ao ON c.ao_id = ao.id
LEFT JOIN companies comp ON ao.company_id = comp.id
ORDER BY c.applied_at DESC;

-- =====================================================
-- COMMENT: Comment utiliser cette vue
-- =====================================================
-- 
-- Cette vue est utilisée par l'interface admin dans :
-- - src/hooks/useAdmin.js (ligne 49) : supabase.from('admin_candidatures_view').select('*')
-- - Affiche dans Workflow > Candidatures
-- 
-- Données de matching affichées :
-- - matching_score : Score de 0 à 100
-- - matching_reasons : Array de raisons/points forts
-- - matching_features : JSON avec détails techniques
-- 
-- L'interface affiche automatiquement :
-- - Un anneau de progression avec le score dans la liste
-- - Une section "Analyse de Matching" dans le détail
-- - La liste des points forts identifiés par l'IA
-- 
-- =====================================================

