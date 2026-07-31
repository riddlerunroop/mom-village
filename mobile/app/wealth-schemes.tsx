// Government Benefits & Savings Directory — native port of
// src/app/dashboard/wealth/schemes/page.tsx, Phase 3 of the 2026-07-31
// agreed build plan. Same locked, independently-verified content (checked
// July 2026 against official sources — see the web page's own header
// comment) — do not edit facts here without going through that same
// draft -> review -> verify -> lock workflow. Stage filter only (matches
// what the app genuinely knows about her — employment type/state aren't
// collected anywhere in this app, so those stay unfiltered here too, same
// honesty-over-fake-personalization call the web version made).

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
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
import { calculateMonthNumber } from "../lib/monthCalculator";
import { Colors } from "../constants/theme";

type Stage = "pregnancy" | "postpartum" | "early_childhood";

const STAGE_LABELS: Record<Stage, string> = {
  pregnancy: "Pregnancy",
  postpartum: "First year",
  early_childhood: "1–6 years",
};

type Scheme = {
  title: string;
  who: string;
  what: string;
  how: string;
  link: string;
  linkLabel: string;
  stages: Stage[];
};

type SchemeSection = { title: string; schemes: Scheme[] };

const SECTIONS: SchemeSection[] = [
  {
    title: "Health support through pregnancy and early motherhood",
    schemes: [
      {
        title: "Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)",
        who: "You, if you're in your second or third trimester.",
        what: "A free, fixed-day package of antenatal care on the 9th of every month at designated government health facilities — checkup by a doctor or medical officer, relevant diagnostic tests, high-risk screening, counselling, and referral if needed.",
        how: "Ask your ASHA/ANM or nearby government health facility where PMSMA is offered near you, and carry your antenatal records. Exact scheduling can vary by location.",
        link: "https://pmsma.mohfw.gov.in/?lang=en",
        linkLabel: "PMSMA — Ministry of Health & Family Welfare",
        stages: ["pregnancy"],
      },
      {
        title: "Janani Shishu Suraksha Karyakram (JSSK)",
        who: "You, if you deliver at a public health institution or have antenatal/postnatal complications treated there — and your baby, if they need treatment at a public facility any time in their first year.",
        what: "Free and cashless care — delivery (including C-section), drugs, diagnostics, blood if needed, meals during your stay (3 days for a normal delivery, 7 for a C-section), and transport to the facility, between facilities if referred, and back home. The same zero-cost treatment applies if your baby falls sick in their first year.",
        how: "Ask about JSSK at the public hospital or health centre when you're being cared for. If you're asked to pay for something you believe should be free, raise it with the facility's help desk or your ASHA/ANM.",
        link: "https://www.nhm.gov.in/nhm/index1.php?lang=1&level=3&lid=308&sublinkid=842",
        linkLabel: "JSSK — National Health Mission",
        stages: ["pregnancy", "postpartum"],
      },
      {
        title: "Universal Immunization Programme (UIP)",
        who: "You during pregnancy, and your child through infancy and early childhood.",
        what: "Every vaccine on the National Immunization Schedule, free, at government health facilities and immunisation sessions — starting in pregnancy, continuing through your baby's first years. A few vaccines (like Japanese encephalitis) only apply in certain areas.",
        how: "Visit a government health facility or local immunisation session, and bring your mother-and-child protection card every time. If a dose gets delayed, ask a health worker how to catch up rather than skipping it.",
        link: "https://www.mohfw.gov.in/sites/default/files/National%20Immunization%20Schedule.pdf",
        linkLabel: "National Immunization Schedule",
        stages: ["pregnancy", "postpartum", "early_childhood"],
      },
      {
        title: "Mission Saksham Anganwadi and Poshan 2.0 (ICDS/Anganwadi)",
        who: "You, if you're pregnant or lactating, and your child from 6 months to 6 years.",
        what: "Supplementary nutrition, health checkups, nutrition education, immunisation support, and preschool activities through your local Anganwadi centre — what's available depends on your child's age (preschool education is mainly 3–6 years, nutrition support starts from 6 months).",
        how: "Contact your nearest Anganwadi centre and ask what's needed locally to register. Anganwadi workers can also help you understand other maternal and child schemes you may qualify for.",
        link: "https://spniwcd.wcd.gov.in/mission-saksham-anganwadi-and-poshan-2-0",
        linkLabel: "Mission Saksham Anganwadi and Poshan 2.0",
        stages: ["pregnancy", "postpartum", "early_childhood"],
      },
      {
        title: "Ayushman Bharat — PM-JAY",
        who: "Families who meet PM-JAY's eligibility criteria (or an expanded state version of it) — this isn't a single universal income cutoff, so it's worth checking even if you're unsure.",
        what: "Cashless hospital treatment cover of up to ₹5 lakh per family per year at empanelled hospitals, which can include eligible maternity and delivery-related treatment — subject to the specific package and hospital approval.",
        how: "Check your eligibility through an official PM-JAY channel, call the helpline on 14555, or visit an empanelled hospital or Common Service Centre. Before admission, confirm the hospital is empanelled and your treatment is covered, if you have the time to check.",
        link: "https://nha.gov.in/PM-JAY",
        linkLabel: "PM-JAY — National Health Authority",
        stages: ["pregnancy", "postpartum", "early_childhood"],
      },
    ],
  },
  {
    title: "Cash and employment support",
    schemes: [
      {
        title: "Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0)",
        who: "Pregnant and lactating women in specific eligible categories — including women with a BPL/e-Shram/MGNREGA card or PM-JAY status, SC/ST women, women with qualifying disabilities, Anganwadi workers/helpers and ASHAs, and women below a notified family-income limit. Women in regular government/PSU jobs, or already getting similar maternity benefits elsewhere, generally don't qualify — check the current rules for your situation.",
        what: "For your first child — ₹5,000 in two instalments: ₹3,000 after you register your pregnancy and complete at least one antenatal checkup, and ₹2,000 after birth registration and your baby's first immunisation cycle (14 weeks). For a second child, if it's a girl — ₹6,000 in one instalment after birth registration and the 14-week immunisation cycle.",
        how: "Ask your Anganwadi worker or ASHA for help, or use the official PMMVY portal. Apply early — there are timelines tied to each instalment.",
        link: "https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs",
        linkLabel: "PMMVY official info",
        stages: ["pregnancy", "postpartum"],
      },
      {
        title: "Maternity Benefit Act, 1961 (as amended 2017)",
        who: "Women working at establishments with 10+ employees, who've worked at least 80 days in the 12 months before their expected delivery.",
        what: "Up to 26 weeks of paid maternity leave if you have fewer than two surviving children (12 weeks for a third child on); 12 weeks for adopting or commissioning mothers; a crèche facility if your employer has 50+ employees; and the possibility of working from home afterward, if your role allows it and your employer agrees — this is something your employer may offer, not an automatic right.",
        how: "Notify your employer in writing and ask HR for their maternity-leave process. Keep your own copies of everything. If you think the law isn't being followed, you can contact your local labour authority.",
        link: "https://labour.gov.in/sites/default/files/maternity_benefit_amendment_act2017_.pdf",
        linkLabel: "Maternity Benefit (Amendment) Act, 2017",
        stages: ["pregnancy", "postpartum"],
      },
    ],
  },
  {
    title: "Long-term savings for a daughter",
    schemes: [
      {
        title: "Sukanya Samriddhi Account (SSY)",
        who: "A daughter under 10 — you or her legal guardian open and run the account for her.",
        what: "A government-backed long-term savings account in her name. The interest rate is set and reviewed by the government each quarter — currently 8.2% per year (Jul–Sep 2026), and it may change. You can deposit ₹250 to ₹1.5 lakh a year, for the first 15 years; the account matures 21 years after you open it. Withdrawals before maturity are restricted to specific situations. This is a long-term, hard-to-access account — not a substitute for money you might need close at hand, like an emergency fund or delivery costs.",
        how: "Open it at a post office or authorised bank with her birth certificate and your ID/address proof. Confirm the latest rate and paperwork before you deposit.",
        link: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=132",
        linkLabel: "Current small-savings rates — National Savings Institute",
        stages: ["postpartum", "early_childhood"],
      },
    ],
  },
];

