
--- Custom access token hook for plugins

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role text;
    user_permissions text[];
  begin
    -- Fetch the user role
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    -- Fetch the permissions and store them as a TEXT array
    select array_agg(permission::text) into user_permissions
    from public.role_permissions
    where role = user_role;

    claims := event->'claims';

    if user_role is not null then
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    -- Set app_permission as a JSON string
    if user_permissions is not null then
      claims := jsonb_set(claims, '{app_permission}', to_jsonb(user_permissions));
    else
      claims := jsonb_set(claims, '{app_permission}', 'null');
    end if;

    event := jsonb_set(event, '{claims}', claims);

    return event;
  end;
$$;


--- todo: add mermission mapping table