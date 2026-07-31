// Care tab — rebuilt 2026-07-31 per the layout brief's three-stage flow:
// landing screen -> three-question check-in -> five-card daily chart.
// Queries care_chart_week_content (all 197 weeks live, pregnancy 1-39 +
// postpartum 0-156) the same way the website's care/chart page does.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { hasActiveSubscription } from "../../lib/subscription";
import { calculateCareWeek, careWeekLabel, carePhaseLabel, journeyWeekNumber } from "../../lib/weekCalculator";
import { Colors } from "../../constants/theme";
import ScreenHeader from "../../components/ScreenHeader";

type MoveContent = {
  focus: string;
  tiers: { heavy: string; steady: string; feeling_good: string };
  mood_adjustment: string;
  safety: string;
};
type ResetContent = {
  heavy_day: string;
  a_little_low: string;
  okay: string;
  good: string;
  really_good: string;
};
type ConditionNote = { flag: string; note: string };
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
  care_for_yourself: string;
  your_corner: string;
  support_moment: string;
  celebrate_this_week: string;
  mental_health_note: string | null;
  for_your_care_team: string;
  condition_notes: ConditionNote[] | null;
};

const MOVE_TIER_BY_TIME: Record<string, keyof MoveContent["tiers"]> = {
  "5": "heavy",
  "15": "steady",
  "30": "feeling_good",
};
const RESET_KEY_BY_MOOD: Record<number, keyof ResetContent> = {
  1: "heavy_day",
  2: "a_little_low",
  3: "okay",
  4: "good",
  5: "really_good",
};

