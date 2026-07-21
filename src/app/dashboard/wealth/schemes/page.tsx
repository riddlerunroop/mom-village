import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import {
  DocHeader,
  DisclaimerBox,
  Section,
  EntryCard,
  NoteCard,
  BulletList,
  SourceFooter,
} from "@/components/ContentDoc";

// Content locked 2026-07-21. Source: "Wealth - Government Benefits and
// Savings Directory (LOCKED).md" — drafted, ChatGPT-reviewed, independently
// web-verified against official sources, then rewritten in Mom Village's
// voice. Do not edit facts here without going through that workflow again.
export default async function SchemesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[760px] mx-auto px-6 py-10">
      <Link href="/dashboard/wealth" className="text-xs font-semibold text-sage-deep mb-6 inline-block">
        ← back to Wealth
      </Link>

      <DocHeader
        eyebrow="government benefits & savings"
        title="Government Benefits & Savings Directory"
        intro="Real, national-level schemes and entitlements available to Indian mothers and children — what they give you, and how to actually access them."
      />

      {!isSubscribed ? (
        <LockedPreview
          title="Every scheme you may be entitled to"
          teaser="Join to see the full directory of government benefits and savings schemes for pregnancy through your child's third birthday."
        />
      ) : (
        <>
          <DisclaimerBox>
            This is general information about central government programmes,
            not a guarantee you&apos;ll receive a benefit, and not personalised
            legal, medical, tax, or investment advice. Rules, amounts, and
            required documents can change, and your state may offer
            additional benefits or apply rules a little differently. Before
            relying on anything here, confirm current details with your
            Anganwadi worker, ASHA/ANM, government health facility, or the
            scheme&apos;s official portal.
          </DisclaimerBox>

          <Section title="Health support through pregnancy and early motherhood">
            <EntryCard
              title="Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)"
              who="You, if you're in your second or third trimester."
              what="A free, fixed-day package of antenatal care on the 9th of every month at designated government health facilities — checkup by a doctor or medical officer, relevant diagnostic tests, high-risk screening, counselling, and referral if needed."
              how="Ask your ASHA/ANM or nearby government health facility where PMSMA is offered near you, and carry your antenatal records. Exact scheduling can vary by location."
              link="https://pmsma.mohfw.gov.in/?lang=en"
              linkLabel="PMSMA — Ministry of Health & Family Welfare"
            />
            <EntryCard
              title="Janani Shishu Suraksha Karyakram (JSSK)"
              who="You, if you deliver at a public health institution or have antenatal/postnatal complications treated there — and your baby, if they need treatment at a public facility any time in their first year."
              what="Free and cashless care — delivery (including C-section), drugs, diagnostics, blood if needed, meals during your stay (3 days for a normal delivery, 7 for a C-section), and transport to the facility, between facilities if referred, and back home. The same zero-cost treatment applies if your baby falls sick in their first year."
              how="Ask about JSSK at the public hospital or health centre when you're being cared for. If you're asked to pay for something you believe should be free, raise it with the facility's help desk or your ASHA/ANM."
              link="https://www.nhm.gov.in/nhm/index1.php?lang=1&level=3&lid=308&sublinkid=842"
              linkLabel="JSSK — National Health Mission"
            />
            <EntryCard
              title="Universal Immunization Programme (UIP)"
              who="You during pregnancy, and your child through infancy and early childhood."
              what="Every vaccine on the National Immunization Schedule, free, at government health facilities and immunisation sessions — starting in pregnancy, continuing through your baby's first years. A few vaccines (like Japanese encephalitis) only apply in certain areas."
              how="Visit a government health facility or local immunisation session, and bring your mother-and-child protection card every time. If a dose gets delayed, ask a health worker how to catch up rather than skipping it."
              link="https://www.mohfw.gov.in/sites/default/files/National%20Immunization%20Schedule.pdf"
              linkLabel="National Immunization Schedule"
            />
            <EntryCard
              title="Mission Saksham Anganwadi and Poshan 2.0 (what you may know as ICDS/Anganwadi)"
              who="You, if you're pregnant or lactating, and your child from 6 months to 6 years."
              what="Supplementary nutrition, health checkups, nutrition education, immunisation support, and preschool activities through your local Anganwadi centre — what's available depends on your child's age (preschool education is mainly 3–6 years, nutrition support starts from 6 months)."
              how="Contact your nearest Anganwadi centre and ask what's needed locally to register. Anganwadi workers can also help you understand other maternal and child schemes you may qualify for."
              link="https://spniwcd.wcd.gov.in/mission-saksham-anganwadi-and-poshan-2-0"
              linkLabel="Mission Saksham Anganwadi and Poshan 2.0"
            />
            <EntryCard
              title="Ayushman Bharat — PM-JAY"
              who="Families who meet PM-JAY's eligibility criteria (or an expanded state version of it) — this isn't a single universal income cutoff, so it's worth checking even if you're unsure."
              what="Cashless hospital treatment cover of up to ₹5 lakh per family per year at empanelled hospitals, which can include eligible maternity and delivery-related treatment — subject to the specific package and hospital approval."
              how="Check your eligibility through an official PM-JAY channel, call the helpline on 14555, or visit an empanelled hospital or Common Service Centre. Before admission, confirm the hospital is empanelled and your treatment is covered, if you have the time to check."
              link="https://nha.gov.in/PM-JAY"
              linkLabel="PM-JAY — National Health Authority"
            />
          </Section>

          <Section title="Cash and employment support">
            <EntryCard
              title="Pradhan Mantri Matru Vandana Yojana (PMMVY 2.0)"
              who="Pregnant and lactating women in specific eligible categories — including women with a BPL/e-Shram/MGNREGA card or PM-JAY status, SC/ST women, women with qualifying disabilities, Anganwadi workers/helpers and ASHAs, and women below a notified family-income limit. Women in regular government/PSU jobs, or already getting similar maternity benefits elsewhere, generally don't qualify — check the current rules for your situation."
              what="For your first child — ₹5,000 in two instalments: ₹3,000 after you register your pregnancy and complete at least one antenatal checkup, and ₹2,000 after birth registration and your baby's first immunisation cycle (14 weeks). For a second child, if it's a girl — ₹6,000 in one instalment after birth registration and the 14-week immunisation cycle."
              how="Ask your Anganwadi worker or ASHA for help, or use the official PMMVY portal. Apply early — there are timelines tied to each instalment."
              link="https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs"
              linkLabel="PMMVY official info"
            />
            <EntryCard
              title="Maternity Benefit Act, 1961 (as amended 2017)"
              who="Women working at establishments with 10+ employees, who've worked at least 80 days in the 12 months before their expected delivery."
              what="Up to 26 weeks of paid maternity leave if you have fewer than two surviving children (12 weeks for a third child on); 12 weeks for adopting or commissioning mothers; a crèche facility if your employer has 50+ employees; and the possibility of working from home afterward, if your role allows it and your employer agrees — this is something your employer may offer, not an automatic right. (If your employer is covered under Employees' State Insurance, that can affect how this applies to you.)"
              how="Notify your employer in writing and ask HR for their maternity-leave process. Keep your own copies of everything. If you think the law isn't being followed, you can contact your local labour authority."
              link="https://labour.gov.in/sites/default/files/maternity_benefit_amendment_act2017_.pdf"
              linkLabel="Maternity Benefit (Amendment) Act, 2017"
            />
          </Section>

          <Section title="Long-term savings for a daughter">
            <EntryCard
              title="Sukanya Samriddhi Account (SSY)"
              who="A daughter under 10 — you or her legal guardian open and run the account for her."
              what="A government-backed long-term savings account in her name. The interest rate is set and reviewed by the government each quarter — currently 8.2% per year (Jul–Sep 2026), and it may change. You can deposit ₹250 to ₹1.5 lakh a year, for the first 15 years; the account matures 21 years after you open it. Withdrawals before maturity are restricted to specific situations. This is a long-term, hard-to-access account — not a substitute for money you might need close at hand, like an emergency fund or delivery costs."
              how="Open it at a post office or authorised bank with her birth certificate and your ID/address proof. Confirm the latest rate and paperwork before you deposit."
              link="https://www.nsiindia.gov.in/(S(04y0ggnzict2ygyvbl5ox1yi))/InternalPage.aspx?Id_Pk=132"
              linkLabel="Current small-savings rates — National Savings Institute"
            />
          </Section>

          <Section title="A few more worth asking about locally">
            <NoteCard>
              <p className="mb-3">
                Rules and availability for these vary more by state, so treat
                them as a starting point for a conversation with your
                Anganwadi worker, ASHA/ANM, or hospital, rather than a full
                entry yet:
              </p>
              <BulletList
                items={[
                  <>
                    <span className="font-semibold text-ink">
                      Janani Suraksha Yojana (JSY):
                    </span>{" "}
                    cash assistance tied to institutional delivery, amount
                    and eligibility depend on your category and state.
                  </>,
                  <>
                    <span className="font-semibold text-ink">
                      Surakshit Matritva Aashwasan (SUMAN):
                    </span>{" "}
                    a government commitment to zero-cost, respectful maternal
                    and newborn care at participating public facilities.
                  </>,
                  <>
                    <span className="font-semibold text-ink">
                      State-specific schemes:
                    </span>{" "}
                    many states run their own additional cash, nutrition,
                    transport, or girl-child benefits on top of the national
                    ones above.
                  </>,
                ]}
              />
            </NoteCard>
          </Section>

          <NoteCard>
            <span className="font-semibold text-ink">A note for later, on investing: </span>
            once we build out deeper financial guidance, the responsible
            order is usually: claim what you&apos;re entitled to above → build
            an emergency fund you can access quickly → review health/life
            insurance → clear any high-interest debt → save for near-term
            childcare costs → and only after that, look at longer-term
            investments for your child or yourself. Anything that starts
            recommending specific investments or personalised financial
            plans is a different, regulated category from general education
            like this directory — worth keeping separate.
          </NoteCard>

          <SourceFooter>
            Checked July 2026 against official sources: Ministry of Health &amp;
            Family Welfare, National Health Mission, Ministry of Women &amp;
            Child Development, National Health Authority, Ministry of Labour
            &amp; Employment, and the National Savings Institute.
            Time-sensitive figures (like the SSY rate) get a fresh check
            before this is republished, and at regular intervals after that.
          </SourceFooter>
        </>
      )}
    </main>
  );
}
