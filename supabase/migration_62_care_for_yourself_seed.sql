-- Care for Yourself — 7 placeholder Care Notes, one per category, purely
-- so the feature is demonstrable before Roop writes the real 210 (30 per
-- category — see CLAUDE.md). Every row here is tagged
-- safety_flag = 'placeholder' specifically so it's easy to find and clear
-- later, e.g.:
--   delete from care_for_yourself_notes where safety_flag = 'placeholder';
-- once her real content is ready to load in its place.
--
-- The Monday/Face row below is not invented by Claude — it's Roop's own
-- example text from her original spec message, used verbatim (headline
-- and "tiny action" split out of her one example paragraph).
--
-- Idempotent, same on-conflict-do-update pattern as every content seed in
-- this project — safe to rerun.

insert into care_for_yourself_notes (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-001', 'hair', 1, 'CARE',
   'Placeholder — Hair love',
   'This is placeholder text standing in for one of Sunday''s 30 real Hair Love notes. Roop will write the real content for this category herself.',
   'Placeholder tiny action for Hair Love.',
   'placeholder'),

  ('CARE-FACE-001', 'face', 1, 'CARE',
   'Simple can still be worthwhile',
   'Your skincare doesn''t have to be complicated to be worthwhile. A few products that genuinely suit your skin and that you use consistently can be more useful than constantly chasing the newest routine.',
   'Make a few unrushed minutes for the facial care that already works for you.',
   'placeholder'),

  ('CARE-HANDSFEET-001', 'handsfeet', 1, 'CARE',
   'Placeholder — Hands & feet',
   'This is placeholder text standing in for one of Tuesday''s 30 real Hands & Feet notes. Roop will write the real content for this category herself.',
   'Placeholder tiny action for Hands & Feet.',
   'placeholder'),

  ('CARE-BODY-001', 'body', 1, 'CARE',
   'Placeholder — Body love',
   'This is placeholder text standing in for one of Wednesday''s 30 real Body Love notes. Roop will write the real content for this category herself.',
   'Placeholder tiny action for Body Love.',
   'placeholder'),

  ('CARE-GROOM-001', 'groom', 1, 'CARE',
   'Placeholder — Groom & glow',
   'This is placeholder text standing in for one of Thursday''s 30 real Groom & Glow notes. Roop will write the real content for this category herself.',
   'Placeholder tiny action for Groom & Glow.',
   'placeholder'),

  ('CARE-FEELGOOD-001', 'feelgood', 1, 'CARE',
   'Placeholder — Feel-good Friday',
   'This is placeholder text standing in for one of Friday''s 30 real Feel-Good Friday notes. Roop will write the real content for this category herself.',
   'Placeholder tiny action for Feel-Good Friday.',
   'placeholder'),

  ('CARE-MYCARE-001', 'mycare', 1, 'CARE',
   'Placeholder — My care day',
   'This is placeholder text standing in for one of Saturday''s own 30 real My Care Day notes. Roop will write the real content for this category herself.',
   'Placeholder tiny action for My Care Day.',
   'placeholder')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag;
