
DO $$
DECLARE authenticated_role_id UUID;
BEGIN

-- PASSO 1: Achar o "Role Authenticated" que você criou no painel
SELECT id INTO authenticated_role_id FROM directus_roles WHERE name = 'Authenticated';
IF authenticated_role_id IS NULL THEN
    RAISE EXCEPTION 'Authenticated role not found. Você criou o Role "Authenticated" no painel do Directus?';
END IF;

-- PASSO 2: Insere os 20 usuários para os Leaders
INSERT INTO public.directus_users (id, first_name, email, password, role, status)
SELECT
    gen_random_uuid() as id,
    'Leader ' || s.i as first_name,
    'leader' || s.i || '@example.com' as email,
    'temp-password-hash' as password, 
    authenticated_role_id as role, 
    'active' as status
FROM generate_series(1, 20) AS s(i)
ON CONFLICT (email) DO NOTHING;

-- PASSO 3: Insere os 100 usuários para os Talents
INSERT INTO public.directus_users (id, first_name, email, password, role, status)
SELECT
    gen_random_uuid() as id,
    'Talent ' || s.i as first_name,
    'talent' || s.i || '@example.com' as email,
    'temp-password-hash' as password,
    authenticated_role_id as role, 
    'active' as status
FROM generate_series(1, 100) AS s(i)
ON CONFLICT (email) DO NOTHING;

END $$;


-- PASSO 4: Inserir os "Target Roles"
insert into public.target_roles (name, description)
select 
  'Role ' || generate_series,
  'Descrição para Role ' || generate_series
from generate_series(1, 10)
on conflict (name) do nothing;


-- PASSO 5: Inserir os "Internship Leaders"
WITH leader_users AS (
    SELECT id, ROW_NUMBER() OVER(ORDER BY email) as rn
    FROM public.directus_users WHERE email LIKE 'leader%@example.com'
)
insert into public.internship_leaders (status, phone_number, user_id, position, department)
select 
  'active',
  '+5511' || LPAD((s.i + 9000000000)::TEXT, 11, '0'),
  lu.id, 
  CASE (s.i % 4)
    WHEN 0 THEN 'Manager'
    WHEN 1 THEN 'Lead'
    WHEN 2 THEN 'Senior'
    ELSE 'Coordinator'
  END,
  CASE (s.i % 5)
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END
FROM generate_series(1, 20) AS s(i)
JOIN leader_users lu ON s.i = lu.rn; 


-- PASSO 6: Inserir os "Talents"
WITH talent_users AS (
    SELECT id, ROW_NUMBER() OVER(ORDER BY email) as rn
    FROM public.directus_users WHERE email LIKE 'talent%@example.com'
)
insert into public.talents (
  id, date_created, date_updated, user_id, phone_number, start_date, end_date,
  target_role_id, leader_id, department, current_status, orchestrator_state,
  pdi_plan_ready, current_cycle
)
select 
  gen_random_uuid() as id,
  now() - (random() * interval '90 days') as date_created,
  now() - (random() * interval '30 days') as date_updated,
  tu.id, -- ID do usuário pareado
  '+5511' || LPAD((s.i + 9900000000)::TEXT, 11, '0') as phone_number,
  CURRENT_DATE - (random() * interval '180 days') as start_date,
  CURRENT_DATE + (random() * interval '180 days') as end_date,
  (1 + floor(random() * 10))::INTEGER as target_role_id,
  (1 + floor(random() * 20))::INTEGER as leader_id,
  CASE (floor(random() * 5))
    WHEN 0 THEN 'Engineering'
    WHEN 1 THEN 'Design'
    WHEN 2 THEN 'Product'
    WHEN 3 THEN 'Marketing'
    ELSE 'Operations'
  END as department,
  CASE (floor(random() * 4))
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'PENDING_FIRST_ACCESS'
    WHEN 2 THEN 'INACTIVE'
    ELSE 'ONBOARDING'
  END as current_status,
  CASE (floor(random() * 4))
    WHEN 0 THEN 'ACTIVE'
    WHEN 1 THEN 'ONBOARDING'
    WHEN 2 THEN 'PENDING'
    ELSE NULL
  END as orchestrator_state,
  (random() > 0.5) as pdi_plan_ready,
  (1 + floor(random() * 3))::INTEGER as current_cycle
FROM generate_series(1, 100) AS s(i)
JOIN talent_users tu ON s.i = tu.rn;