const TIME_OPTIONS = [
  { value: "5", label: "5 min" },
  { value: "15", label: "15 min" },
  { value: "30", label: "30 min" },
];
const ENERGY_OPTIONS = [
  { value: 1, label: "Running on empty" },
  { value: 2, label: "Low, but here" },
  { value: 3, label: "Steady" },
  { value: 4, label: "Good energy" },
  { value: 5, label: "Feeling strong" },
];
const MOOD_OPTIONS = [
  { value: 1, label: "Heavy day" },
  { value: 2, label: "A little low" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Really good" },
];
const PILLARS = [
  { key: "move", label: "Move" },
  { key: "nourish", label: "Nourish" },
  { key: "reset", label: "Reset" },
  { key: "care_for_yourself", label: "Care for yourself" },
  { key: "rediscover", label: "Rediscover" },
];

type Stage = "landing" | "checkin" | "chart";

export default function CareScreen() {
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("landing");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [week, setWeek] = useState<number | null>(null);
  const [healthFlags, setHealthFlags] = useState<string[]>([]);
  const [checkin, setCheckin] = useState<{ time_available: string; mood_score: number } | null>(null);
  const [weekContent, setWeekContent] = useState<WeekRow | null>(null);

  const [timeChoice, setTimeChoice] = useState<string | null>(null);
  const [energyChoice, setEnergyChoice] = useState<number | null>(null);
  const [moodChoice, setMoodChoice] = useState<number | null>(null);
  const [savingCheckin, setSavingCheckin] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("baby_dob, due_date")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || (!profile.baby_dob && !profile.due_date)) {
      return;
    }

    const subscribed = await hasActiveSubscription(supabase, user.id);
    setIsSubscribed(subscribed);

    const w = calculateCareWeek(profile.baby_dob ?? null, profile.due_date ?? null);
    setWeek(w);

    if (!subscribed || w === null) {
      setLoading(false);
      return;
    }

    const { data: careProfile } = await supabase
      .from("user_care_profile")
      .select("health_flags")
      .eq("user_id", user.id)
      .maybeSingle();
    setHealthFlags(careProfile?.health_flags || []);

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
          "week_number, theme_title, mantra, priority, journey, what_you_may_notice, move, nourish, hydration_goal, feeding_comfort, rest_support, reset, care_for_yourself, your_corner, support_moment, celebrate_this_week, mental_health_note, for_your_care_team, condition_notes"
        )
        .eq("week_number", journeyWeek)
        .maybeSingle();
      setWeekContent(weekRow as WeekRow | null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <View style={styles.drillHeader}>
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
          <CareWeekView week={weekContent} checkin={checkin} healthFlags={healthFlags} />
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

      <Pressable onPress={() => Linking.openURL("https://www.momvillage.in/safety")}>
        <Text style={styles.safetyLink}>
          Feeling something that worries you? See warning signs & emergency support →
        </Text>
      </Pressable>

      <Text style={styles.sectionKicker}>Your five pillars</Text>
      {PILLARS.map((p) => (
        <View key={p.key} style={styles.pillarRow}>
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
            <Text style={[styles.chipText, timeChoice === opt.value && styles.chipTextSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.cardTitle, { marginTop: 16 }]}>How is your energy?</Text>
      <View style={styles.optionList}>
        {ENERGY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.optionRow, energyChoice === opt.value && styles.optionRowSelected]}
            onPress={() => setEnergyChoice(opt.value)}
          >
            <Text
              style={[styles.optionText, energyChoice === opt.value && styles.optionTextSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.cardTitle, { marginTop: 16 }]}>How are you feeling?</Text>
      <View style={styles.optionList}>
        {MOOD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.optionRow, moodChoice === opt.value && styles.optionRowSelected]}
            onPress={() => setMoodChoice(opt.value)}
          >
            <Text
              style={[styles.optionText, moodChoice === opt.value && styles.optionTextSelected]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
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

function CareWeekView({
  week,
  checkin,
  healthFlags,
}: {
  week: WeekRow;
  checkin: { time_available: string; mood_score: number };
  healthFlags: string[];
}) {
  const moveTierKey = MOVE_TIER_BY_TIME[checkin.time_available] ?? "steady";
  const resetKey = RESET_KEY_BY_MOOD[checkin.mood_score] ?? "okay";
  const relevantConditionNotes = (week.condition_notes || []).filter(
    (n) => n.flag === "none" || healthFlags.includes(n.flag)
  );

  return (
    <>
      <Text style={styles.title}>Today's care chart</Text>
      <Text style={styles.body}>Small steps. Big difference.</Text>
      {week.mantra && <Text style={styles.mantra}>"{week.mantra}"</Text>}
      <Text style={styles.weekTheme}>{week.theme_title}</Text>

      <ExpandableCard
        icon="body-outline"
        title="Move"
        timeLabel={
          checkin.time_available === "5" ? "5 min" : checkin.time_available === "15" ? "15 min" : "30 min"
        }
        summary={week.move.tiers[moveTierKey]}
        whyThis={week.move.focus}
      >
        {week.move.safety && <Text style={styles.smallNote}>{week.move.safety}</Text>}
      </ExpandableCard>

      <ExpandableCard icon="nutrition-outline" title="Nourish" summary={week.nourish}>
        {week.hydration_goal && (
          <Text style={styles.smallNote}>Hydration: {week.hydration_goal}</Text>
        )}
      </ExpandableCard>

      <ExpandableCard icon="flower-outline" title="Reset" summary={week.reset[resetKey]} />

      <ExpandableCard icon="hand-left-outline" title="Care for yourself" summary={week.care_for_yourself} />

      <ExpandableCard icon="sparkles-outline" title="Rediscover" summary={week.your_corner} />

      {(week.feeding_comfort || week.rest_support) && (
        <View style={styles.card}>
          {week.feeding_comfort && (
            <>
              <Text style={styles.cardTitle}>Feeding comfort</Text>
              <Text style={styles.body}>{week.feeding_comfort}</Text>
            </>
          )}
          {week.rest_support && (
            <>
              <Text style={[styles.cardTitle, { marginTop: week.feeding_comfort ? 12 : 0 }]}>
                Rest support
              </Text>
              <Text style={styles.body}>{week.rest_support}</Text>
            </>
          )}
        </View>
      )}

      {relevantConditionNotes.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>If this applies to you</Text>
          {relevantConditionNotes.map((n, i) => (
            <Text key={i} style={styles.body}>
              {n.note}
            </Text>
          ))}
        </View>
      )}

      {week.mental_health_note && (
        <View style={[styles.card, { borderTopWidth: 3, borderTopColor: Colors.terracotta }]}>
          <Text style={styles.cardTitle}>Mental health & support</Text>
          <Text style={styles.body}>{week.mental_health_note}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Celebrate this week</Text>
        <Text style={styles.body}>{week.celebrate_this_week}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>For your care team</Text>
        <Text style={styles.body}>{week.for_your_care_team}</Text>
      </View>

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
        <View style={styles.expandIconWrap}>
          <Ionicons name={icon} size={20} color={Colors.goldDeep} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.expandTitleRow}>
            <Text style={styles.cardTitle}>{title}</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  content: { padding: 20, paddingBottom: 60 },
  drillHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  wordmark: { fontSize: 16, fontWeight: "700", color: Colors.indigo },
  title: { fontSize: 24, fontWeight: "700", color: Colors.indigo, marginBottom: 4 },
  weekLabel: { fontSize: 14, fontWeight: "700", color: Colors.goldDeep, marginBottom: 12 },
  mantra: { fontSize: 16, fontStyle: "italic", color: Colors.sageDeep, marginBottom: 8, marginTop: 8 },
  weekTheme: { fontSize: 18, fontWeight: "700", color: Colors.indigo, marginBottom: 14 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 20, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  lockedTitle: { fontSize: 17, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  lockedBody: { fontSize: 14, color: Colors.ink, lineHeight: 20, marginBottom: 16 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center", marginTop: 8, marginBottom: 14 },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  body: { fontSize: 14, color: Colors.ink, lineHeight: 20, marginBottom: 6 },
  card: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 4 },
  mentalHealthCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.terracotta + "18", borderRadius: 16, borderWidth: 1, borderColor: Colors.terracotta + "40", padding: 14, marginBottom: 10 },
  mentalHealthText: { flex: 1, fontSize: 14, fontWeight: "700", color: Colors.indigo },
  safetyLink: { fontSize: 12, color: Colors.terracotta, fontWeight: "600", marginBottom: 20, textDecorationLine: "underline" },
  sectionKicker: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: Colors.sageDeep, marginBottom: 10, marginTop: 4 },
  pillarRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.line },
  pillarLabel: { fontSize: 14, fontWeight: "600", color: Colors.indigo },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.indigo },
  chipSelected: { backgroundColor: Colors.indigo },
  chipText: { fontSize: 14, fontWeight: "700", color: Colors.indigo },
  chipTextSelected: { color: Colors.ivory },
  optionList: { gap: 8 },
  optionRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.line, backgroundColor: Colors.ivory },
  optionRowSelected: { borderColor: Colors.goldDeep, backgroundColor: Colors.gold + "22" },
  optionText: { fontSize: 14, color: Colors.ink, fontWeight: "600" },
  optionTextSelected: { color: Colors.indigo },
  smallNote: { fontSize: 12, color: Colors.ink + "8c", marginTop: 4 },
  expandCard: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 14, marginBottom: 10 },
  expandHeaderRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  expandIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.gold + "33", alignItems: "center", justifyContent: "center" },
  expandTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  timeBadge: { backgroundColor: Colors.indigo, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  timeBadgeText: { color: Colors.ivory, fontSize: 10, fontWeight: "700" },
  expandBody: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.line },
  whyThisText: { fontSize: 12, color: Colors.sageDeep, fontStyle: "italic", marginBottom: 6 },
});
