-- SPDX-License-Identifier: PolyForm-Perimeter-1.0.0
-- SPDX-FileCopyrightText: 2025 Seventeen Sierra LLC

-- Additional development data for testing

-- Insert more sample proposals for development testing
INSERT INTO proposals (title, content, status) VALUES 
    ('AI Ethics Research Proposal', 'A comprehensive study on ethical implications of AI in government contracting.', 'draft'),
    ('Quantum Computing Initiative', 'Research proposal for quantum computing applications in cryptography.', 'review'),
    ('Cybersecurity Framework Development', 'Development of next-generation cybersecurity frameworks for federal agencies.', 'submitted'),
    ('Green Energy Solutions', 'Sustainable energy solutions for government facilities.', 'draft')
ON CONFLICT DO NOTHING;

-- Insert sample compliance checks
INSERT INTO compliance_checks (proposal_id, rule_id, status, result) 
SELECT 
    p.id,
    'FAR-2.101',
    'completed',
    '{"score": 85, "issues": ["Missing budget justification"], "recommendations": ["Add detailed budget breakdown"]}'::jsonb
FROM proposals p 
WHERE p.title = 'Sample NSF Proposal'
ON CONFLICT DO NOTHING;

INSERT INTO compliance_checks (proposal_id, rule_id, status, result) 
SELECT 
    p.id,
    'FAR-15.204',
    'pending',
    '{}'::jsonb
FROM proposals p 
WHERE p.title = 'AI Ethics Research Proposal'
ON CONFLICT DO NOTHING;