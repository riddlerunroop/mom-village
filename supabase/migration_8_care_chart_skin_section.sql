-- MOM VILLAGE — MIGRATION 8
-- Adds "skin" as a real fourth content section for the Weekly Care Chart,
-- alongside the existing body / food / mind sections. Confirmed 2026-07-21:
-- Care Chart covers exercise, recipes/nutrition, mental wellbeing (mind),
-- and skin care as four genuinely separate content categories.

alter table weekly_care_chart_content drop constraint weekly_care_chart_content_section_check;

alter table weekly_care_chart_content add constraint weekly_care_chart_content_section_check
  check (section in ('body', 'food', 'mind', 'skin'));