export default function WealthSchemesScreen() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const [filterMine, setFilterMine] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setIsSubscribed(await hasActiveSubscription(supabase, user.id));

    const { data: profile } = await supabase
      .from("profiles")
      .select("due_date, baby_dob")
      .eq("id", user.id)
      .maybeSingle();

    const referenceDate = profile?.baby_dob || profile?.due_date;
    if (referenceDate) {
      const monthNumber = calculateMonthNumber(referenceDate);
      if (monthNumber < 0) setCurrentStage("pregnancy");
      else if (monthNumber < 12) setCurrentStage("postpartum");
      else setCurrentStage("early_childhood");
    }
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

  const visibleSections = SECTIONS.map((s) => ({
    ...s,
    schemes: s.schemes.filter(
      (sc) => !filterMine || !currentStage || sc.stages.includes(currentStage)
    ),
  })).filter((s) => s.schemes.length > 0);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={Colors.indigo} />
        </Pressable>
        <Text style={styles.topBarTitle}>Government Benefits</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.eyebrow}>government benefits & savings</Text>
        <Text style={styles.title}>Government Benefits & Savings Directory</Text>
        <Text style={styles.intro}>
          Real, national-level schemes and entitlements available to Indian mothers and children
          — what they give you, and how to actually access them.
        </Text>

        {!isSubscribed ? (
          <View style={styles.lockedCard}>
            <Text style={styles.cardTitle}>Every scheme you may be entitled to</Text>
            <Text style={styles.body}>
              Join to see the full directory of government benefits and savings schemes for
              pregnancy through your child&apos;s third birthday.
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
                This is general information about central government programmes, not a guarantee
                you&apos;ll receive a benefit, and not personalised legal, medical, tax, or
                investment advice. Rules, amounts, and required documents can change, and your
                state may offer additional benefits or apply rules a little differently. Before
                relying on anything here, confirm current details with your Anganwadi worker,
                ASHA/ANM, government health facility, or the scheme&apos;s official portal.
              </Text>
            </View>

            {currentStage && (
              <Pressable
                style={styles.filterToggle}
                onPress={() => setFilterMine((v) => !v)}
              >
                <Ionicons
                  name={filterMine ? "checkbox" : "square-outline"}
                  size={18}
                  color={Colors.sageDeep}
                />
                <Text style={styles.filterToggleText}>
                  Show only what may apply to me right now ({STAGE_LABELS[currentStage]})
                </Text>
              </Pressable>
            )}

            {visibleSections.map((section) => (
              <View key={section.title} style={{ marginBottom: 8 }}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.schemes.map((scheme) => (
                  <View key={scheme.title} style={styles.schemeCard}>
                    <Text style={styles.schemeTitle}>{scheme.title}</Text>
                    <Text style={styles.schemeLabel}>Who it's for</Text>
                    <Text style={styles.schemeBody}>{scheme.who}</Text>
                    <Text style={styles.schemeLabel}>What you get</Text>
                    <Text style={styles.schemeBody}>{scheme.what}</Text>
                    <Text style={styles.schemeLabel}>How to access it</Text>
                    <Text style={styles.schemeBody}>{scheme.how}</Text>
                    <Pressable onPress={() => Linking.openURL(scheme.link)}>
                      <Text style={styles.schemeLink}>{scheme.linkLabel} →</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.noteCard}>
              <Text style={styles.body}>
                A few more worth asking about locally — rules and availability for these vary
                more by state, so treat them as a starting point for a conversation with your
                Anganwadi worker, ASHA/ANM, or hospital, rather than a full entry yet:
              </Text>
              <Text style={styles.bulletText}>
                • <Text style={styles.bulletBold}>Janani Suraksha Yojana (JSY):</Text> cash
                assistance tied to institutional delivery, amount and eligibility depend on your
                category and state.
              </Text>
              <Text style={styles.bulletText}>
                • <Text style={styles.bulletBold}>Surakshit Matritva Aashwasan (SUMAN):</Text> a
                government commitment to zero-cost, respectful maternal and newborn care at
                participating public facilities.
              </Text>
              <Text style={styles.bulletText}>
                • <Text style={styles.bulletBold}>State-specific schemes:</Text> many states run
                their own additional cash, nutrition, transport, or girl-child benefits on top of
                the national ones above.
              </Text>
            </View>

            <Text style={styles.sourceFooter}>
              Checked July 2026 against official sources: Ministry of Health & Family Welfare,
              National Health Mission, Ministry of Women & Child Development, National Health
              Authority, Ministry of Labour & Employment, and the National Savings Institute.
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
  body: { fontSize: 13, color: Colors.ink + "bf", lineHeight: 19, marginBottom: 12 },
  button: { backgroundColor: Colors.goldDeep, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  buttonText: { color: Colors.ivory, fontWeight: "700", fontSize: 14 },
  disclaimerBox: { backgroundColor: Colors.gold + "1a", borderRadius: 14, padding: 14, marginBottom: 16 },
  disclaimerText: { fontSize: 12, color: Colors.ink + "99", lineHeight: 18, fontStyle: "italic" },
  filterToggle: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 18 },
  filterToggleText: { fontSize: 12, color: Colors.sageDeep, fontWeight: "700", flex: 1 },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.terracotta, marginBottom: 10, marginTop: 8 },
  schemeCard: { backgroundColor: Colors.ivory2, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 16, marginBottom: 12 },
  schemeTitle: { fontSize: 15, fontWeight: "700", color: Colors.indigo, marginBottom: 8 },
  schemeLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: Colors.sageDeep, marginTop: 8, marginBottom: 2 },
  schemeBody: { fontSize: 13, color: Colors.ink + "cc", lineHeight: 18 },
  schemeLink: { fontSize: 12, color: Colors.goldDeep, fontWeight: "700", marginTop: 10 },
  noteCard: { backgroundColor: Colors.sageDeep + "14", borderRadius: 16, padding: 16, marginTop: 6, marginBottom: 16 },
  bulletText: { fontSize: 13, color: Colors.ink + "bf", lineHeight: 19, marginBottom: 6 },
  bulletBold: { fontWeight: "700", color: Colors.ink },
  sourceFooter: { fontSize: 11, color: Colors.ink + "70", lineHeight: 16, marginBottom: 30, fontStyle: "italic" },
});
