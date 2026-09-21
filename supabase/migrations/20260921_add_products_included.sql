alter table public.products add column included text[];
comment on column public.products.included is 'Bullet lines shown under "Selected module" at checkout. NULL/empty = use the default list.';
