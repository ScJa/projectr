
-- get users with project
SELECT * FROM public."Users" u WHERE EXISTS (SELECT * FROM public."Projects" p WHERE u.id = p."UserId");

-- get users without a role
SELECT * FROM public."Users" u WHERE u.owner = FALSE AND u.designer = FALSE AND u.developer = FALSE;

-- get owner positions => should be 0
SELECT * FROM public."Positions" p WHERE p.type = 'Owner';