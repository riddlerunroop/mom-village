// Care tab — rebuilt 2026-07-31 per the layout brief's three-stage flow:
// landing screen -> three-question check-in -> five-card daily chart.
// Queries care_chart_week_content (all 197 weeks live, pregnancy 1-39 +
// postpartum 0-156) the same way the website's care/chart page does.

import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { calculateCareWeek, careWeekLabel, carePhaseLabel, journeyWeekNumber } from "../../lib/weekCalculator";
import { calculateNourishLookup, nourishGapWeek } from "../../lib/nourishCalculator";
import { pickDailyResetIndex } from "../../lib/resetCalculator";
import { careCategoryForDate, pickCareNoteId, type CareCategory } from "../../lib/careForYourselfCalculator";
import { Colors, Fonts, iconBadge, moduleCard, moduleTitle, moduleEyebrow } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";
import ResetOfTheDay, { type ResetActivityRow } from "../../components/ResetOfTheDay";
import CareForYourself, { type CareForYourselfNoteRow } from "../../components/CareForYourself";

// Move — fully replaced 2026-08-03 with the real "Move" series (11
// separately drafted, reviewed and locked documents spanning pregnancy
// weeks 1-39 through postpartum weeks 0-156 — see
// move-series-clinical-verification-2026-08-03.md and CLAUDE.md). Same
// shape as the website's CareWeekContent.tsx: each week carries its own
// format (the tiers3 Restore/Rebuild/Thrive choice for First trimester
// weeks 1-9, or the Reset/Move/Build/Release "sections" format for every
// other week) rather than the app auto-picking a tier from her check-in.
type MoveExercise = { name: string; focus: string; benefit: string; mistake: string; tip: string };
type MoveDoor = { pattern: string; comfort: string; steady: string; challenge: string };
type MoveTiers3 = { restore: string[]; rebuild: string[]; thrive: string[] };
type MoveContent = {
  format: "tiers3" | "sections";
  theme: string;
  mantra: string;
  tiers?: MoveTiers3 | null;
  reset?: string | null;
  today?: string | null;
  build?: string[] | null;
  release?: string | null;
  recoveryRoute?: Record<string, string> | null;
  door?: MoveDoor | null;
  exercise: MoveExercise;
  inRealLife?: string | null;
  why: string;
  quote?: string | null;
  note?: string | null;
  clinicalFlag?: string | null;
  progressionNote?: string | null;
  safety: string;
  recovery?: string[] | null;
  reflectionPrompt?: string | null;
  closingLabel: string;
  closingText: string;
  lookingAhead?: string | null;
  milestone?: string | null;
  breathLegacy?: string | null;
  philosophy?: string | null;
  childLearned?: string[] | null;
  whatYouGaveYourself?: string[] | null;
  finalNote?: string | null;
  signatureLine?: string[] | null;
};
type ResetContent = {
  heavy_day: string;
  a_little_low: string;
  okay: string;
  good: string;
  really_good: string;
};
type ConditionNote = { flag: string; note: string };

// Nourish weekly meal-plan series (nourish_week_content, migration_54) —
// see mobile/lib/nourishCalculator.ts and the website's equivalent for the
// full history. A separate numbering system from journeyWeekNumber above.
type NourishDay = {
  day_number: number;
  title: string;
  notes: string | null;
  breakfast_a: string | null;
  breakfast_b: string | null;
  lunch_a: string | null;
  lunch_b: string | null;
  nourishment_break_a: string | null;
  nourishment_break_b: string | null;
  dinner_a: string | null;
  dinner_b: string | null;
  still_hungry: string | null;
};
type NourishWeekRow = {
  stage: "pregnancy" | "postpartum";
  week_number: number;
  theme_title: string;
  mantra: string | null;
  why_it_matters: string | null;
  condition_notes: string | null;
  meat_fish_eggs_note: string | null;
  using_meals_note: string | null;
  days: NourishDay[];
  reflection: string | null;
  looking_ahead: string | null;
};

type WeekRow = {
  week_number: number;
  theme_title: string;
  mantra: string;
  priority: string;
  journey: string;
  what_you_may_notice: string[];
  move: MoveContent;
  nourish: string;
  hydration_goal: string;
  feeding_comfort: string | null;
  rest_support: string | null;
  reset: ResetContent;
  // Superseded 2026-09-18 by the new Care for Yourself module (see
  // CLAUDE.md) — kept on the type only because the column still exists
  // and the select query still reads it; no longer rendered below.
  care_for_yourself: string;
  // Superseded 2026-09-19 by the new standalone Rediscover module (see
  // CLAUDE.md) — kept on the type only because the column still exists
  // and the select query still reads it; no longer rendered below.
  your_corner: string;
  support_moment: string;
  celebrate_this_week: string;
  mental_health_note: string | null;
  for_your_care_team: string;
  for_your_care_team_who: string | null;
  for_your_care_team_lede: string | null;
  for_your_care_team_detail: string | null;
  condition_notes: ConditionNote[] | null;
};

function primaryRouteKeyFor(deliveryType: string | undefined | null, keys: string[]): string | null {
  if (deliveryType === "c_section") return keys.find((k) => k.toLowerCase().includes("caesarean")) ?? null;
  if (deliveryType === "normal") return keys.find((k) => k.toLowerCase().includes("vaginal")) ?? null;
  return null;
}
function titleCaseRoute(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

// Same fix as the web CareWeekContent.tsx, 2026-08-03: several later
// batches (postpartum weeks 79-156) were drafted with a literal generic
// filler sentence standing in for real content on fields not given a
// distinct answer that week — confirmed via grep across the migrations
// (338+ exact occurrences). Hide a card entirely rather than show that
// filler text as if it were real guidance. A real content rewrite for the
// affected weeks is tracked separately (see CLAUDE.md).
const EMPTY_FIELD_VALUES = new Set([
  "No specific note this week.",
  "No specific ask this week.",
  "No specific caution this week.",
  "No specific movement theme this week.",
  "No specific change this week.",
]);

function hasContent(value?: string | null): value is string {
  if (!value) return false;
  const cleaned = value.replace(/\s*(—\s*)+-*\s*$/, "").trim();
  return cleaned.length > 0 && !EMPTY_FIELD_VALUES.has(cleaned);
}

const TIME_OPTIONS = [
  { value: "5", label: "5", unit: "min" },
  { value: "15", label: "15", unit: "min" },
  { value: "30", label: "30", unit: "min" },
];
const ENERGY_OPTIONS: { value: number; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 1, label: "Running on empty", icon: "battery-dead-outline" },
  { value: 2, label: "Low, but here", icon: "battery-half-outline" },
  { value: 3, label: "Steady", icon: "leaf-outline" },
  { value: 4, label: "Good energy", icon: "sunny-outline" },
  { value: 5, label: "Feeling strong", icon: "flash-outline" },
];
const MOOD_OPTIONS: { value: number; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 1, label: "Heavy day", icon: "rainy-outline" },
  { value: 2, label: "A little low", icon: "cloud-outline" },
  { value: 3, label: "Okay", icon: "partly-sunny-outline" },
  { value: 4, label: "Good", icon: "sunny-outline" },
  { value: 5, label: "Really good", icon: "sparkles-outline" },
];
// "Rediscover" removed, 2026-09-19 — it's no longer a Care Chart pillar at
// all. Roop's explicit call to pull it out entirely and build it as its own
// standalone marketplace module (see the new Rediscover pointer card below).
// Care Chart is back to 4 daily pillars.
const PILLARS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "move", label: "Move", icon: "body-outline" },
  { key: "nourish", label: "Nourish", icon: "nutrition-outline" },
  { key: "reset", label: "Reset", icon: "flower-outline" },
  { key: "care_for_yourself", label: "Care for yourself", icon: "hand-left-outline" },
];

