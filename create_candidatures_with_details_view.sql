-- =====================================================
-- Vue pour l'expert - Ses candidatures avec données de matching
-- =====================================================
-- Cette vue affiche les candidatures d'un expert avec son score de matching

-- Supprimer la vue existante si elle existe
DROP VIEW IF EXISTS candidatures_with_details CASCADE;

-- Créer la nouvelle vue
CREATE VIEW candidatures_with_details AS
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
    
    -- Score de matching pour affichage côté expert
    c.matching_score,
    
    -- Raisons de matching (pourquoi il matche bien)
    m.reasons as matching_reasons,
    
    -- Informations de l'AO
    ao.title as ao_title,
    ao.description as ao_description,
    ao.company_id,
    ao.status as ao_status,
    
    -- Informations de l'entreprise
    comp.name as company_name,
    
    -- Informations d'entretien si elles existent
    (
        SELECT json_build_object(
            'id', i.id,
            'status', i.status,
            'scheduled_times', i.scheduled_times,
            'confirmed_time', i.confirmed_time,
            'meeting_link', i.meeting_link
        )
        FROM interviews i
        WHERE i.candidature_id = c.id
        LIMIT 1
    ) as interview

FROM candidatures c
LEFT JOIN matchings m ON c.matching_id = m.id
LEFT JOIN aos ao ON c.ao_id = ao.id
LEFT JOIN companies comp ON ao.company_id = comp.id
ORDER BY c.applied_at DESC;

-- =====================================================
-- COMMENT: Vue utilisée par l'espace Expert
-- =====================================================
-- 
-- Cette vue est utilisée par :
-- - src/hooks/useExpert.js (lignes 58 et 82-86)
-- - Affiche dans Expert Dashboard > Missions > Mes Candidatures
-- 
-- Données de matching affichées :
-- - matching_score : Score de 0 à 100 (combien l'expert correspond à la mission)
-- - matching_reasons : Array de raisons pourquoi il matche bien
-- 
-- L'expert voit son propre score pour savoir s'il est bien adapté à la mission
-- 
-- =====================================================

