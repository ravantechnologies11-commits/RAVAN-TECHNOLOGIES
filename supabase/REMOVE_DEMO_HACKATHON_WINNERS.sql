-- ==============================================================================
-- RAVAN TECHNOLOGIES — REMOVE DEMO HACKATHON WINNERS
-- Clears demo winning_solutions (Helios Grid Allocator, CipherMesh ZK Validator)
-- from hackathons record 'hack-001'.
-- Sets winning_solutions to empty array [] so no demo prizes or winners appear.
-- ==============================================================================

UPDATE public.hackathons
SET faq = jsonb_set(
  COALESCE(faq, '{}'::jsonb),
  '{winning_solutions}',
  '[]'::jsonb,
  true
)
WHERE id = 'hack-001';

-- Verification query
SELECT
  id,
  title,
  faq->'rules' AS rules,
  faq->'prizes' AS prizes,
  faq->'winning_solutions' AS winning_solutions
FROM public.hackathons
WHERE id = 'hack-001';
