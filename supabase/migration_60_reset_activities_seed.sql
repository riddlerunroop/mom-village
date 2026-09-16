-- MOM VILLAGE — MIGRATION 60
-- Seeds the 30 locked Reset cards, in Roop's own final wording and voice —
-- see CLAUDE.md's 2026-09-16 Reset rebuild entry for the design history.
-- Per-row inserts with on conflict(card_number) do update, same pattern
-- established for the Nourish series: makes re-running this file safe if
-- Roop ever wants to tweak a card's wording later, and isolates any single
-- row's failure rather than losing the whole batch. Dollar-quoted strings
-- ($txt$...$txt$) used throughout so apostrophes in the copy ("that's",
-- "you're", "nobody's") never need manual escaping.

insert into reset_activities (card_number, emoji, title, body) values
(1, $txt$💃$txt$, $txt$Main Character for One Song$txt$, $txt$Put on that song. The one your body knows before your brain does. Kitchen, bedroom, bathroom—wherever you are, you're the main character until it ends. Bad dancing gets extra points.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(2, $txt$🎧$txt$, $txt$Summon Your Younger Self$txt$, $txt$Find one song you were completely obsessed with in another lifetime. College. First job. First love. Bad decisions. Press play and see who turns up.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(3, $txt$💄$txt$, $txt$Overdressed & Going Nowhere$txt$, $txt$Wear the lipstick. Put on the earrings. Spray the expensive perfume. Maybe even the heels. Destination: absolutely nowhere.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(4, $txt$🚶$txt$, $txt$The Completely Pointless Walk$txt$, $txt$Go outside for 15 minutes with no errand disguised as self-care. No milk. No pharmacy. No picking anything up. Wander. Turn around whenever you want.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(5, $txt$🛍️$txt$, $txt$Shop Like You're Rich. Spend ₹0.$txt$, $txt$You have 20 minutes and an imaginary unlimited budget. Fill that cart shamelessly. Clothes, shoes, ridiculous bag—whatever you want. Then close the app. Financial damage: ₹0.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(6, $txt$💐$txt$, $txt$Buy Yourself the Damn Flowers$txt$, $txt$Stop waiting for someone to arrive holding them. One rose from the roadside works. A giant bouquet works too. They're from you, to you.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(7, $txt$😂$txt$, $txt$Find Something Stupidly Funny$txt$, $txt$Your mission is not enlightenment. Your mission is to laugh. Find the reel, comedian, old scene or ridiculous video that gets you. Five minutes of nonsense prescribed.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(8, $txt$☎️$txt$, $txt$Call Someone Who Knew the Old You$txt$, $txt$Call the person who remembers you before feeding schedules, school WhatsApps and tiny people yelling Mumma. No occasion. Just: "Oye, what are you doing?"$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(9, $txt$☕$txt$, $txt$Take Yourself on a Tiny Date$txt$, $txt$Go get coffee/chai alone. Sit down. Drink it while it's actually hot. And no grocery shopping on the way back. That ruins the Reset.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(10, $txt$📺$txt$, $txt$Time Machine: ON$txt$, $txt$Find one thing from childhood—an old show, song, chocolate, ad, smell, anything. Give yourself ten minutes in a decade where your biggest problem was probably homework.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(11, $txt$✉️$txt$, $txt$Write It. Don't Send It.$txt$, $txt$There's something you've been dying to say? Excellent. Write the uncensored version. No diplomacy. No perfect wording. The Send button is forbidden.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(12, $txt$👗$txt$, $txt$Raid Your Own Wardrobe$txt$, $txt$Pull out the thing you're always "saving." The dress. The heels. The jewellery. Try it on. Look in the mirror. You don't need somewhere to go to deserve your own clothes.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(13, $txt$🎨$txt$, $txt$Make Something Terrible$txt$, $txt$Doodle. Paint. Fold paper. Make a bracelet. Decorate something. The only rule: it is absolutely allowed to be rubbish.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(14, $txt$🎤$txt$, $txt$Your Neighbours Didn't Ask for This Concert$txt$, $txt$Pick a song. Sing loudly. Sing badly. Hairbrush microphone strongly encouraged. Talent is completely irrelevant.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(15, $txt$🐈$txt$, $txt$Stretch Like Nobody Invented Fitness$txt$, $txt$Five minutes. No reps. No calories. No "core activation." Stretch whatever feels like it wants stretching. This does not count as a workout—and that's the point.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(16, $txt$📱$txt$, $txt$Go Digging in an Ancient Chat$txt$, $txt$Find an old conversation that once had you laughing, flirting, gossiping or being completely ridiculous. Scroll until you find something you'd forgotten.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(17, $txt$🍕$txt$, $txt$Eat the Thing$txt$, $txt$What do you actually feel like eating? Not what everyone else wants. Not what is sensible. Pick one thing that sounds delicious and have it without turning it into a nutritional debate.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(18, $txt$✨$txt$, $txt$Fix One Tiny Corner of Your Universe$txt$, $txt$Choose one tiny thing: bedside table, handbag, one shelf, phone screen. Give it ten minutes. Stop there. Do NOT accidentally reorganise the entire house.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(19, $txt$📸$txt$, $txt$Find Her$txt$, $txt$Scroll back until you find a photograph of yourself from a completely different chapter. Look at her properly. What did she love? What did she think her life would look like?$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(20, $txt$🧴$txt$, $txt$Pretend You're at a Very Expensive Spa$txt$, $txt$You have ten minutes. Wash your face slowly. Massage it. Use the product you've been "saving." Nobody is allowed to ask you where their socks are.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(21, $txt$✈️$txt$, $txt$Plan a Holiday You Have Absolutely Not Booked$txt$, $txt$Pick somewhere. Check the gorgeous hotel. Look at flights. Find the café you'd go to. Build the fantasy. Reality does not need to be consulted today.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(22, $txt$⏳$txt$, $txt$Send Something to Future You$txt$, $txt$Write one line about today. Something funny, awful, beautiful or completely ordinary. Save it somewhere you'll rediscover later. Future You gets today's postcard.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(23, $txt$🌸$txt$, $txt$Smell Something Wonderful for No Productive Reason$txt$, $txt$Perfume. Coffee. Mitti after rain. Baby's head. Flowers. A candle. Find a smell you love and stay there for a minute. That's the entire assignment.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(24, $txt$📖$txt$, $txt$Read Exactly One Page$txt$, $txt$Find something that isn't instructions, WhatsApp or a school circular. Novel, poetry, magazine—anything. Read one page. If you accidentally want another, that's between you and the book.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(25, $txt$🎙️$txt$, $txt$Send the Random Voice Note$txt$, $txt$Pick someone you love and send: "No reason. I just thought of you." Then ramble for a minute like people did before every conversation needed a purpose.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(26, $txt$🪟$txt$, $txt$Be Completely Useless for Five Minutes$txt$, $txt$Sit somewhere. No phone. No laundry folding. No planning dinner in your head. Stare out the window if necessary. For five minutes, your productivity is officially cancelled.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(27, $txt$🎶$txt$, $txt$Let the Algorithm Pick Your Next Obsession$txt$, $txt$Find an artist or song you've never heard. No research. No reviews. Press play. Maybe you discover your next repeat-for-three-weeks song.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(28, $txt$🕵️$txt$, $txt$Solve a Mystery from Your Childhood$txt$, $txt$Whatever happened to that actor? That chocolate? That cartoon? That weird place your family visited once? You have ten minutes to investigate something completely unnecessary.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(29, $txt$🪞$txt$, $txt$Compliment the Woman in the Mirror$txt$, $txt$Look at yourself and say one genuinely nice thing out loud. Not "considering I've had kids…" Not "if only I lost…" No disclaimer allowed.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;

insert into reset_activities (card_number, emoji, title, body) values
(30, $txt$🌙$txt$, $txt$Build Your Completely Selfish Someday List$txt$, $txt$Write five things you want. Not for the children. Not for the house. Not for the family. Tiny or outrageous—bag, tattoo, course, solo trip, business, haircut, concert. For once, nobody else gets a slot on this list.$txt$)
on conflict (card_number) do update set emoji = excluded.emoji, title = excluded.title, body = excluded.body;