type Stage = "landing" | "checkin" | "chart";

export default function CareScreen() {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("landing");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [week, setWeek] = useState<number | null>(null);
  const [deliveryType, setDeliveryType] = useState<string | null>(null);
  const [healthFlags, setHealthFlags] = useState<string[]>([]);
  const [checkin, setCheckin] = useState<{ time_available: string; mood_score: number } | null>(null);
  const [weekContent, setWeekContent] = useState<WeekRow | null>(null);
  const [nourishWeek, setNourishWeek] = useState<NourishWeekRow | null>(null);
  const [nourishToday, setNourishToday] = useState<NourishDay | null>(null);
  const [resetActivity, setResetActivity] = useState<ResetActivityRow | null>(null);
  const [resetDoneToday, setResetDoneToday] = useState(false);
  const [resetTotalCompletions, setResetTotalCompletions] = useState(0);
  const [careForYourselfCategory, setCareForYourselfCategory] = useState<CareCategory | null>(null);
  const [careForYourselfNote, setCareForYourselfNote] = useState<CareForYourselfNoteRow | null>(null);
  const [careForYourselfDoneToday, setCareForYourselfDoneToday] = useState(false);
  const [careForYourselfWeekCount, setCareForYourselfWeekCount] = useState(0);

  const [timeChoice, setTimeChoice] = useState<string | null>(null);
  const [energyChoice, setEnergyChoice] = useState<number | null>(null);
  const [moodChoice, setMoodChoice] = useState<number | null>(null);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("baby_dob, due_date, delivery_type")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (!profile.baby_dob && !profile.due_date)) {
      setLoading(false);
      return;
    }

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);

    const w = calculateCareWeek(profile.baby_dob ?? null, profile.due_date ?? null);
    setWeek(w);
    setDeliveryType(profile.delivery_type ?? null);

    if (!subscribed || w === null) {
      setLoading(false);
      return;
    }

    // Reset of the day (migration_59/60, 2026-09-16) — a village-wide,
    // date-based rotation through the 30-card bank, independent of her
    // pregnancy/postpartum week. See lib/resetCalculator.ts and CLAUDE.md.
    const today0 = new Date().toISOString().slice(0, 10);
    const { data: resetActivities } = await supabase
      .from("reset_activities")
      .select("id, card_number, emoji, title, body")
      .eq("is_active", true)
      .order("card_number");
    if (resetActivities && resetActivities.length > 0) {
      setResetActivity(resetActivities[pickDailyResetIndex(resetActivities.length, today0)]);
    }
    const { count: totalResetCount } = await supabase
      .from("user_reset_completions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    setResetTotalCompletions(totalResetCount ?? 0);
    const { data: todayResetRow } = await supabase
      .from("user_reset_completions")
      .select("id")
      .eq("user_id", user.id)
      .eq("completed_date", today0)
      .maybeSingle();
    setResetDoneToday(Boolean(todayResetRow));

    // Care for yourself (migration_61/62, 2026-09-18) — the seven-day
    // personal-care rhythm that fully replaces the old generic per-week
    // care_for_yourself text field. See lib/careForYourselfCalculator.ts
    // and CLAUDE.md for the full spec.
    const careCategory = careCategoryForDate(today0);
    setCareForYourselfCategory(careCategory);
    const { data: careNotes } = await supabase
      .from("care_for_yourself_notes")
      .select("id, category, content_type, headline, care_note, tiny_action")
      .eq("category", careCategory)
      .eq("is_active", true)
      .order("note_number");
    const pickedCareNoteId = pickCareNoteId(
      user.id,
      careCategory,
      (careNotes || []).map((n) => ({ id: n.id, contentType: n.content_type })),
      today0
    );
    setCareForYourselfNote((careNotes || []).find((n) => n.id === pickedCareNoteId) ?? null);

    const sevenDaysAgo = new Date(new Date(`${today0}T00:00:00Z`).getTime() - 6 * 86400000)
      .toISOString()
      .slice(0, 10);
    const { data: careCompletionRows } = await supabase
      .from("user_care_completions")
      .select("completed_date")
      .eq("user_id", user.id)
      .gte("completed_date", sevenDaysAgo);
    setCareForYourselfWeekCount(careCompletionRows?.length ?? 0);
    setCareForYourselfDoneToday((careCompletionRows || []).some((r) => r.completed_date === today0));

    const { data: careProfile } = await supabase
      .from("user_care_profile")
      .select("health_flags")
      .eq("user_id", user.id)
      .maybeSingle();
    setHealthFlags(careProfile?.health_flags || []);

    // Nourish weekly meal plan (nourish_week_content, migration_54) — a
    // completely separate lookup from journeyWeekNumber above, computed
    // from ordinary gestational week / weeks-since-birth. See
    // lib/nourishCalculator.ts. Skipped for the genuine pregnancy weeks
    // 2-8 gap (no locked content exists for those weeks yet).
    const nourishLookup = calculateNourishLookup(profile.baby_dob ?? null, profile.due_date ?? null);
    if (nourishLookup && !nourishGapWeek(nourishLookup)) {
      const { data: nourishRow } = await supabase
        .from("nourish_week_content")
        .select(
          "stage, week_number, theme_title, mantra, why_it_matters, condition_notes, meat_fish_eggs_note, using_meals_note, days, reflection, looking_ahead"
        )
        .eq("stage", nourishLookup.stage)
        .eq("week_number", nourishLookup.weekNumber)
        .maybeSingle();
      const nw = nourishRow as NourishWeekRow | null;
      setNourishWeek(nw);
      setNourishToday(nw ? nw.days.find((d) => d.day_number === nourishLookup.dayNumber) ?? null : null);
    } else {
      setNourishWeek(null);
      setNourishToday(null);
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: todayCheckin } = await supabase
      .from("user_daily_checkin")
      .select("time_available, mood_score")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle();

    if (todayCheckin) {
      setCheckin(todayCheckin);
      const journeyWeek = journeyWeekNumber(w);
      const { data: weekRow } = await supabase
        .from("care_chart_week_content")
        .select(
          "week_number, theme_title, mantra, priority, journey, what_you_may_notice, move, nourish, hydration_goal, feeding_comfort, rest_support, reset, care_for_yourself, your_corner, support_moment, celebrate_this_week, mental_health_note, for_your_care_team, for_your_care_team_who, for_your_care_team_lede, for_your_care_team_detail, condition_notes"
        )
        .eq("week_number", journeyWeek)
        .maybeSingle();
      setWeekContent(weekRow as WeekRow | null);
    }

    setLoading(false);
  }, []);

  // Refetch every time this tab comes back into focus, not just on first
  // mount — a plain useEffect(load, []) only ran once ever, so changing the
  // due date/DOB in Account and returning to Care kept showing whatever
  // week loaded the very first time, no matter what she actually changed.
  // Caught live 2026-08-03: "whichever date I chose, it just asks me to go
  // for a short walk" — same frozen content every time, not a content
  // problem. Matches the same useFocusEffect pattern Community already used.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function submitCheckin() {
    if (!timeChoice || !energyChoice || !moodChoice) return;
    setSavingCheckin(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSavingCheckin(false);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("user_daily_checkin").upsert({
      user_id: user.id,
      checkin_date: today,
      time_available: timeChoice,
      energy_score: energyChoice,
      mood_score: moodChoice,
    });
    setSavingCheckin(false);
    await load();
    setStage("chart");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  const weekLabel = week !== null ? careWeekLabel(week) : null;
  const phaseLabel = week !== null ? carePhaseLabel(week) : null;

  return (
    <View style={styles.screen}>
      {stage === "landing" ? (
        <ScreenHeader />
      ) : (
        <View style={[styles.drillHeader, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => setStage("landing")} hitSlop={10}>
            <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
          </Pressable>
          <Text style={styles.wordmark}>
            mom<Text style={{ color: Colors.goldDeep }}>village</Text>
          </Text>
          <View style={{ width: 22 }} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {!isSubscribed ? (
          <LockedView label={weekLabel} />
        ) : stage === "landing" ? (
          <LandingView
            weekLabel={weekLabel}
            phaseLabel={phaseLabel}
            hasCheckedInToday={!!checkin}
            onBuild={() => setStage(checkin ? "chart" : "checkin")}
          />
        ) : stage === "checkin" ? (
          <CheckinView
            timeChoice={timeChoice}
            energyChoice={energyChoice}
            moodChoice={moodChoice}
            setTimeChoice={setTimeChoice}
            setEnergyChoice={setEnergyChoice}
            setMoodChoice={setMoodChoice}
            saving={savingCheckin}
            onSubmit={submitCheckin}
          />
        ) : !weekContent || !checkin ? (
          <View style={styles.card}>
            <Text style={styles.lockedBody}>
              This week's content isn't loaded yet — check back soon.
            </Text>
          </View>
        ) : (
          <CareWeekView
            week={weekContent}
            checkin={checkin}
            healthFlags={healthFlags}
            deliveryType={deliveryType}
            nourishWeek={nourishWeek}
            nourishToday={nourishToday}
            resetActivity={resetActivity}
            resetDoneToday={resetDoneToday}
            resetTotalCompletions={resetTotalCompletions}
            careForYourselfCategory={careForYourselfCategory}
            careForYourselfNote={careForYourselfNote}
            careForYourselfDoneToday={careForYourselfDoneToday}
            careForYourselfWeekCount={careForYourselfWeekCount}
          />
        )}
      </ScrollView>
    </View>
  );
}

function LockedView({ label }: { label: string | null }) {
  return (
    <View style={styles.lockedCard}>
      <Text style={styles.lockedTitle}>Your care chart is ready to be personalized</Text>
      <Text style={styles.lockedBody}>
        Subscribe on the website to get a weekly plan built around your own
        stage, feeding, and how much time you have today.
        {label ? ` You're currently at ${label}.` : ""}
      </Text>
      <Pressable
        style={styles.button}
        onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/account")}
      >
        <Text style={styles.buttonText}>Subscribe on momvillage.in</Text>
      </Pressable>
    </View>
  );
}

function LandingView({
  weekLabel,
  phaseLabel,
  hasCheckedInToday,
  onBuild,
}: {
  weekLabel: string | null;
  phaseLabel: string | null;
  hasCheckedInToday: boolean;
  onBuild: () => void;
}) {
  return (
    <>
      <Text style={styles.title}>Your care chart</Text>
      {weekLabel && (
        <Text style={styles.weekLabel}>
          {weekLabel} — {phaseLabel}
        </Text>
      )}
      <Text style={styles.body}>
        Tell us your time, energy, and mood, and we'll build today's plan.
      </Text>

      <Pressable style={styles.button} onPress={onBuild}>
        <Text style={styles.buttonText}>
          {hasCheckedInToday ? "View today's care chart" : "Build my care chart"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.mentalHealthCard}
        onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/care/mental-health")}
      >
        <Ionicons name="heart-circle" size={22} color={Colors.terracotta} />
        <Text style={styles.mentalHealthText}>Mental health & support</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.ink + "60"} />
      </Pressable>

      {/* Rediscover pointer card removed, 2026-09-21 — Roop's explicit call
          to pull Rediscover out of Care entirely, including this landing
          screen, and give it its own 6th tab in the bottom nav instead (see
          app/(tabs)/rediscover.tsx and CLAUDE.md's "Rediscover placement"
          entry). Do not reintroduce a Rediscover pointer here. */}

      <Pressable onPress={() => Linking.openURL("https://www.momvillage.in/safety")}>
        <Text style={styles.safetyLink}>
          Feeling something that worries you? See warning signs & emergency support →
        </Text>
      </Pressable>

      <Text style={styles.sectionKicker}>Your four pillars</Text>
      {PILLARS.map((p) => (
        <View key={p.key} style={styles.pillarRow}>
          <View style={iconBadge(Colors.indigo, 32)}>
            <Ionicons name={p.icon} size={15} color={Colors.indigo} />
          </View>
          <Text style={styles.pillarLabel}>{p.label}</Text>
        </View>
      ))}
    </>
  );
}

function CheckinView({
  timeChoice,
  energyChoice,
  moodChoice,
  setTimeChoice,
  setEnergyChoice,
  setMoodChoice,
  saving,
  onSubmit,
}: {
  timeChoice: string | null;
  energyChoice: number | null;
  moodChoice: number | null;
  setTimeChoice: (v: string) => void;
  setEnergyChoice: (v: number) => void;
  setMoodChoice: (v: number) => void;
  saving: boolean;
  onSubmit: () => void;
}) {
  const canSubmit = timeChoice && energyChoice && moodChoice;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>How are you today?</Text>
      <Text style={styles.body}>A quick check-in to care for you.</Text>

      <Text style={styles.cardTitle}>How much time do you have?</Text>
      <View style={styles.choiceRow}>
        {TIME_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.chip, timeChoice === opt.value && styles.chipSelected]}
            onPress={() => setTimeChoice(opt.value)}
          >
            <Text style={[styles.chipNumber, timeChoice === opt.value && styles.chipTextSelected]}>
              {opt.label}
            </Text>
            <Text style={[styles.chipUnit, timeChoice === opt.value && styles.chipTextSelected]}>
              {opt.unit}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.cardTitle, { marginTop: 18 }]}>How is your energy?</Text>
      <View style={styles.optionList}>
        {ENERGY_OPTIONS.map((opt) => {
          const selected = energyChoice === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.optionRow, selected && styles.optionRowSelected]}
              onPress={() => setEnergyChoice(opt.value)}
            >
              <Ionicons name={opt.icon} size={18} color={selected ? Colors.goldDeep : Colors.ink + "70"} />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt.label}
              </Text>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.cardTitle, { marginTop: 18 }]}>How are you feeling?</Text>
      <View style={styles.optionList}>
        {MOOD_OPTIONS.map((opt) => {
          const selected = moodChoice === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.optionRow, selected && styles.optionRowSelected]}
              onPress={() => setMoodChoice(opt.value)}
            >
              <Ionicons name={opt.icon} size={18} color={selected ? Colors.goldDeep : Colors.ink + "70"} />
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {opt.label}
              </Text>
              <View style={[styles.radio, selected && styles.radioSelected]} />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.button, { marginTop: 20, opacity: canSubmit ? 1 : 0.5 }]}
        onPress={onSubmit}
        disabled={!canSubmit || saving}
      >
        {saving ? (
          <ActivityIndicator color={Colors.ivory} />
        ) : (
          <Text style={styles.buttonText}>Show me today's care chart</Text>
        )}
      </Pressable>
    </View>
  );
}

