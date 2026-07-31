-- MOM VILLAGE — MIGRATION 51
-- Adds a nullable `interests` column to `profiles`, for the native app's
-- Phase 2 onboarding "What matters most right now" multi-select screen
-- (per the 2026-07-31 native product/layout brief). No equivalent question
-- exists in the website's onboarding flow, so this is additive and doesn't
-- change anything for existing web-onboarded mothers — the column simply
-- stays an empty array for them until they open the native app.
--
-- App-enforced values, not DB-constrained (same pattern as user_care_profile's
-- health_flags array, per that table's own comment): 'baby_development',
-- 'recovery_wellbeing', 'buy_and_skip', 'money_and_schemes',
-- 'feeding_and_sleep', 'work_and_independence', 'finding_other_mothers'.

alter table profiles add column if not exists interests text[] default '{}';
