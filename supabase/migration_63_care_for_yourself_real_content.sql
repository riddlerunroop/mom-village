-- Care for Yourself — real content (migration_63), 2026-09-18
-- Replaces the 7 migration_62 placeholder rows with Roop's own real
-- 210 Care Notes (30 per category x 7 categories), written in her own
-- voice per the original spec. safety_flag = 'draft': real content,
-- not yet clinically reviewed (Roop's own explicit ask, logged in
-- CLAUDE.md) -- treat as flagged for a dermatology/trichology review
-- pass before calling this 'approved', consistent with this project's
-- standing verify-before-lock discipline. Idempotent: on conflict (id)
-- do update, same pattern as every content migration in this project.

-- Remove any leftover placeholder rows from migration_62 first, since
-- this migration is the real, final content bank (30 rows/category,
-- not 1) -- safe even if migration_62 was never run.
delete from care_for_yourself_notes where safety_flag = 'placeholder';

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-001', 'hair', 1, 'CARE', $h$The Conditioner Minute$h$, $b$Conditioner works better when it gets a little time. Apply it where your hair needs it, finish the rest of your shower, then rinse. No need to rush everything.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-002', 'hair', 2, 'CARE', $h$Your Scalp Is Skin Too$h$, $b$Hair care starts above the strands. Give your scalp the same gentle attention you give the rest of your skin—clean, comfortable and not aggressively scrubbed.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-003', 'hair', 3, 'CARE', $h$Wet Hair, Gentle Hands$h$, $b$Wet hair is easier to stretch and damage. Detangle patiently rather than fighting with knots.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-004', 'hair', 4, 'CARE', $h$Turn Down the Heat$h$, $b$Your dryer or styling tool doesn't always need its highest setting. When you use heat, use sensible temperatures and heat protection appropriate for your hair.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-005', 'hair', 5, 'CARE', $h$The Tight-Ponytail Check$h$, $b$If your hairstyle pulls, aches or leaves your scalp sore, loosen it. Beautiful hair doesn't need to hurt.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-006', 'hair', 6, 'RITUAL', $h$Oil Because You Enjoy It$h$, $b$Hair oiling is a treasured ritual in many Indian homes. Enjoy it if it suits you—but it doesn't need miraculous claims to deserve a place in your Sunday.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-007', 'hair', 7, 'CARE', $h$Your Ends Need Love Too$h$, $b$The oldest part of your hair is at the ends. Treat them gently, condition them well and don't wait for them to become straw before noticing them.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-008', 'hair', 8, 'KNOW', $h$Postpartum Shedding Is Real$h$, $b$Increased shedding can occur after pregnancy. If it feels excessive, persists, creates patches, or worries you, that's worth discussing with a healthcare professional rather than simply buying another serum.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-009', 'hair', 9, 'KNOW', $h$Wash When Your Scalp Needs It$h$, $b$There is no universal perfect number of hair-wash days. Your scalp, hair, activity and styling habits get a vote.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-010', 'hair', 10, 'CARE', $h$The Towel Truce$h$, $b$Hair doesn't need a vigorous towel fight. Blot or wrap gently instead of rubbing it aggressively.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-011', 'hair', 11, 'CARE', $h$Clean the Hairbrush$h$, $b$Today's tiny job: rescue your brush or comb from the little civilisation currently living inside it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-012', 'hair', 12, 'FEEL', $h$Your Hair Has Changed? That's Allowed.$h$, $b$Pregnancy, postpartum life, hormones, age and environment can change how hair behaves. Your old routine doesn't have to remain your forever routine.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-013', 'hair', 13, 'CARE', $h$Scalp Massage, Not Scalp Warfare$h$, $b$If you enjoy a scalp massage, keep it comfortable. Fingertips are enough; scratching harder isn't better care.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-014', 'hair', 14, 'FEEL', $h$Don't Chase Every Hair Trend$h$, $b$Your feed can recommend five miracle oils before breakfast. Your hair does not need to participate in every trend.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-015', 'hair', 15, 'FEEL', $h$Trim Without Drama$h$, $b$A trim isn't an admission that your hair “failed to grow.” Sometimes removing weathered ends simply makes hair easier to live with.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-016', 'hair', 16, 'CARE', $h$Sleep Kindly on Your Hair$h$, $b$If you wake up with tangles, consider a loose braid or another comfortable style that reduces nighttime friction.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-017', 'hair', 17, 'KNOW', $h$Hair Care Includes Eating$h$, $b$Hair is part of the body. Persistent shedding isn't always a cosmetic issue; nutrition, iron status, thyroid function and other factors can matter. Significant changes deserve proper assessment.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-018', 'hair', 18, 'CARE', $h$The Product Pile-Up Check$h$, $b$More products don't automatically mean more care. If your hair feels overloaded, complicated may not be better.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-019', 'hair', 19, 'FEEL', $h$Let It Be Its Texture$h$, $b$Straight, wavy, curly, frizzy, fine, thick—today doesn't have to be a battle to make your hair impersonate somebody else's.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-020', 'hair', 20, 'CARE', $h$Give the Extensions a Break$h$, $b$Any hairstyle or extension that repeatedly pulls at the roots deserves caution. Comfort matters.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-021', 'hair', 21, 'CARE', $h$Clean Tools Count$h$, $b$Brushes, combs and styling tools collect hair and product. A little cleaning is hair care too.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-022', 'hair', 22, 'RITUAL', $h$The Sunday Hair Date$h$, $b$Put something on to listen to and give your hair the time you normally rush through. Care can be enjoyable rather than corrective.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-023', 'hair', 23, 'FEEL', $h$Grey Is Not an Emergency$h$, $b$Colour it because you love colour. Leave it because you like it. Either way, a grey strand isn't an urgent problem to solve.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-024', 'hair', 24, 'CARE', $h$One Good Hair Thing$h$, $b$You don't need a complete ritual today. Choose one: wash, condition, oil, detangle, style or simply brush it slowly.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-025', 'hair', 25, 'KNOW', $h$Be Suspicious of Miracles$h$, $b$“Stops hair fall instantly” and “grows inches in weeks” deserve scepticism. Hair biology is considerably less dramatic than advertising.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-026', 'hair', 26, 'FEEL', $h$Hair Day Can Be Salon Day$h$, $b$If professional care is your thing and it fits your life, book it without needing a special event as justification.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-027', 'hair', 27, 'FEEL', $h$Your Parting Isn't a Diagnosis$h$, $b$Don't turn every mirror check into an investigation. If you genuinely notice persistent thinning or scalp changes, seek proper assessment instead.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-028', 'hair', 28, 'FEEL', $h$The Favourite-Hair Day$h$, $b$Style your hair in the way that makes you like it—not necessarily the newest way.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-029', 'hair', 29, 'CARE', $h$Hands Off for a While$h$, $b$Sometimes the kindest thing you can do is stop repeatedly brushing, restyling, straightening and checking it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HAIR-030', 'hair', 30, 'FEEL', $h$Today's Hair Rule$h$, $b$Your hair's job is not to make you look younger, slimmer or more polished. Today, simply make it feel good to belong to you.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-001', 'face', 1, 'CARE', $h$Consistency Beats the Shelf$h$, $b$Your face doesn't need 14 products to qualify as cared for. A simple routine that suits you and actually gets used has value.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-002', 'face', 2, 'KNOW', $h$SPF Is Future Care$h$, $b$Sun protection is one of the broadly useful habits for protecting skin from UV damage and premature photoageing. Choose one appropriate for you and use it properly.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-003', 'face', 3, 'CARE', $h$Don't Stop at the Jaw$h$, $b$When using suitable moisturising or sun protection, remember commonly exposed areas such as your neck too.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-004', 'face', 4, 'KNOW', $h$Hydration ≠ Oiliness$h$, $b$Skin can be oily and still feel dehydrated. Don't assume every shiny face needs to be stripped into submission.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-005', 'face', 5, 'CARE', $h$Your Barrier Matters$h$, $b$Burning, stinging and peeling are not trophies proving that skincare is “working.” Skin deserves gentleness.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-006', 'face', 6, 'FEEL', $h$The Bathroom-Light Rule$h$, $b$Nobody needs to inspect their pores from three inches away under brutal overhead lighting. Step away from the mirror.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-007', 'face', 7, 'CARE', $h$Cleanse, Don't Punish$h$, $b$Your face should not have to survive an aggressive scrubbing session to be considered clean.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-008', 'face', 8, 'FEEL', $h$Healthy Ageing, Not Anti-You$h$, $b$Lines are not evidence that you've stopped taking care of yourself. Care for ageing skin; don't declare war on ageing.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-009', 'face', 9, 'KNOW', $h$Sleep Shows Up Everywhere$h$, $b$No cream can make interrupted sleep irrelevant. When rest is possible, consider it part of caring for your skin and the rest of you.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-010', 'face', 10, 'FEEL', $h$The Expensive Product Rule$h$, $b$If it suits you and you've already bought it, stop saving it for some mythical important day. Monday qualifies.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-011', 'face', 11, 'CARE', $h$Hands Off That Spot$h$, $b$Picking often makes an irritated spot angrier and can increase the chance of marks. Sometimes the hardest skincare step is leaving it alone.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-012', 'face', 12, 'KNOW', $h$More Active Isn't More Advanced$h$, $b$Layering multiple strong skincare actives isn't automatically sophisticated. Irritation isn't the goal.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-013', 'face', 13, 'KNOW', $h$Pregnancy Changes the Rulebook$h$, $b$Pregnancy and breastfeeding can change which skincare ingredients or procedures are appropriate. Check uncertain actives or treatments with an appropriate clinician.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-014', 'face', 14, 'FEEL', $h$Your Face Can Change$h$, $b$Pregnancy, postpartum hormones, weather, stress and age can alter skin. A routine that worked years ago isn't a contract.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-015', 'face', 15, 'RITUAL', $h$Face Massage = A Moment, Not a Facelift$h$, $b$If you enjoy facial massage, enjoy the relaxation and ritual. It doesn't need exaggerated lifting claims to be worthwhile.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-016', 'face', 16, 'CARE', $h$The Pillowcase Nudge$h$, $b$Today's glamorous beauty task: check when your pillowcase was last changed. Sometimes care is wonderfully boring.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-017', 'face', 17, 'KNOW', $h$Patch Test the New Obsession$h$, $b$A viral product being loved by thousands of strangers doesn't guarantee that your skin will love it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-018', 'face', 18, 'FEEL', $h$Your Skin Has Texture$h$, $b$Human skin has pores, lines, hairs and texture. A filtered screen is not the reference standard.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-019', 'face', 19, 'CARE', $h$Don't Forget Your Lips$h$, $b$If they're feeling dry, give them some uncomplicated care rather than waiting until they're painfully cracked.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-020', 'face', 20, 'KNOW', $h$Skincare Doesn't Need Pain$h$, $b$A treatment being stronger, hotter or more uncomfortable doesn't automatically make it more effective.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-021', 'face', 21, 'KNOW', $h$Chemical Peel? Respect the Chemical Part.$h$, $b$Peels can vary greatly in strength. Stronger or professional peels deserve proper assessment, aftercare and sun protection—not casual experimentation.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-022', 'face', 22, 'FEEL', $h$Your Face Isn't a Project$h$, $b$You can enjoy skincare enormously without maintaining a permanent list of things that need “fixing.”$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-023', 'face', 23, 'CARE', $h$One New Thing at a Time$h$, $b$Introducing everything at once makes it much harder to know what your skin likes—or dislikes.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-024', 'face', 24, 'KNOW', $h$Sun Protection Isn't Just for Summer$h$, $b$UV exposure doesn't ask whether you're on holiday. Make protection part of your normal routine when appropriate.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-025', 'face', 25, 'KNOW', $h$Don't Borrow Someone Else's Prescription$h$, $b$What transformed your friend's skin may be completely inappropriate for yours. Prescription treatments belong to the person they were prescribed for.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-026', 'face', 26, 'RITUAL', $h$The Five-Minute Face Date$h$, $b$Do your normal care slowly tonight. No scrolling between steps. That's all.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-027', 'face', 27, 'KNOW', $h$Persistent Deserves Proper Care$h$, $b$Persistent acne, rashes, pigmentation changes or other worrying symptoms deserve appropriate professional advice rather than endless trial-and-error.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-028', 'face', 28, 'FEEL', $h$Your Best Skin Isn't Someone Else's Skin$h$, $b$The goal isn't poreless, lineless, glass-like perfection. It's comfortable, cared-for skin that belongs to you.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-029', 'face', 29, 'FEEL', $h$Mirror Compliment Monday$h$, $b$After your routine, identify one thing you like about your face. You are not allowed to follow the compliment with “but…”$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FACE-030', 'face', 30, 'FEEL', $h$Today's Face Rule$h$, $b$Care for the face you have today—not the one you had at 22 and not the filtered one your phone can manufacture.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-001', 'handsfeet', 1, 'CARE', $h$They've Been Working All Day$h$, $b$Your hands have probably washed, carried, opened, cleaned and held a dozen things already. Give them some cream and a minute.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-002', 'handsfeet', 2, 'CARE', $h$Heel Check$h$, $b$Dry heels don't need shame. They need care. Moisturise regularly and pay attention to painful or persistent cracks.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-003', 'handsfeet', 3, 'KNOW', $h$Cuticles Aren't the Enemy$h$, $b$Aggressive cutting or picking around nails can injure the protective skin around them. Gentle grooming wins.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-004', 'handsfeet', 4, 'CARE', $h$The Bedside Trick$h$, $b$If you constantly forget hand or foot cream, put it somewhere you already stop—bedside, desk or sofa.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-005', 'handsfeet', 5, 'FEEL', $h$Pedicure ≠ Polish$h$, $b$Clean, comfortable nails and cared-for feet count even when there isn't a drop of nail colour involved.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-006', 'handsfeet', 6, 'CARE', $h$Give Your Feet Five$h$, $b$Sit down. Cream. Massage. Five minutes. They've carried everybody else far enough today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-007', 'handsfeet', 7, 'RITUAL', $h$Traditional Foot-Oiling Night$h$, $b$Foot massage with oil has a long place in Indian household and Ayurvedic traditions. If you enjoy it and your skin tolerates the product, let the ritual be about slowing down as much as the oil itself.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-008', 'handsfeet', 8, 'CARE', $h$Shoes Shouldn't Punish You$h$, $b$Repeated rubbing, pressure or pain isn't a fashion requirement. Your feet are allowed to demand better.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-009', 'handsfeet', 9, 'KNOW', $h$Nails Need Gentle Tools$h$, $b$Filing and trimming shouldn't become excavation. Gentle technique protects the surrounding skin.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-010', 'handsfeet', 10, 'KNOW', $h$The Hand-Sanitiser Aftermath$h$, $b$Frequent washing and sanitising can be drying. If your hands feel stripped, moisturising can help restore comfort.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-011', 'handsfeet', 11, 'KNOW', $h$Don't Hide Nail Changes Under Polish Forever$h$, $b$Persistent changes in nail colour, shape, thickness or surrounding skin can sometimes need professional assessment.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-012', 'handsfeet', 12, 'CARE', $h$Your Hands Age Too$h$, $b$If healthy-ageing skincare matters to you, remember that your hands also receive sun exposure.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-013', 'handsfeet', 13, 'FEEL', $h$Take the Polish Off Properly$h$, $b$Today's care is not peeling old polish off one satisfying strip at a time. Tempting, yes. Ideal, no.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-014', 'handsfeet', 14, 'RITUAL', $h$The Warm-Water Ritual$h$, $b$A comfortable soak followed by moisturising can turn basic foot care into ten quiet minutes that belong to you.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-015', 'handsfeet', 15, 'KNOW', $h$Salon Hygiene Matters$h$, $b$Pretty interiors don't guarantee clean tools. Choose manicure/pedicure services that take hygiene and equipment practices seriously.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-016', 'handsfeet', 16, 'KNOW', $h$Your Feet Are Not Supposed to Hurt$h$, $b$Persistent pain, swelling, numbness, wounds or skin changes aren't pedicure problems. They deserve appropriate healthcare.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-017', 'handsfeet', 17, 'FEEL', $h$One Nail Colour, Zero Occasion$h$, $b$If polish makes you happy, paint them because it's Tuesday. That's enough reason.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-018', 'handsfeet', 18, 'FEEL', $h$Hands Tell Stories$h$, $b$Lines, veins and signs of work don't make hands ugly. Care for them without demanding they look untouched by life.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-019', 'handsfeet', 19, 'CARE', $h$The Cuticle-Oil Minute$h$, $b$If cuticle care is already part of your routine, today is a good day to actually remember it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-020', 'handsfeet', 20, 'FEEL', $h$Bare Nails Are Finished Too$h$, $b$Buffed, clean, bare, polished, long, short—“done” is whatever makes you feel good.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-021', 'handsfeet', 21, 'KNOW', $h$Don't Share Everything$h$, $b$Personal nail tools are better kept personal or appropriately sterilised, particularly when there's a risk of skin injury.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-022', 'handsfeet', 22, 'CARE', $h$Feet Need Drying Too$h$, $b$After bathing, don't rush past your feet. Keeping them clean and comfortably dry matters, especially between the toes.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-023', 'handsfeet', 23, 'KNOW', $h$Calluses Don't Need Violence$h$, $b$Don't aggressively cut or dig at thickened skin yourself. Persistent or painful areas deserve appropriate care.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-024', 'handsfeet', 24, 'FEEL', $h$The Ring-and-Bracelet Day$h$, $b$Give your hands their jewellery today. The nice pieces don't need a wedding invitation.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-025', 'handsfeet', 25, 'CARE', $h$Ten-Minute Home Pedicure$h$, $b$Clean, trim if needed, moisturise, breathe. No 17-step Pinterest ceremony required.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-026', 'handsfeet', 26, 'CARE', $h$Choose Comfort Tonight$h$, $b$Give tired feet a break from restrictive footwear when your day allows it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-027', 'handsfeet', 27, 'KNOW', $h$Chemical Treatments Need Respect$h$, $b$Strong peeling products or acids used on hands and feet can irritate or injure skin if misused. Stronger isn't automatically better.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-028', 'handsfeet', 28, 'FEEL', $h$Massage Without a Mission$h$, $b$Rub your hands or feet simply because it feels nice. It doesn't need to “detox” anything to be worth doing.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-029', 'handsfeet', 29, 'RITUAL', $h$The Tiny Luxury$h$, $b$Freshly cared-for hands and feet under clean sheets. Ridiculously simple. Surprisingly satisfying.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-HANDSFEET-030', 'handsfeet', 30, 'FEEL', $h$Today's Hands & Feet Rule$h$, $b$They don't need to be delicate, polished or perfect. They've been doing the work. Today we simply notice them.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-001', 'body', 1, 'CARE', $h$Moisturise Beyond the Face$h$, $b$Your body's skin deserves some of the attention your face gets. Give dry or comfortable-to-moisturise areas a little care today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-002', 'body', 2, 'KNOW', $h$The Post-Shower Window$h$, $b$Applying moisturiser after bathing while skin is still slightly damp can help trap moisture. Simple care counts.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-003', 'body', 3, 'CARE', $h$The Everything Shower's Smaller Sister$h$, $b$You don't need an hour. Ten unhurried minutes can still feel luxurious.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-004', 'body', 4, 'FEEL', $h$Your Body Is Not “Before”$h$, $b$This isn't the photograph before the transformation. This is your body today, and today counts.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-005', 'body', 5, 'FEEL', $h$Stretch Marks Are Skin, Not Failure$h$, $b$Skin changes with growth, pregnancy and life. You may care for its comfort without treating every mark as damage.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-006', 'body', 6, 'CARE', $h$Elbows, Knees, Heels$h$, $b$The three places that quietly wait while the face gets all the attention. Today's their turn.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-007', 'body', 7, 'KNOW', $h$Exfoliation Isn't Sanding Furniture$h$, $b$If exfoliation is part of your routine, gentler and appropriately spaced care beats scrubbing until skin protests.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-008', 'body', 8, 'FEEL', $h$Use the Body Lotion$h$, $b$Yes, the nice one. Apparently we've all been saving body lotion for a royal visit. Open it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-009', 'body', 9, 'RITUAL', $h$Body Oil as Ritual$h$, $b$Oil massage has deep roots in Indian self-care traditions. If you enjoy it and the product suits your skin, let it be a slow ritual rather than another obligation.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-010', 'body', 10, 'FEEL', $h$Your Shower Can Have a Soundtrack$h$, $b$Personal care doesn't have to happen in silence while someone bangs on the bathroom door.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-011', 'body', 11, 'KNOW', $h$Sun Sees More Than Your Face$h$, $b$When relevant, remember exposed body areas when thinking about sun protection.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-012', 'body', 12, 'FEEL', $h$Body Hair Is a Choice$h$, $b$Remove it, trim it, keep it. Grooming preference isn't a hygiene test or a femininity test.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-013', 'body', 13, 'FEEL', $h$Smell Good for Yourself$h$, $b$Body mist, perfume, scented lotion—or nothing at all. Choose the sensory experience you enjoy.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-014', 'body', 14, 'KNOW', $h$Your Skin Shouldn't Have to Hurt$h$, $b$Persistent itching, rashes, wounds or painful skin changes deserve proper attention rather than being hidden under cosmetic care.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-015', 'body', 15, 'CARE', $h$The Soft-Clothes Reset$h$, $b$Sometimes body care is changing out of something uncomfortable and into clothes your body can relax in.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-016', 'body', 16, 'FEEL', $h$No Pinching Today$h$, $b$Catch yourself pinching your stomach, arms or thighs in the mirror? Hands off. Your body isn't merchandise being inspected.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-017', 'body', 17, 'CARE', $h$The Five-Minute Body Massage$h$, $b$Shoulders, arms, legs—wherever feels good. No promises about “melting fat” or “removing toxins.” Just touch and comfort.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-018', 'body', 18, 'KNOW', $h$Bath Temperature Check$h$, $b$If very hot water leaves your skin dry or uncomfortable, slightly cooler may feel kinder.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-019', 'body', 19, 'CARE', $h$The Forgotten Back$h$, $b$If accessible or with help, your back deserves cleansing and moisturising attention too.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-020', 'body', 20, 'FEEL', $h$Wear the Good Nightwear$h$, $b$Why are the nicest clothes reserved for people outside your house? Put on the good pyjamas tonight.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-021', 'body', 21, 'RITUAL', $h$Fresh Sheets Count as Body Care$h$, $b$Clean sheets + shower + comfortable clothes. Sometimes luxury is incredibly ordinary.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-022', 'body', 22, 'KNOW', $h$Don't Let Social Media Diagnose Your Body$h$, $b$Not every bump, line, texture or asymmetry needs a treatment plan.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-023', 'body', 23, 'FEEL', $h$After Pregnancy Is Still Your Body$h$, $b$It isn't a temporary version waiting to become “normal” again. Care for it in the present tense.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-024', 'body', 24, 'CARE', $h$Choose Comfort Over Correction$h$, $b$Today ask: What would make my body more comfortable? Then do one thing.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-025', 'body', 25, 'CARE', $h$Body Care Can Be Two Minutes$h$, $b$Lotion on your arms. Cream on your heels. That's enough. Care doesn't require ceremony.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-026', 'body', 26, 'KNOW', $h$A Little Sun Sense$h$, $b$Shade, clothing and sunscreen are all tools for reducing excessive UV exposure. Protection doesn't have to rely on one product alone.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-027', 'body', 27, 'KNOW', $h$Don't Chase Every Body Treatment$h$, $b$“Detox,” “inch loss,” “instant tightening” and dramatic transformation claims deserve a critical eye.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-028', 'body', 28, 'FEEL', $h$Touch Your Body Kindly$h$, $b$Apply your lotion like you're caring for someone—not examining them for defects.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-029', 'body', 29, 'FEEL', $h$Comfort Is Beautiful$h$, $b$Clothing that lets you sit, breathe, eat and move comfortably isn't “giving up.” Your body isn't supposed to spend the day being punished by an outfit.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-BODY-030', 'body', 30, 'FEEL', $h$Today's Body Rule$h$, $b$No weighing. No measuring. No comparing. Just care.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-001', 'groom', 1, 'FEEL', $h$Grooming Is Optional$h$, $b$Brows done? Lovely. Brows untouched? Also lovely. Today's card is an invitation, not a standard you have to meet.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-002', 'groom', 2, 'CARE', $h$The Brow Minute$h$, $b$Brush them, shape them if that's your thing, or leave them gloriously alone.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-003', 'groom', 3, 'FEEL', $h$Facial Hair Isn't a Moral Issue$h$, $b$Thread, wax, shave, laser or keep it. Your choice is the only beauty rule that matters here.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-004', 'groom', 4, 'KNOW', $h$Clean Tools, Pretty Results$h$, $b$Tweezers, razors and grooming tools deserve regular cleaning too.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-005', 'groom', 5, 'KNOW', $h$Fresh Razor, Kinder Skin$h$, $b$If shaving is part of your routine, blunt or poorly maintained tools can make the experience unnecessarily rough.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-006', 'groom', 6, 'KNOW', $h$Salon Hygiene > Fancy Décor$h$, $b$Clean practices matter more than the Instagram wall.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-007', 'groom', 7, 'CARE', $h$Threading Day? Soothe, Don't Attack$h$, $b$If your skin feels irritated after hair removal, this isn't the moment to throw every strong active you own at it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-008', 'groom', 8, 'FEEL', $h$Brows Are Sisters, Not Photocopies$h$, $b$Perfect symmetry is not required. Your face isn't a geometry assignment.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-009', 'groom', 9, 'KNOW', $h$Oral Care Is Grooming Too$h$, $b$Your smile deserves a place in personal care. Give brushing, flossing/interdental care and dental check-ups the respect we give lipstick.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-010', 'groom', 10, 'CARE', $h$Tongue, Teeth, Fresh Start$h$, $b$Sometimes feeling put together begins with the most basic grooming rituals.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-011', 'groom', 11, 'FEEL', $h$Perfume Has No Dress Code$h$, $b$Spray it at home. Thursday doesn't need an audience.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-012', 'groom', 12, 'CARE', $h$The Five-Minute Polish$h$, $b$Hair brushed, face fresh, lips comfortable, clothes straightened. Sometimes five minutes changes how you carry the next five hours.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-013', 'groom', 13, 'FEEL', $h$Don't Over-Pluck the Mood Away$h$, $b$Brows can survive without achieving microscopic perfection today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-014', 'groom', 14, 'FEEL', $h$Waxing Isn't a Requirement$h$, $b$Body hair removal is a preference, not evidence of cleanliness.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-015', 'groom', 15, 'KNOW', $h$Check Before Strong Treatments$h$, $b$Lasers, strong peels and other cosmetic procedures deserve qualified providers, appropriate assessment and realistic expectations.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-016', 'groom', 16, 'CARE', $h$Your Grooming Kit Deserves a Clean-Up$h$, $b$Throw away the mystery sponge. Wash the brushes. You know which one we're talking about.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-017', 'groom', 17, 'KNOW', $h$Makeup Brushes Need Baths Too$h$, $b$Tools that repeatedly touch your face benefit from regular cleaning.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-018', 'groom', 18, 'FEEL', $h$Groom for the Mirror, Not the Crowd$h$, $b$Do the things that make you feel finished. Skip the ones you only do because somebody told you women should.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-019', 'groom', 19, 'CARE', $h$The Hair-Removal Aftercare Rule$h$, $b$Recently irritated skin deserves gentleness, not a competition between exfoliants.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-020', 'groom', 20, 'FEEL', $h$Your Natural Face Is Not “Ungroomed”$h$, $b$Makeup can be fun. It is not proof that you made an effort.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-021', 'groom', 21, 'CARE', $h$Check the Expiry Pile$h$, $b$That product you've owned since an uncertain historical period? Today's a good day to investigate it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-022', 'groom', 22, 'KNOW', $h$Clean Makeup Is Better Makeup$h$, $b$Don't casually share products that contact eyes or lips, particularly when hygiene is uncertain.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-023', 'groom', 23, 'CARE', $h$One Tiny Detail$h$, $b$Earrings. Kajal. Brows. Hair. Perfume. Choose one thing. Done.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-024', 'groom', 24, 'FEEL', $h$Salon Appointment Permission$h$, $b$If grooming appointments make you feel good and fit your circumstances, you don't need a wedding coming up to book one.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-025', 'groom', 25, 'KNOW', $h$Hair Removal Shouldn't Mean Injury$h$, $b$Recurrent burns, significant irritation or wounds aren't an expected price of grooming. Reconsider the method or seek appropriate advice.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-026', 'groom', 26, 'FEEL', $h$Makeup Because It's Fun$h$, $b$Not because your bare face requires an apology.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-027', 'groom', 27, 'RITUAL', $h$The Ten-Minute Getting-Ready Date$h$, $b$Get ready slightly more slowly today. Notice the difference between grooming in panic and grooming with attention.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-028', 'groom', 28, 'FEEL', $h$Your Version of Polished$h$, $b$For one woman it's red lipstick. Another, clean hair. Another, absolutely nothing on her face. Define yours.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-029', 'groom', 29, 'FEEL', $h$Don't Zoom In$h$, $b$Nobody meets you at 10× magnification. Stop grooming for the phone camera's macro lens.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-GROOM-030', 'groom', 30, 'FEEL', $h$Today's Grooming Rule$h$, $b$Enhance if you want. Remove if you want. Add if you want. Leave it alone if you want. It's still your face and body.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-001', 'feelgood', 1, 'FEEL', $h$Wear the Outfit$h$, $b$Stop waiting for the dinner, holiday or imaginary perfect body. If you love it, today qualifies.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-002', 'feelgood', 2, 'FEEL', $h$The Lipstick Has Been Waiting$h$, $b$Wear the colour you keep saving. The school run can handle it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-003', 'feelgood', 3, 'FEEL', $h$Perfume Before Breakfast$h$, $b$Smelling wonderful is allowed even when your most glamorous appointment today is with the laundry basket.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-004', 'feelgood', 4, 'FEEL', $h$Dress for a Feeling$h$, $b$Don't ask, “Does this make me look thinner?” Ask, “How do I feel in this?”$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-005', 'feelgood', 5, 'FEEL', $h$Jewellery Doesn't Need an Invitation$h$, $b$Wear the earrings. Even with a T-shirt. Especially with a T-shirt.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-006', 'feelgood', 6, 'FEEL', $h$Your Good Clothes Are Getting Lonely$h$, $b$Rescue one thing from the “special occasion” section of your wardrobe.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-007', 'feelgood', 7, 'RITUAL', $h$Colour Therapy, Minus the Therapy Claim$h$, $b$Pick a colour that simply makes you happy to look at. Wear some of it today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-008', 'feelgood', 8, 'CARE', $h$The Five-Minute Hair Upgrade$h$, $b$Do one thing differently—parting, bun, braid, blow-dry, accessory. Tiny change, fresh feeling.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-009', 'feelgood', 9, 'FEEL', $h$Posture Check, Not Body Check$h$, $b$Uncurl for a moment. Shoulders comfortable. Head up. Take up the space you're already standing in.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-010', 'feelgood', 10, 'FEEL', $h$You Don't Need to Earn Pretty$h$, $b$No target weight. No event. No “once I…” Wear the thing now.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-011', 'feelgood', 11, 'FEEL', $h$The Compliment Rule$h$, $b$If someone compliments you today, you're only allowed to say “Thank you.” No explaining why they're wrong.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-012', 'feelgood', 12, 'FEEL', $h$Take the Photo$h$, $b$You don't have to wait until you feel thinner, rested, dressed up or “camera ready.” Get in the photograph.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-013', 'feelgood', 13, 'RITUAL', $h$Main Character Errand$h$, $b$Sunglasses. Favourite playlist. Nice shoes. Go buy the coriander like the opening scene depends on it.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-014', 'feelgood', 14, 'FEEL', $h$Wear Something Just for You$h$, $b$Something nobody else may even notice. Perfume, lingerie, anklet, ring—you know it's there.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-015', 'feelgood', 15, 'FEEL', $h$Your Wardrobe Works for You$h$, $b$Clothes are supposed to fit bodies. Bodies are not supposed to spend their lives trying to fit clothes.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-016', 'feelgood', 16, 'FEEL', $h$The Mirror Is Not a Courtroom$h$, $b$Look, adjust what you want, smile if you feel like it, and leave. No prosecution today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-017', 'feelgood', 17, 'FEEL', $h$Bring Back an Old Signature$h$, $b$Kajal? Hoops? Red nails? A particular perfume? Reintroduce something that once felt unmistakably you.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-018', 'feelgood', 18, 'FEEL', $h$Try the Thing You Thought Wasn't “For You”$h$, $b$Bold lip, oversized shirt, sneakers with a dress, bright colour. You are allowed to change your mind about your own style.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-019', 'feelgood', 19, 'FEEL', $h$Your Age Doesn't Ban Anything$h$, $b$Style doesn't suddenly issue a prohibited-items list after motherhood or a birthday.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-020', 'feelgood', 20, 'CARE', $h$Feel-Good Hair, Your Way$h$, $b$Sleek, curly, messy bun, braid, natural texture—choose what makes you enjoy your reflection today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-021', 'feelgood', 21, 'CARE', $h$The Ten-Minute Ready-Up$h$, $b$Give yourself ten minutes that aren't stolen between packing bags and finding somebody else's socks.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-022', 'feelgood', 22, 'FEEL', $h$Take Up Visual Space$h$, $b$Bright colour. Big earrings. Pattern. Or head-to-toe black. Whatever makes you feel present rather than invisible.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-023', 'feelgood', 23, 'FEEL', $h$Repeat the Outfit$h$, $b$If you looked fantastic in it last Friday, congratulations: clothes are reusable.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-024', 'feelgood', 24, 'FEEL', $h$Your Body Isn't Ruining the Outfit$h$, $b$If something doesn't work, change the clothing—not your opinion of your body.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-025', 'feelgood', 25, 'CARE', $h$The Tiny Upgrade$h$, $b$One accessory can change the whole mood. Pick one and stop there.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-026', 'feelgood', 26, 'FEEL', $h$Dress Up at Home$h$, $b$There is no law requiring your nicest version to be reserved exclusively for strangers outside the house.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-027', 'feelgood', 27, 'FEEL', $h$Confidence Doesn't Require Makeup$h$, $b$Some Fridays are lipstick Fridays. Some are freshly washed face Fridays. Both count.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-028', 'feelgood', 28, 'FEEL', $h$Take Yourself Seriously$h$, $b$Wear something that makes you feel capable today—not necessarily prettier. There's a difference.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-029', 'feelgood', 29, 'FEEL', $h$Look Once, Then Go Live$h$, $b$Get ready, look in the mirror once, decide you're done and stop checking yourself every reflective surface you pass.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-FEELGOOD-030', 'feelgood', 30, 'FEEL', $h$Friday's Rule$h$, $b$You are not dressing to disguise yourself. You're dressing to enjoy yourself.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-001', 'mycare', 1, 'FEEL', $h$Choose Your Favourite$h$, $b$Which care moment from this week did you actually enjoy? Do that one again.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-002', 'mycare', 2, 'CARE', $h$The Longer Shower$h$, $b$If you can, claim the bathroom for a little longer today. No speed record required.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-003', 'mycare', 3, 'CARE', $h$Book the Appointment$h$, $b$Haircut, dentist, dermatologist, manicure, massage—whatever you've genuinely been meaning to arrange for yourself.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-004', 'mycare', 4, 'FEEL', $h$Do Absolutely Less$h$, $b$Personal care doesn't always mean adding another ritual. Maybe today's care is cancelling one.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-005', 'mycare', 5, 'RITUAL', $h$Fresh-Sheets Saturday$h$, $b$Shower, clean sheets, comfortable nightwear. Extremely ordinary. Extremely good.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-006', 'mycare', 6, 'FEEL', $h$Use the Good Stuff$h$, $b$Open one product you've been saving. Your ordinary Saturday is an occasion.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-007', 'mycare', 7, 'CARE', $h$Care Where You Need It$h$, $b$Hair? Face? Feet? Body? Mind? Look at the week and choose what feels neglected—not what looks imperfect.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-008', 'mycare', 8, 'FEEL', $h$Salon or Sofa?$h$, $b$Both are legitimate self-care locations. Pick the one you actually want today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-009', 'mycare', 9, 'FEEL', $h$The No-Mirror Care Day$h$, $b$Do something that feels good physically without checking whether it made you look different afterwards.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-010', 'mycare', 10, 'RITUAL', $h$Your Personal Ritual$h$, $b$What did women in your family do that felt like care—hair oiling, champi, ubtan, foot massage? Keep the parts you love, without needing every traditional claim to be scientifically true.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-011', 'mycare', 11, 'CARE', $h$Wash the Tools$h$, $b$Brushes, combs, makeup brushes, reusable grooming tools. Today the things that care for you get cared for too.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-012', 'mycare', 12, 'FEEL', $h$Rest Is Allowed on the Chart$h$, $b$If you're exhausted, you don't need to earn rest by completing a beauty ritual first.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-013', 'mycare', 13, 'CARE', $h$The Home Spa Without the Drama$h$, $b$Pick exactly one thing. Hair mask, foot soak, face massage, body lotion. Pinterest is not invited.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-014', 'mycare', 14, 'KNOW', $h$Go Professional When Needed$h$, $b$A persistent skin, hair, nail or body concern doesn't have to become a DIY research project. Appropriate professional care is self-care too.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-015', 'mycare', 15, 'CARE', $h$Restock Yourself$h$, $b$Check whether your essentials are running out for once—not nappies, cereal, toothpaste for everyone else. Yours.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-016', 'mycare', 16, 'CARE', $h$The Comfort Audit$h$, $b$Is anything you're wearing, using or doing repeatedly uncomfortable? Today, change one thing.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-017', 'mycare', 17, 'CARE', $h$Ten Minutes Behind a Closed Door$h$, $b$No elaborate ritual required. Take ten minutes that aren't available to anybody else if your circumstances allow.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-018', 'mycare', 18, 'KNOW', $h$Care Can Be Preventive$h$, $b$Personal care also means keeping up with appropriate health, dental, vision and other routine check-ups—not just what appears in the mirror.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-019', 'mycare', 19, 'KNOW', $h$Don't DIY Everything$h$, $b$Strong cosmetic treatments, persistent symptoms and procedures requiring expertise are allowed to remain professional territory.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-020', 'mycare', 20, 'CARE', $h$The “I Keep Meaning To” Thing$h$, $b$You've thought about booking/changing/buying/fixing something for yourself five times. Handle one of them today.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-021', 'mycare', 21, 'FEEL', $h$Choose Pleasure$h$, $b$Which care ritual feels nicest rather than produces the most impressive result? Choose that.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-022', 'mycare', 22, 'CARE', $h$Your Body Gets a Vote$h$, $b$Tired? Rest. Dry? Moisturise. Achy? Get comfortable. Overstimulated? Quiet. Care begins by noticing.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-023', 'mycare', 23, 'CARE', $h$The Twenty-Minute Appointment With Yourself$h$, $b$Put it in your day like any other appointment. Nobody needs to know it's just you, tea and a hair mask.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-024', 'mycare', 24, 'FEEL', $h$Skip What You Hate$h$, $b$If you despise manicures, don't do manicures because a self-care list said so. Build rituals you actually want to repeat.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-025', 'mycare', 25, 'CARE', $h$Buy One Care Essential for Yourself$h$, $b$Only if you genuinely need it and it fits your budget. Self-care should not secretly become compulsory shopping.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-026', 'mycare', 26, 'CARE', $h$Ask for Help to Make Time$h$, $b$Sometimes self-care isn't finding more time. It's saying, “Can you take over for half an hour?”$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-027', 'mycare', 27, 'FEEL', $h$Your Care Has Seasons$h$, $b$What felt manageable with a newborn may be different six months later. Your rituals are allowed to evolve with your life.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-028', 'mycare', 28, 'FEEL', $h$No Catching Up$h$, $b$Missed three Care days? Nothing is overdue. Pick what you want today. The week owes nobody homework.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-029', 'mycare', 29, 'FEEL', $h$Look Back Kindly$h$, $b$What did you do for yourself this week—even something tiny? Notice that instead of cataloguing everything you didn't do.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;

insert into care_for_yourself_notes
  (id, category, note_number, content_type, headline, care_note, tiny_action, safety_flag)
values
  ('CARE-MYCARE-030', 'mycare', 30, 'FEEL', $h$Saturday's Rule$h$, $b$You don't need to improve yourself today. Just include yourself in the people you're taking care of.$b$, null, 'draft')
on conflict (id) do update set
  category = excluded.category,
  note_number = excluded.note_number,
  content_type = excluded.content_type,
  headline = excluded.headline,
  care_note = excluded.care_note,
  tiny_action = excluded.tiny_action,
  safety_flag = excluded.safety_flag,
  is_active = true;