// Pregnancy NORMALISE moment — ported 2026-09-21 from the web build (see
// CareWeekContent.tsx / CLAUDE.md). Same unconditional week_number 28-39
// gate, same verbatim card text, same share-message mechanism — just using
// expo-clipboard instead of navigator.clipboard.
function PregnancyMentalHealthNormalise() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareMessage =
    "Something worth knowing, before the baby comes: after birth, some " +
    "mothers go through real emotional changes — persistent low mood, " +
    "anxiety, numbness, or feeling unlike themselves. It's common, and it " +
    "says nothing about how much she loves the baby. If you notice this " +
    "in her, or she tells you something feels off, the best thing you can " +
    "do is take it seriously and gently help her reach support. She " +
    "doesn't have to figure out what it is before either of you act on it.";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.normaliseCard}>
      <Text style={styles.normaliseEyebrow}>A note for after birth</Text>
      <Text style={styles.body}>
        Emotional changes after having a baby are common. But persistent
        sadness, anxiety, fear, numbness or feeling unlike yourself deserve
        attention too. You don&apos;t have to decide what it is. You just
        have to tell someone.
      </Text>
      <Pressable onPress={() => setOpen(!open)} style={{ marginTop: 10 }}>
        <Text style={styles.normaliseToggle}>
          {open ? "Hide the message" : "Share this with someone close to you →"}
        </Text>
      </Pressable>
      {open && (
        <View style={styles.normaliseShareBox}>
          <Text style={styles.smallNote}>{shareMessage}</Text>
          <Pressable style={styles.button} onPress={handleCopy}>
            <Text style={styles.buttonText}>{copied ? "Copied!" : "Copy this text"}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function CareWeekView({
  week,
  checkin,
  healthFlags,
  deliveryType,
  nourishWeek,
  nourishToday,
  resetActivity,
  resetDoneToday,
  resetTotalCompletions,
  careForYourselfCategory,
  careForYourselfNote,
  careForYourselfDoneToday,
  careForYourselfWeekCount,
}: {
  week: WeekRow;
  checkin: { time_available: string; mood_score: number };
  healthFlags: string[];
  deliveryType: string | null;
  nourishWeek: NourishWeekRow | null;
  nourishToday: NourishDay | null;
  resetActivity: ResetActivityRow | null;
  resetDoneToday: boolean;
  resetTotalCompletions: number;
  careForYourselfCategory: CareCategory | null;
  careForYourselfNote: CareForYourselfNoteRow | null;
  careForYourselfDoneToday: boolean;
  careForYourselfWeekCount: number;
}) {
  const relevantConditionNotes = (week.condition_notes || []).filter(
    (n) => n.flag === "none" || healthFlags.includes(n.flag)
  );

  return (
    <>
      <Text style={styles.title}>Today's care chart</Text>
      <Text style={styles.body}>Small steps. Big difference.</Text>
      {week.mantra && <Text style={styles.mantra}>"{week.mantra}"</Text>}
      <Text style={styles.weekTheme}>{week.theme_title}</Text>

      {week.week_number >= 28 && week.week_number <= 39 && <PregnancyMentalHealthNormalise />}

      <MoveCard move={week.move} deliveryType={deliveryType} />

      {nourishWeek && nourishToday ? (
        <NourishMealCard nourishWeek={nourishWeek} today={nourishToday} legacyNourish={week.nourish} />
      ) : (
        (hasContent(week.nourish) || hasContent(week.hydration_goal)) && (
          <ExpandableCard
            icon="nutrition-outline"
            title="Nourish"
            summary={hasContent(week.nourish) ? week.nourish : week.hydration_goal}
          >
            {hasContent(week.hydration_goal) && hasContent(week.nourish) && (
              <Text style={styles.smallNote}>Hydration: {week.hydration_goal}</Text>
            )}
          </ExpandableCard>
        )
      )}

      {resetActivity && (
        <ResetOfTheDay
          activity={resetActivity}
          alreadyDoneToday={resetDoneToday}
          totalCompletions={resetTotalCompletions}
        />
      )}

      {careForYourselfCategory && careForYourselfNote && (
        <CareForYourself
          category={careForYourselfCategory}
          note={careForYourselfNote}
          alreadyDoneToday={careForYourselfDoneToday}
          weekCompletionCount={careForYourselfWeekCount}
        />
      )}

      {/* "Rediscover" card retired, 2026-09-19 — replaced entirely by the
          standalone Rediscover module (see the pointer card on the landing
          screen above). Do not reintroduce this card. */}

      {(hasContent(week.feeding_comfort) || hasContent(week.rest_support)) && (
        <View style={styles.dayCard}>
          {hasContent(week.feeding_comfort) && (
            <>
              <Text style={styles.dayCardTitle}>Feeding comfort</Text>
              <Text style={styles.body}>{week.feeding_comfort}</Text>
            </>
          )}
          {hasContent(week.rest_support) && (
            <>
              <Text style={[styles.dayCardTitle, { marginTop: hasContent(week.feeding_comfort) ? 12 : 0 }]}>
                Rest support
              </Text>
              <Text style={styles.body}>{week.rest_support}</Text>
            </>
          )}
        </View>
      )}

      {relevantConditionNotes.filter((n) => hasContent(n.note)).length > 0 && (
        <View style={styles.dayCard}>
          <Text style={styles.dayCardTitle}>If this applies to you</Text>
          {relevantConditionNotes.filter((n) => hasContent(n.note)).map((n, i) => (
            <Text key={i} style={styles.body}>
              {n.note}
            </Text>
          ))}
        </View>
      )}

      {hasContent(week.mental_health_note) && (
        <View style={styles.dayCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="heart-circle" size={18} color={Colors.terracotta} />
            <Text style={styles.dayCardTitle}>Mental health & support</Text>
          </View>
          <Text style={styles.body}>{week.mental_health_note}</Text>
        </View>
      )}

      {hasContent(week.celebrate_this_week) && (
        <View style={styles.dayCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="trophy-outline" size={18} color={Colors.goldDeep} />
            <Text style={styles.dayCardTitle}>Celebrate this week</Text>
          </View>
          <Text style={styles.body}>{week.celebrate_this_week}</Text>
        </View>
      )}

      {hasContent(week.for_your_care_team) && (
        <View style={styles.dayCard}>
          <View style={styles.careTeamHeaderRow}>
            <Text style={styles.dayCardTitle}>For your care team</Text>
            {hasContent(week.for_your_care_team_who) && (
              <Text style={styles.careTeamWhoTag}>{week.for_your_care_team_who}</Text>
            )}
          </View>
          {hasContent(week.for_your_care_team_lede) && hasContent(week.for_your_care_team_detail) ? (
            <Text style={styles.body}>
              <Text style={styles.careTeamLede}>{week.for_your_care_team_lede}: </Text>
              {week.for_your_care_team_detail}
            </Text>
          ) : (
            <Text style={styles.body}>{week.for_your_care_team}</Text>
          )}
        </View>
      )}

      <Pressable onPress={() => Linking.openURL("https://www.momvillage.in/safety")}>
        <Text style={styles.safetyLink}>
          Feeling something that worries you? See warning signs & emergency numbers →
        </Text>
      </Pressable>
    </>
  );
}

function ExpandableCard({
  icon,
  title,
  timeLabel,
  summary,
  whyThis,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  timeLabel?: string;
  summary: string;
  whyThis?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.expandCard} onPress={() => setOpen((o) => !o)}>
      <View style={styles.expandHeaderRow}>
        <View style={iconBadge(Colors.indigo, 40)}>
          <Ionicons name={icon} size={19} color={Colors.indigo} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.expandTitleRow}>
            <Text style={styles.dayCardTitle}>{title}</Text>
            {timeLabel && (
              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeText}>{timeLabel}</Text>
              </View>
            )}
          </View>
          <Text style={styles.body}>{summary}</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-forward"}
          size={16}
          color={Colors.ink + "60"}
        />
      </View>
      {open && (
        <View style={styles.expandBody}>
          {whyThis && <Text style={styles.whyThisText}>Why this fits today: {whyThis}</Text>}
          {children}
        </View>
      )}
    </Pressable>
  );
}

// A single meal slot ("Breakfast — choose one: A / B") from the Nourish
// weekly meal-plan series. Both options shown at once — a real day's
// actual choices, not something to gate behind another tap.
function NourishMealSlot({ label, a, b }: { label: string; a: string | null; b: string | null }) {
  if (!a && !b) return null;
  return (
    <View style={styles.moveSubCard}>
      <Text style={styles.moveSubLabel}>{label}</Text>
      {a && <Text style={styles.body}>A. {a}</Text>}
      {b && <Text style={[styles.body, { marginTop: 4 }]}>B. {b}</Text>}
    </View>
  );
}

// The Nourish weekly meal-plan card (nourish_week_content, migration_54) —
// connects the standalone Nourish docx-per-week nutrition series into the
// native Care Chart for the first time, 2026-09-14. Shows only *today's*
// day from that week's full 7-day chart, per Roop's explicit choice. The
// week's own short Care Chart `nourish` sentence (a separate, much thinner
// field) still shows underneath as a small supplementary note when present.
function NourishMealCard({
  nourishWeek,
  today,
  legacyNourish,
}: {
  nourishWeek: NourishWeekRow;
  today: NourishDay;
  legacyNourish: string;
}) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const stageLabel = nourishWeek.stage === "pregnancy" ? "pregnancy" : "postpartum";
  const hasMore =
    hasContent(nourishWeek.why_it_matters) ||
    hasContent(nourishWeek.meat_fish_eggs_note) ||
    hasContent(nourishWeek.condition_notes) ||
    hasContent(nourishWeek.using_meals_note);

  return (
    <Pressable style={styles.expandCard} onPress={() => setOpen((o) => !o)}>
      <View style={styles.expandHeaderRow}>
        <View style={iconBadge(Colors.indigo, 40)}>
          <Ionicons name="nutrition-outline" size={19} color={Colors.indigo} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayCardTitle}>Nourish</Text>
          <Text style={styles.body}>
            Day {today.day_number}
            {today.title ? ` — ${today.title}` : ""}: {nourishWeek.theme_title}
          </Text>
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-forward"} size={16} color={Colors.ink + "60"} />
      </View>
      {open && (
        <View style={styles.expandBody}>
          <Text style={styles.smallNote}>
            Week {nourishWeek.week_number} {stageLabel} nourishment
          </Text>
          {nourishWeek.mantra && <Text style={styles.moveCardMantra}>&ldquo;{nourishWeek.mantra}&rdquo;</Text>}
          {today.notes && <Text style={[styles.body, { marginTop: 6 }]}>{today.notes}</Text>}

          <NourishMealSlot label="Breakfast" a={today.breakfast_a} b={today.breakfast_b} />
          <NourishMealSlot label="Lunch" a={today.lunch_a} b={today.lunch_b} />
          <NourishMealSlot label="Nourishment break" a={today.nourishment_break_a} b={today.nourishment_break_b} />
          <NourishMealSlot label="Dinner" a={today.dinner_a} b={today.dinner_b} />

          {today.still_hungry && (
            <Text style={styles.smallNote}>Still hungry? {today.still_hungry}</Text>
          )}

          {hasContent(legacyNourish) && <Text style={styles.smallNote}>{legacyNourish}</Text>}

          {hasMore && (
            <Pressable onPress={() => setMoreOpen((o) => !o)} hitSlop={8}>
              <Text style={styles.moveLinkText}>
                {moreOpen ? "Hide more about this week's nourishment" : "More about this week's nourishment"}
              </Text>
            </Pressable>
          )}
          {moreOpen && (
            <View style={{ marginTop: 8, gap: 8 }}>
              {hasContent(nourishWeek.why_it_matters) && <Text style={styles.smallNote}>{nourishWeek.why_it_matters}</Text>}
              {hasContent(nourishWeek.meat_fish_eggs_note) && <Text style={styles.smallNote}>{nourishWeek.meat_fish_eggs_note}</Text>}
              {hasContent(nourishWeek.condition_notes) && (
                <Text style={[styles.smallNote, { color: Colors.terracotta }]}>{nourishWeek.condition_notes}</Text>
              )}
              {hasContent(nourishWeek.using_meals_note) && <Text style={styles.smallNote}>{nourishWeek.using_meals_note}</Text>}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

// Move card — rebuilt 2026-08-03 alongside the website's equivalent
// (src/components/CareWeekContent.tsx's MoveSection) for the new Move
// series content. Read-only, matching this screen's existing standing gap
// (no per-card "done" toggle for Care yet, unlike the Monthly Chart) —
// not something this pass adds. Deliberately never renders
// move.clinicalFlag anywhere: that's an internal editorial flag kept only
// for a future professional (pelvic-health physiotherapist/OB-GYN) review
// pass, never shown to a mother.
function MoveCard({ move, deliveryType }: { move: MoveContent; deliveryType: string | null }) {
  const [open, setOpen] = useState(false);
  const [showOtherRoutes, setShowOtherRoutes] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const routeKeys = move.recoveryRoute ? Object.keys(move.recoveryRoute) : [];
  const primaryRouteKey = move.recoveryRoute ? primaryRouteKeyFor(deliveryType, routeKeys) : null;
  const otherRouteKeys = routeKeys.filter((k) => k !== primaryRouteKey);

  // "Why this helps" — merged 2026-08-03 redesign, matching the website's
  // equivalent change: inRealLife/why/note/progressionNote used to each get
  // their own bold mini-label as separate stacked paragraphs, reading as
  // several competing headed sections for what's really one train of
  // thought. Combined into one lightweight block under a single heading.
  const whyBlockParts = [
    hasContent(move.inRealLife) ? move.inRealLife : null,
    move.why,
    hasContent(move.note) ? move.note : null,
    hasContent(move.progressionNote) ? move.progressionNote : null,
  ].filter((p): p is string => Boolean(p));

  return (
    <Pressable style={styles.expandCard} onPress={() => setOpen((o) => !o)}>
      <View style={styles.expandHeaderRow}>
        <View style={iconBadge(Colors.indigo, 40)}>
          <Ionicons name="body-outline" size={19} color={Colors.indigo} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dayCardTitle}>Move</Text>
          {hasContent(move.theme) && <Text style={styles.body}>{move.theme}</Text>}
          {hasContent(move.mantra) && <Text style={styles.moveCardMantra}>&ldquo;{move.mantra}&rdquo;</Text>}
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-forward"} size={16} color={Colors.ink + "60"} />
      </View>

      {open && (
        <View style={styles.expandBody}>
          {move.format === "tiers3" && move.tiers ? (
            <>
              <MoveTierBlock label="Restore · 5 min" items={move.tiers.restore} />
              <MoveTierBlock label="Rebuild · 15 min" items={move.tiers.rebuild} />
              <MoveTierBlock label="Thrive · 30 min" items={move.tiers.thrive} />
            </>
          ) : (
            <>
              {hasContent(move.reset) && <MoveTextBlock label="Reset" text={move.reset as string} />}
              {hasContent(move.today) && <MoveTextBlock label="Move" text={move.today as string} />}

              {move.recoveryRoute && (
                <View style={styles.moveSubCard}>
                  <Text style={styles.moveSubLabel}>Your recovery route</Text>
                  {primaryRouteKey ? (
                    <>
                      <Text style={styles.moveRouteName}>{titleCaseRoute(primaryRouteKey)}</Text>
                      <Text style={styles.body}>{move.recoveryRoute[primaryRouteKey]}</Text>
                    </>
                  ) : (
                    <Text style={[styles.body, { fontStyle: "italic" }]}>
                      Choose whichever route below is closest to your birth.
                    </Text>
                  )}
                  {otherRouteKeys.length > 0 && (
                    <Pressable onPress={() => setShowOtherRoutes((v) => !v)} hitSlop={6}>
                      <Text style={styles.moveLinkText}>
                        {showOtherRoutes ? "Hide other routes" : "A different birth? See other routes"}
                      </Text>
                    </Pressable>
                  )}
                  {showOtherRoutes &&
                    otherRouteKeys.map((k) => (
                      <View key={k} style={{ marginTop: 6 }}>
                        <Text style={styles.moveRouteName}>{titleCaseRoute(k)}</Text>
                        <Text style={styles.body}>{move.recoveryRoute![k]}</Text>
                      </View>
                    ))}
                </View>
              )}

              {move.door && (
                <View style={styles.moveSubCard}>
                  <Text style={styles.moveSubLabel}>Choose your door — {move.door.pattern}</Text>
                  <Text style={styles.body}>
                    <Text style={styles.moveDoorTag}>Comfort: </Text>
                    {move.door.comfort}
                  </Text>
                  <Text style={styles.body}>
                    <Text style={styles.moveDoorTag}>Steady: </Text>
                    {move.door.steady}
                  </Text>
                  <Text style={styles.body}>
                    <Text style={styles.moveDoorTag}>Challenge: </Text>
                    {move.door.challenge}
                  </Text>
                </View>
              )}

              {move.build && move.build.length > 0 && (
                <View style={styles.moveSubCard}>
                  <Text style={styles.moveSubLabel}>Build</Text>
                  {move.build.map((line, i) => (
                    <Text key={i} style={styles.moveBullet}>
                      • {line}
                    </Text>
                  ))}
                </View>
              )}

              {hasContent(move.release) && <MoveTextBlock label="Release" text={move.release as string} />}
            </>
          )}

          <View style={styles.moveCardWhite}>
            <Text style={styles.moveSubLabel}>⭐ {move.exercise.name}</Text>
            {hasContent(move.exercise.focus) && (
              <Text style={styles.smallNote}>
                {move.exercise.focus}
                {hasContent(move.exercise.benefit) ? ` — ${move.exercise.benefit}` : ""}
              </Text>
            )}
            {hasContent(move.exercise.mistake) && (
              <Text style={styles.smallNote}>Common mistake: {move.exercise.mistake}</Text>
            )}
            {hasContent(move.exercise.tip) && <Text style={styles.smallNote}>Tip: {move.exercise.tip}</Text>}
          </View>

          {hasContent(move.quote) && (
            <View style={styles.moveQuoteBox}>
              <Text style={styles.moveQuoteText}>{move.quote}</Text>
            </View>
          )}

          {whyBlockParts.length > 0 && (
            <View>
              <Text style={styles.moveWhyLabel}>💛 Why this helps</Text>
              {whyBlockParts.map((part, i) => (
                <Text key={i} style={[styles.body, styles.moveWhyText]}>
                  {part}
                </Text>
              ))}
            </View>
          )}

          {/* Safety — collapsed by default, 2026-08-03: a persistent
              terracotta line on every single week reads as a repeated
              warning to a mother who's already seen the same guidance many
              times. Same information, now tucked behind a small tap. */}
          {hasContent(move.safety) && (
            <Pressable onPress={() => setSafetyOpen((v) => !v)} hitSlop={6}>
              <View style={styles.safetyRow}>
                <Ionicons
                  name={safetyOpen ? "chevron-down" : "chevron-forward"}
                  size={12}
                  color={Colors.ink + "70"}
                />
                <Text style={styles.safetyLabel}>🩺 Safety reminder</Text>
              </View>
              {safetyOpen && <Text style={styles.smallNote}>{move.safety}</Text>}
            </Pressable>
          )}

          {move.recovery && move.recovery.length > 0 && (
            <View>
              <Text style={styles.moveWhyLabel}>Just notice, don&apos;t diagnose</Text>
              <View style={styles.moveChipRow}>
                {move.recovery.map((line, i) => (
                  <View key={i} style={styles.moveChip}>
                    <Text style={styles.moveChipText}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {hasContent(move.reflectionPrompt) && (
            <View style={styles.movePauseBox}>
              <Text style={styles.moveQuoteText}>{move.reflectionPrompt}</Text>
            </View>
          )}

          {hasContent(move.closingText) && (
            <View>
              <Text style={styles.moveWhyLabel}>🌿 {move.closingLabel}</Text>
              <Text style={[styles.body, styles.moveWhyText]}>{move.closingText}</Text>
            </View>
          )}
          {hasContent(move.lookingAhead) && (
            <Text style={styles.smallNote}>Looking ahead: {move.lookingAhead}</Text>
          )}

          {(hasContent(move.milestone) || hasContent(move.breathLegacy) || hasContent(move.philosophy)) && (
            <View style={{ marginTop: 10, alignItems: "center" }}>
              {hasContent(move.milestone) && <Text style={styles.moveCallout}>{move.milestone}</Text>}
              {hasContent(move.breathLegacy) && <Text style={styles.moveCallout}>{move.breathLegacy}</Text>}
              {hasContent(move.philosophy) && <Text style={styles.moveCallout}>{move.philosophy}</Text>}
            </View>
          )}

          {move.whatYouGaveYourself && move.whatYouGaveYourself.length > 0 && (
            <View style={styles.moveSubCard}>
              <Text style={styles.moveSubLabel}>What you gave yourself</Text>
              {move.whatYouGaveYourself.map((line, i) => (
                <Text key={i} style={styles.moveBullet}>
                  • {line}
                </Text>
              ))}
            </View>
          )}
          {move.childLearned && move.childLearned.length > 0 && (
            <View style={styles.moveSubCard}>
              <Text style={styles.moveSubLabel}>What your child learned watching you</Text>
              {move.childLearned.map((line, i) => (
                <Text key={i} style={styles.moveBullet}>
                  • {line}
                </Text>
              ))}
            </View>
          )}
          {(hasContent(move.finalNote) || (move.signatureLine && move.signatureLine.length > 0)) && (
            <View style={{ marginTop: 12, alignItems: "center" }}>
              {hasContent(move.finalNote) && <Text style={styles.body}>{move.finalNote}</Text>}
              {move.signatureLine?.map((line, i) => (
                <Text
                  key={i}
                  style={[styles.moveCallout, i === 0 ? { color: Colors.indigo } : { color: Colors.goldDeep }]}
                >
                  {line}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

function MoveTextBlock({ label, text }: { label: string; text: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.moveSubLabel}>{label}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function MoveTierBlock({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.moveCardWhite}>
      <Text style={styles.moveSubLabel}>{label}</Text>
      {items.map((line, i) => (
        <Text key={i} style={styles.moveBullet}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

const cardShadow = {
  borderWidth: 1,
  borderColor: Colors.line,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  content: { padding: 20, paddingBottom: 60 },
  drillHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: Colors.ivory,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  wordmark: { fontSize: 16, fontFamily: Fonts.displayBold, color: Colors.indigo },
  title: { fontSize: 24, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 4 },
  weekLabel: { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.goldDeep, marginBottom: 12 },
  mantra: { fontSize: 16, fontFamily: Fonts.displayItalic, color: Colors.sageDeep, marginBottom: 8, marginTop: 8 },
  weekTheme: { fontSize: 18, fontFamily: Fonts.display, color: Colors.indigo, marginBottom: 14 },
  lockedCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, ...cardShadow },
  lockedTitle: { fontSize: 17, fontFamily: Fonts.bodyBold, color: Colors.indigo, marginBottom: 8 },
  lockedBody: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 20, marginBottom: 16 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 8, marginBottom: 14 },
  buttonText: { color: Colors.ivory, fontFamily: Fonts.bodyBold, fontSize: 14 },
  body: { fontSize: 14, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 20, marginBottom: 6 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 18, marginBottom: 14, ...cardShadow },
  cardTitle: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.indigo, marginBottom: 4 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  // Card-consistency pass, 2026-09-21 — every module on today's chart
  // (Move/Nourish/Feeding comfort/If this applies to you/Mental health &
  // support/Celebrate this week/For your care team) now shares this one
  // tinted/top-border shape and this one bold heading style, matching
  // Reset's own card. Deliberately separate from `card`/`cardTitle` above,
  // which the check-in screen still uses and wasn't part of this feedback.
  dayCard: moduleCard(Colors.indigo),
  dayCardTitle: { ...moduleTitle, marginBottom: 4 },
  careTeamHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  careTeamWhoTag: { ...moduleEyebrow, marginBottom: 0 },
  careTeamLede: { fontFamily: Fonts.bodyBold, color: Colors.ink },
  // Pregnancy NORMALISE moment, 2026-09-21 — see PregnancyMentalHealthNormalise
  // above. Terracotta accent, matching every other mental-health-adjacent
  // surface (mentalHealthCard, safetyLink) rather than the indigo used for
  // ordinary daily-chart cards.
  normaliseCard: { ...moduleCard(Colors.terracotta) },
  normaliseEyebrow: { ...moduleEyebrow, color: Colors.terracotta, marginBottom: 6 },
  normaliseToggle: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.terracotta },
  normaliseShareBox: { marginTop: 10, backgroundColor: Colors.ivory, borderRadius: 12, borderWidth: 1, borderColor: Colors.line, padding: 12 },
  mentalHealthCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, marginBottom: 10, ...cardShadow },
  mentalHealthText: { flex: 1, fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  safetyLink: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.terracotta, marginBottom: 20, textDecorationLine: "underline" },
  sectionKicker: { fontSize: 11, fontFamily: Fonts.bodyBold, textTransform: "uppercase", letterSpacing: 1, color: Colors.sageDeep, marginBottom: 10, marginTop: 4 },
  pillarRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.line },
  pillarLabel: { fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.indigo },
  choiceRow: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: "#FFFFFF",
  },
  chipSelected: { backgroundColor: Colors.indigo, borderColor: Colors.indigo },
  chipNumber: { fontSize: 20, fontFamily: Fonts.bodyBold, color: Colors.indigo },
  chipUnit: { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.indigo + "99", marginTop: 1 },
  chipTextSelected: { color: Colors.ivory },
  optionList: { gap: 8 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.line,
    backgroundColor: "#FFFFFF",
  },
  optionRowSelected: { borderColor: Colors.goldDeep, backgroundColor: Colors.gold + "16" },
  optionText: { flex: 1, fontSize: 14, fontFamily: Fonts.bodySemiBold, color: Colors.ink },
  optionTextSelected: { color: Colors.indigo },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: Colors.line },
  radioSelected: { borderColor: Colors.goldDeep, backgroundColor: Colors.goldDeep },
  smallNote: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "8c", marginTop: 4 },
  expandCard: moduleCard(Colors.indigo),
  expandHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  expandTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  timeBadge: { backgroundColor: Colors.indigo, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  timeBadgeText: { color: Colors.ivory, fontSize: 10, fontFamily: Fonts.bodyBold },
  expandBody: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.line, gap: 14 },
  whyThisText: { fontSize: 12, fontFamily: Fonts.displayItalic, color: Colors.sageDeep, marginBottom: 6 },
  moveCardMantra: { fontSize: 12, fontFamily: Fonts.displayItalic, color: Colors.sageDeep, marginTop: 2 },
  moveSubCard: {
    backgroundColor: Colors.ivory2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  moveSubLabel: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.indigo, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  moveRouteName: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.sageDeep, marginBottom: 2 },
  moveLinkText: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.goldDeep, marginTop: 4, textDecorationLine: "underline" },
  moveDoorTag: { fontFamily: Fonts.bodyBold, color: Colors.indigo },
  moveBullet: { fontSize: 13, fontFamily: Fonts.body, color: Colors.ink, lineHeight: 19, marginBottom: 3 },
  moveQuoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    paddingLeft: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  moveQuoteText: { fontSize: 14, fontFamily: Fonts.displayItalic, color: Colors.indigo, lineHeight: 20 },
  movePauseBox: {
    backgroundColor: Colors.ivory2,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
  },
  moveCallout: {
    fontSize: 15,
    fontFamily: Fonts.displayItalic,
    color: Colors.sageDeep,
    textAlign: "center",
    marginBottom: 4,
  },
  // 2026-08-03 redesign: a real elevation card for the movement/exercise
  // itself (Level 1 — "the beautiful card"), distinct from the muted ivory
  // moveSubCard used for a genuine choice (recovery route / door) or a
  // real list (Build). Native app convention is flat cards (thin border,
  // no drop shadow — see constants/theme.ts's CardStyle comment), so the
  // "stand out" effect here comes from white-vs-cream contrast, not shadow.
  moveCardWhite: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
  },
  moveWhyLabel: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.sageDeep, marginBottom: 2 },
  moveWhyText: { fontStyle: "italic", marginBottom: 4 },
  safetyRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  safetyLabel: { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.ink + "70" },
  moveChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  moveChip: {
    backgroundColor: Colors.sageDeep + "14",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moveChipText: { fontSize: 12, fontFamily: Fonts.body, color: Colors.ink + "b3" },
});
