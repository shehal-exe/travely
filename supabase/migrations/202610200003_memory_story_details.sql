-- Persist the trip details displayed on public story cards and pages.
alter table public.travel_memories
  add column if not exists total_expense numeric(12, 2)
    check (total_expense >= 0),
  add column if not exists days_spent smallint
    check (days_spent between 1 and 365),
  add column if not exists trip_style text
    check (char_length(trip_style) <= 80),
  add column if not exists author_note text
    check (char_length(author_note) <= 300);

comment on column public.travel_memories.total_expense is
  'Optional total trip cost in INR, supplied by the author.';
