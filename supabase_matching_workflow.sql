-- =====================================================
-- Vue pour l'admin - Candidatures avec données de matching
-- =====================================================
-- Cette vue joint les candidatures avec les informations de matching
-- calculées par le flow n8n automatiquement

CREATE OR REPLACE VIEW admin_candidatures_view AS
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
    
    -- Données de matching depuis la table candidatures
    c.matching_score,
    
    -- Données de matching depuis la table matchings (si matching_id existe)
    m.score as matching_score_detailed,
    m.reasons as matching_reasons,
    m.features as matching_features,
    m.source as matching_source,
    
    -- Informations de l'expert
    e.first_name || ' ' || e.last_name as expert_name,
    e.email as expert_email,
    e.phone as expert_phone,
    e.linkedin_url as expert_linkedin_url,
    e.profile_picture_url as expert_profile_picture_url,
    
    -- Informations de l'AO
    ao.title as ao_title,
    ao.company_id,
    
    -- Informations de l'entreprise
    comp.name as company_name

FROM candidatures c
LEFT JOIN matchings m ON c.matching_id = m.id
LEFT JOIN experts e ON c.expert_id = e.id
LEFT JOIN aos ao ON c.ao_id = ao.id
LEFT JOIN companies comp ON ao.company_id = comp.id;

-- =====================================================
-- DOCUMENTATION DU FLOW N8N
-- =====================================================
-- 
-- Trigger Supabase configuré :
-- - Nom: new_candidature
-- - Table: candidatures
-- - Événements: INSERT, UPDATE
-- - Webhook: POST https://n8n.srv988949.hstgr.cloud/webhook/91ef14fa-c18e-4b48-a9c1-22e1107
-- 
-- FONCTIONNEMENT :
-- 1. L'expert soumet une candidature → INSERT dans table candidatures
-- 2. Le trigger Supabase "new_candidature" se déclenche automatiquement
-- 3. Le webhook n8n reçoit les données de la candidature
-- 4. Le workflow n8n :
--    a. Récupère le CV et les détails de l'AO
--    b. Analyse le matching avec l'IA
--    c. Calcule le score (0-100)
--    d. Génère les raisons/justifications
--    e. Crée une entrée dans la table "matchings"
--    f. Met à jour la candidature avec matching_id et matching_score
-- 5. L'admin voit automatiquement le score et les raisons dans l'interface Workflow
-- 
-- COLONNES IMPORTANTES :
-- - matching_score (numeric) : Score de 0 à 100 stocké directement dans candidatures
-- - matching_id (uuid) : Référence vers la table matchings pour détails complets
-- - matching_reasons (text[]) : Tableau des raisons depuis la table matchings
-- - matching_features (jsonb) : Détails techniques depuis la table matchings
-- 
-- AFFICHAGE DANS L'INTERFACE :
-- - Le score s'affiche dans la liste des candidatures (anneau de progression)
-- - Les détails complets (score + raisons) s'affichent dans le panneau de détail
-- - Section "Analyse de Matching" avec icône BrainCircuit
-- - Points forts listés en liste à puces
-- 
-- =====================================================

