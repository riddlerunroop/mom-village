// Savings & Financial Planning Guidance — native port of
// src/app/dashboard/wealth/savings/page.tsx, Phase 3 of the 2026-07-31
// agreed build plan. Same locked, independently-verified general-education
// content (do not edit facts without going through that same workflow),
// plus a real interactive Maternity Planner (mirrors MaternityPlanner.tsx,
// same user_maternity_plan table, debounced autosave).

import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { hasActiveSubscription } from "../lib/subscription";
import { Colors } from "../constants/theme";

type Sign = 1 | -1;

const PLANNER_ITEMS: { key: string; label: string; sign: Sign }[] = [
  { key: "antenatal", label: "Antenatal appointments and tests", sign: 1 },
  { key: "delivery", label: "Delivery and hospital costs", sign: 1 },
  { key: "insurance_contribution", label: "Expected insurance or govt. contribution", sign: -1 },
  { key: "postnatal_care", label: "Medicines and postnatal care", sign: 1 },
  { key: "travel_support", label: "Travel and support costs", sign: 1 },
  { key: "baby_purchases", label: "Essential one-time baby purchases", sign: 1 },
  { key: "household_essentials", label: "Monthly household essentials during leave", sign: 1 },
  { key: "loan_insurance_payments", label: "Loan and insurance payments during leave", sign: 1 },
  { key: "paid_leave_income", label: "Income expected during paid leave", sign: -1 },
  { key: "unpaid_leave_income_lost", label: "Income lost during unpaid/reduced-pay leave", sign: 1 },
  { key: "childcare", label: "Childcare after you return to work", sign: 1 },
  { key: "cash_benefits", label: "Government or employer cash benefits", sign: -1 },
];

function formatINR(n: number) {
  return `₹${Math.round(Math.abs(n)).toLocaleString("en-IN")}`;
}

function MaternityPlanner() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("user_maternity_plan")
        .select("values")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.values) setValues(data.values as Record<string, number>);
      setLoaded(true);
    }
    load();
  }, []);

  function updateValue(key: string, raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    const n = digits === "" ? 0 : Math.max(0, Number(digits));
    const next = { ...values, [key]: n };
    setValues(next);
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("user_maternity_plan")
        .upsert(
          { user_id: user.id, values: next, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      setSaveState("saved");
    }, 700);
  }

  const gap = PLANNER_ITEMS.reduce((sum, item) => sum + (values[item.key] || 0) * item.sign, 0);

  if (!loaded) {
    return (
      <View style={styles.plannerCard}>
        <Text style={styles.body}>Loading your plan…</Text>
      </View>
    );
  }

  return (
    <View style={styles.plannerCard}>
      <View style={styles.plannerHeaderRow}>
        <Text style={styles.plannerHint}>Fill in what you know — leave the rest for later</Text>
        <Text style={styles.plannerSaveState}>
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
        </Text>
      </View>
      {PLANNER_ITEMS.map((item) => (
        <View key={item.key} style={styles.plannerRow}>
          <Text style={styles.plannerRowLabel}>
            {item.label}{" "}
            <Text style={{ color: item.sign === 1 ? Colors.terracotta : Colors.sageDeep, fontSize: 10, fontWeight: "700" }}>
              {item.sign === 1 ? "(add)" : "(subtract)"}
            </Text>
          </Text>
          <View style={styles.plannerInputWrap}>
            <Text style={{ color: Colors.ink + "80" }}>₹</Text>
            <TextInput
              style={styles.plannerInput}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={Colors.ink + "55"}
              value={values[item.key] ? String(values[item.key]) : ""}
              onChangeText={(t) => updateValue(item.key, t)}
            />
          </View>
        </View>
      ))}
      <View style={styles.plannerGapRow}>
        <Text style={styles.plannerGapLabel}>Your estimated funding gap</Text>
        <Text style={[styles.plannerGapValue, { color: gap > 0 ? Colors.terracotta : Colors.sageDeep }]}>
          {gap > 0 ? formatINR(gap) : gap < 0 ? `Covered by ${formatINR(gap)}` : "₹0"}
        </Text>
      </View>
      <Text style={styles.plannerFootnote}>
        Try not to treat every baby-related purchase as essential — a shorter necessities list
        protects your cash for healthcare, food, housing, and any income gap. Come back and
        update this once you get a hospital quote, insurance confirmation, or updated leave
        information. This stays private to you and saves automatically.
      </Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children, italic, bold }: { children: React.ReactNode; italic?: boolean; bold?: boolean }) {
  return (
    <Text style={[styles.body, italic && { fontStyle: "italic" }, bold && { fontWeight: "700", color: Colors.ink }]}>
      {children}
    </Text>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((it, i) => (
        <Text key={i} style={styles.bulletText}>
          •  {it}
        </Text>
      ))}
    </>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((it, i) => (
        <Text key={i} style={styles.bulletText}>
          {i + 1}.  {it}
        </Text>
      ))}
    </>
  );
}

function NoteCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.noteCard}>{children}</View>;
}

export default function WealthSavingsScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setIsSubscribed(await hasActiveSubscription(supabase, user.id));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Savings & Planning</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.eyebrow}>savings & planning</Text>
        <Text style={styles.title}>Savings & Financial Planning Guidance</Text>
        <Text style={styles.intro}>
          General financial education for pregnancy and your child&apos;s early years — the
          order that tends to serve you best, and how to think about each piece.
        </Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.cardTitle}>A steady plan for these early years</Text>
            <Text style={styles.body}>
              Join to get the full guidance on emergency funds, insurance, debt, and long-term
              savings — built for exactly this stage of life.
            </Text>
            <Pressable
              style={styles.button}
              onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/account")}
            >
              <Text style={styles.buttonText}>Subscribe on momvillage.in</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                This is general education. It doesn&apos;t know your income, expenses, debts,
                employment benefits, family situation, tax position, or goals — so nothing here
                is a personal recommendation. For guidance based on your own situation, that&apos;s
                a conversation for a SEBI-registered Investment Adviser.
              </Text>
            </View>

            <NoteCard>
              <Text style={styles.body}>
                <Text style={{ fontWeight: "700", color: Colors.ink }}>Want to go deeper? </Text>
                This page is the quick-reference version. Our Library book{" "}
                <Text
                  style={styles.inlineLink}
                  onPress={() => Linking.openURL("https://www.momvillage.in/dashboard/library/building-your-financial-security")}
                >
                  Building Your Financial Security
                </Text>{" "}
                covers everything here in more depth, plus wills, power of attorney, business
                succession, and retirement planning.
              </Text>
            </NoteCard>

            <Section title="Start with stability, not an investment product">
              <P>
                Pregnancy and early motherhood bring planned expenses, unexpected ones, and often
                a temporary dip in income. Money locked away for a distant goal won&apos;t help
                you with a hospital bill or next month&apos;s groceries.
              </P>
              <P bold>A useful way to think about the order:</P>
              <NumberedList
                items={[
                  "Claim what you're already entitled to, and know what you already have.",
                  "Build a small, accessible buffer first.",
                  "Keep your required debt payments current.",
                  "Tackle your highest-interest debt.",
                  "Plan separately for the maternity costs and leave you can see coming.",
                  "Then build a fuller emergency fund.",
                  "Review your protection — health/life cover, nominees, documents.",
                  "Only after your near-term footing feels steady, think about longer-term goals.",
                ]}
              />
              <P>
                This isn&apos;t a rigid order — think of it as a framework. If you&apos;re heading
                into unpaid leave soon, living on unstable income, or facing a large uninsured
                medical cost, it can make sense to hold more cash before making extra debt
                payments.
              </P>
              <P italic>
                And if you&apos;re only on step one or two right now, you&apos;re not behind.
                Financial security gets built in layers.
              </P>
            </Section>

            <Section title="Make a maternity cash-flow plan">
              <P>
                Your emergency fund is for the unexpected. A maternity fund is for the costs and
                income changes you can reasonably see coming.
              </P>
              <MaternityPlanner />
            </Section>

            <Section title="Build an accessible emergency fund">
              <P bold>What it's for</P>
              <P>
                Genuinely unexpected events — urgent travel, an uninsured medical cost, a sudden
                loss of income, an essential repair. &quot;Three to six months of essential
                expenses&quot; is a common starting point, not a rule. Your real target depends
                on things like:
              </P>
              <Bullets
                items={[
                  "How much of your leave is paid, partly paid, or unpaid",
                  "Whether your household relies on one income",
                  "How stable your job or business income is",
                  "Insurance exclusions, deductibles, and co-payments",
                  "Fixed loan repayments",
                  "Family support you can genuinely count on",
                  "How long it might take you to return to paid work",
                  "Any ongoing medical or childcare needs",
                ]}
              />
              <P>
                If a full target feels out of reach right now, start smaller. ₹10,000 isn&apos;t a
                magic number, but having some accessible buffer beats having none.
              </P>
              <P bold>Where to keep it</P>
              <P>
                Emergency money needs to stay stable in value and be quick to reach — a bank
                savings account, or an accessible fixed or sweep-in deposit, are the usual
                choices. Long-lock-in products like PPF and Sukanya Samriddhi shouldn&apos;t be
                your only emergency savings — they&apos;re built to be hard to touch.
              </P>
            </Section>

            <Section title="Review your health cover before you rely on it">
              <P>Start with what you already have:</P>
              <Bullets
                items={[
                  "Employer or group health insurance",
                  "A family policy",
                  "Government health coverage you may qualify for",
                  "Your spouse's employer policy, if it covers you",
                  "Hospital or state maternity programmes",
                ]}
              />
              <P>
                Private health policies vary a lot. Maternity care, childbirth, and newborn
                expenses may be excluded, capped, only available as an add-on, or only covered
                after a waiting period — and a policy bought during pregnancy may not cover this
                pregnancy at all.
              </P>
              <P bold>Questions worth asking before delivery</P>
              <Bullets
                items={[
                  "Is maternity care covered for this pregnancy?",
                  "What waiting period applies, and have you completed it?",
                  "Is there a separate maternity or C-section sub-limit?",
                  "Are there room-rent, procedure, or co-payment restrictions?",
                  "Is your preferred hospital in the cashless network?",
                  "Is your newborn covered from birth, or only after you enrol them?",
                  "What's the deadline and process for adding your baby?",
                  "What's explicitly excluded?",
                ]}
              />
            </Section>

            <Section title="Think about life cover if someone depends on you">
              <P>
                Life insurance protects the people who&apos;d face a financial loss if you
                weren&apos;t there — including your earnings, and the cost of replacing the
                unpaid caregiving and household work you do. Pure term insurance keeps life cover
                separate from investing.
              </P>
              <P>
                Try not to lean only on a shortcut like &quot;10–15 times your annual income&quot;
                — a real estimate should also weigh:
              </P>
              <Bullets
                items={[
                  "Your outstanding loans and other obligations",
                  "The income your household would need to replace",
                  "What it would cost to replace your unpaid caregiving",
                  "The number and ages of the people who depend on you",
                  "Childcare and education needs ahead",
                  "Your existing savings, investments, and life cover",
                  "Whether you can afford the premium for the full term",
                ]}
              />
            </Section>

            <Section title="Deal with debt thoughtfully">
              <P>
                Credit card debt and some personal loans carry interest rates well above what
                low-risk savings can earn you, so paying them down usually gives you a strong,
                predictable return. That said, don&apos;t put every spare rupee toward repayment
                if it leaves you unable to cover food, housing, healthcare, or unpaid leave.
              </P>
              <P>
                Lower-rate debt, like a home loan, is a different calculation — cheap debt
                isn&apos;t automatically debt you should keep. If payments are becoming hard to
                manage, talk to your lender early.
              </P>
            </Section>

            <Section title="Government-backed savings, in more depth">
              <P>
                PPF and Sukanya Samriddhi are long-term, government-backed savings products.
                Knowing how something works is different from deciding it&apos;s right for you.
              </P>
              <NoteCard>
                <Text style={[styles.body, { fontWeight: "700", color: Colors.ink, marginBottom: 4 }]}>
                  Public Provident Fund (PPF)
                </Text>
                <Text style={styles.body}>
                  Minimum deposit ₹500/year, maximum ₹1.5 lakh/year. Interest rate: 7.1% per year
                  for 1 July–30 September 2026, reviewed quarterly. Matures 15 complete financial
                  years after the year you opened it. Your contribution can qualify for a tax
                  deduction, but only within the overall ₹1.5 lakh Section 80C limit — shared
                  across PPF, insurance premiums, EPF, and other eligible investments combined.
                </Text>
              </NoteCard>
              <NoteCard>
                <Text style={[styles.body, { fontWeight: "700", color: Colors.ink, marginBottom: 4 }]}>
                  Sukanya Samriddhi Account (SSY)
                </Text>
                <Text style={styles.body}>
                  Opened by a parent or guardian for a daughter under 10. You deposit for 15
                  years, and the account matures 21 years after opening. Annual deposits range
                  from ₹250 to ₹1.5 lakh, currently earning 8.2% per year (1 July–30 September
                  2026), also reviewed quarterly. See the{" "}
                  <Text style={styles.inlineLink} onPress={() => router.push("/wealth-schemes")}>
                    Government Benefits & Savings Directory
                  </Text>{" "}
                  for the full entry.
                </Text>
              </NoteCard>
              <P italic>
                These products may or may not be right for your household — this guide isn&apos;t
                telling you how much to put in either.
              </P>
            </Section>

            <Section title="Thinking about education costs, honestly">
              <P>
                Education 15–18 years from now will likely cost more than it does today — how
                much more depends on the institution, course, city or country, scholarships, how
                you finance it, and inflation. Nobody can tell you the exact number today.
              </P>
              <NumberedList
                items={[
                  "Start with a present-day cost for the kind of education you're picturing.",
                  "Work out more than one future scenario using different inflation assumptions.",
                  "Decide how much of it you're aiming to fund.",
                  "Revisit the estimate as your child grows and the picture gets clearer.",
                  "Keep your own retirement and household security in view.",
                ]}
              />
            </Section>

            <Section title="Get your basic financial paperwork in order">
              <P>Around the birth is a good time to check:</P>
              <Bullets
                items={[
                  "Nominees on your bank, insurance, retirement, and investment accounts",
                  "Beneficiary details wherever they apply",
                  "Whether someone else could access your policy numbers and contacts in an emergency",
                  "Who can pay household bills if one of you is hospitalised",
                  "Birth-certificate and insurance-enrolment deadlines",
                  "A basic will and guardian arrangements — get legal advice if you need it",
                  "Whether both partners understand the household's loans, insurance, and payments",
                ]}
              />
              <P>
                A nominee can receive or hold money through an account&apos;s process, but that
                doesn&apos;t always make them the final legal owner — for wills, succession, and
                guardianship, get actual legal advice. Never write passwords, PINs, or OTPs into a
                shared family document.
              </P>
            </Section>

            <Section title="Watch for pressure and scams">
              <P>
                Be cautious of anything sold to you using fear, guilt about your child&apos;s
                future, urgency, or promises of guaranteed high returns. Before you pay for or
                invest in anything:
              </P>
              <Bullets
                items={[
                  "Verify the seller and any registration they claim, with the actual regulator",
                  "Ask for the full product document, all charges, and withdrawal terms",
                  "Understand exactly where your money goes and when you can access it",
                  "Never sign a blank form or share an OTP",
                  "Don't borrow money just to buy an investment or insurance-plus-savings product",
                  "Take your time comparing — a genuine long-term product shouldn't need an on-the-spot decision",
                ]}
              />
              <P italic>
                No properly regulated investment professional will ever guarantee market-linked
                returns.
              </P>
            </Section>

            <NoteCard>
              <Text style={styles.body}>
                <Text style={{ fontWeight: "700", color: Colors.ink }}>
                  When general education isn&apos;t enough anymore:{" "}
                </Text>
                this guide can&apos;t tell you exactly how much to hold in cash, how much
                insurance you need, which debt to pay off first, or which investments fit your
                goals — because it doesn&apos;t know your numbers. That&apos;s the point to
                consult a SEBI-registered Investment Adviser.
              </Text>
            </NoteCard>

            <Text style={styles.sourceFooter}>
              Checked July 2026 against IRDAI, the National Savings Institute, and SEBI. Rates,
              tax rules, and insurance terms change — dated figures get a fresh check before
              republishing.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.ivory },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.ivory },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  topBarTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: Colors.sageDeep,
    marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  intro: { fontSize: 13, color: Colors.ink + "a6", lineHeight: 19, marginBottom: 18 },
  lockedCard: { backgroundColor: Colors.ivory2, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  body: { fontSize: 13, color: Colors.ink + "bf", lineHeight: 19, marginBottom: 10 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  disclaimerBox: { backgroundColor: Colors.gold + "1a", borderRadius: 14, padding: 14, marginBottom: 16 },
  disclaimerText: { fontSize: 12, color: Colors.ink + "99", lineHeight: 18, fontStyle: "italic" },
  inlineLink: { color: Colors.goldDeep, fontWeight: "700", textDecorationLine: "underline" },
  noteCard: { backgroundColor: Colors.sageDeep + "14", borderRadius: 16, padding: 16, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.indigo, marginBottom: 8, fontFamily: undefined },
  bulletText: { fontSize: 13, color: Colors.ink + "bf", lineHeight: 19, marginBottom: 5 },
  sourceFooter: { fontSize: 11, color: Colors.ink + "70", lineHeight: 16, marginBottom: 30, fontStyle: "italic" },
  plannerCard: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 14, marginTop: 6 },
  plannerHeaderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  plannerHint: { fontSize: 10, textTransform: "uppercase", fontWeight: "700", color: Colors.ink + "80", flex: 1 },
  plannerSaveState: { fontSize: 10, color: Colors.sageDeep, fontWeight: "700" },
  plannerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8 },
  plannerRowLabel: { fontSize: 12, color: Colors.ink + "cc", flex: 1 },
  plannerInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.ivory, borderWidth: 1, borderColor: Colors.line, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  plannerInput: { width: 70, textAlign: "right", fontSize: 13, color: Colors.ink },
  plannerGapRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.line },
  plannerGapLabel: { fontSize: 13, fontWeight: "700", color: Colors.ink },
  plannerGapValue: { fontSize: 17, fontWeight: "700" },
  plannerFootnote: { fontSize: 11, color: Colors.ink + "80", lineHeight: 16, marginTop: 10 },
});
