import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hasActiveSubscription } from "@/lib/subscription";
import LockedPreview from "@/components/LockedPreview";
import {
  DocHeader,
  DisclaimerBox,
  Section,
  NoteCard,
  BulletList,
  NumberedList,
  Worksheet,
  SourceFooter,
} from "@/components/ContentDoc";

// Content locked 2026-07-21. Source: "Wealth - Savings and Planning
// Guidance (LOCKED).md" — drafted, ChatGPT-reviewed, independently
// web-verified against official sources, then rewritten in Mom Village's
// voice. Deliberately general education, not personalised advice — stays
// on the general-education side of the SEBI Investment Adviser line by
// design. Do not edit facts here without going through that workflow again.
export default async function SavingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isSubscribed = await hasActiveSubscription(supabase, user!.id);

  return (
    <main className="max-w-[760px] mx-auto px-6 py-10">
      <Link href="/dashboard/wealth" className="text-xs font-semibold text-sage-deep mb-6 inline-block">
        ← back to Wealth
      </Link>

      <DocHeader
        eyebrow="savings & planning"
        title="Savings & Financial Planning Guidance"
        intro="General financial education for pregnancy and your child's early years — the order that tends to serve you best, and how to think about each piece."
      />

      {!isSubscribed ? (
        <LockedPreview
          title="A steady plan for these early years"
          teaser="Join to get the full guidance on emergency funds, insurance, debt, and long-term savings — built for exactly this stage of life."
        />
      ) : (
        <>
          <DisclaimerBox>
            This is general education. It doesn&apos;t know your income,
            expenses, debts, employment benefits, family situation, tax
            position, or goals — so nothing here is a personal recommendation
            or an instruction to buy, sell, or invest in anything specific.
            Product terms and laws change, and an example that fits someone
            else may not fit you. For guidance based on your own situation,
            that&apos;s a conversation for a SEBI-registered Investment
            Adviser.
          </DisclaimerBox>

          <Section title="Start with stability, not an investment product">
            <p className="text-sm text-ink/75">
              Pregnancy and early motherhood bring planned expenses,
              unexpected ones, and often a temporary dip in income. Money
              locked away for a distant goal won&apos;t help you with a
              hospital bill or next month&apos;s groceries.
            </p>
            <p className="text-sm text-ink/75 font-semibold">
              A useful way to think about the order:
            </p>
            <NumberedList
              items={[
                <>
                  <span className="font-semibold text-ink">
                    Claim what you&apos;re already entitled to, and know what
                    you already have.
                  </span>{" "}
                  Government entitlements, employer maternity benefits, paid
                  and unpaid leave, existing health insurance — see the{" "}
                  <Link href="/dashboard/wealth/schemes" className="underline text-gold-deep font-semibold">
                    Government Benefits &amp; Savings directory
                  </Link>{" "}
                  in this section.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Build a small, accessible buffer first.
                  </span>{" "}
                  Even a modest amount can keep you from reaching for
                  expensive debt when something unexpected comes up.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Keep your required debt payments current.
                  </span>{" "}
                  Missed payments create fees, penalties, and credit problems
                  you don&apos;t need on top of everything else.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Tackle your highest-interest debt.
                  </span>{" "}
                  Credit card balances and costly personal loans usually grow
                  faster than what safe savings can earn you — though if
                  you&apos;re facing a medical situation or income
                  uncertainty, it can make sense to hold extra cash first
                  instead.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Plan separately for the maternity costs and leave you can
                    see coming.
                  </span>{" "}
                  Delivery expenses, unpaid leave, and routine baby purchases
                  aren&apos;t emergencies if you can estimate them ahead of
                  time.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Then build a fuller emergency fund.
                  </span>{" "}
                  What&apos;s &quot;enough&quot; depends on your household,
                  not one universal number.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Review your protection.
                  </span>{" "}
                  Health and life cover, nominees, important documents, and
                  whether your partner knows where everything is.
                </>,
                <>
                  <span className="font-semibold text-ink">
                    Only after your near-term footing feels steady, think
                    about longer-term goals.
                  </span>{" "}
                  Education, retirement, and anything else — the right mix
                  depends on your time horizon, how liquid you need to be,
                  inflation, tax, and how much risk you&apos;re comfortable
                  with.
                </>,
              ]}
            />
            <p className="text-sm text-ink/75">
              This isn&apos;t a rigid order — think of it as a framework. If
              you&apos;re heading into unpaid leave soon, living on unstable
              income, or facing a large medical cost that isn&apos;t insured,
              it can make sense to hold more cash before making extra debt
              payments.
            </p>
            <p className="text-sm text-ink/75 italic">
              And if you&apos;re only on step one or two right now, you&apos;re
              not behind. Financial security gets built in layers.
            </p>
          </Section>

          <Section title="Make a maternity cash-flow plan">
            <p className="text-sm text-ink/75">
              Your emergency fund is for the unexpected. A maternity fund is
              for the costs and income changes you can reasonably see coming.
            </p>
            <Worksheet
              rows={[
                "Antenatal appointments and tests",
                "Delivery and hospital costs",
                "Expected insurance or government contribution (subtract)",
                "Medicines and postnatal care",
                "Travel and support costs",
                "Essential one-time baby purchases",
                "Monthly household essentials during leave",
                "Loan and insurance payments during leave",
                "Income expected during paid leave (subtract)",
                "Income lost during unpaid or reduced-pay leave",
                "Childcare after you return to work",
                "Government or employer cash benefits (subtract)",
                "Your estimated funding gap",
              ]}
            />
            <p className="text-sm text-ink/75">
              Try not to treat every baby-related purchase as essential — a
              shorter necessities list protects your cash for healthcare,
              food, housing, and any income gap. Come back and update this
              once you get a hospital quote, insurance confirmation, or
              updated leave information — and don&apos;t count an insurance
              claim or benefit as money in hand until you understand what it
              takes to actually receive it.
            </p>
          </Section>

          <Section title="Build an accessible emergency fund">
            <p className="text-sm text-ink/75 font-semibold">What it&apos;s for</p>
            <p className="text-sm text-ink/75">
              Genuinely unexpected events — urgent travel, an uninsured
              medical cost, a sudden loss of income, an essential repair.
              &quot;Three to six months of essential expenses&quot; is a
              common starting point, not a rule. Your real target could be
              higher or lower depending on things like:
            </p>
            <BulletList
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
            <p className="text-sm text-ink/75">
              If a full target feels out of reach right now, start smaller.
              ₹10,000 isn&apos;t a magic number, but having some accessible
              buffer beats having none.
            </p>
            <p className="text-sm text-ink/75 font-semibold">Where to keep it</p>
            <p className="text-sm text-ink/75">
              Emergency money needs to stay stable in value and be quick to
              reach — a bank savings account, or an accessible fixed or
              sweep-in deposit, are the usual choices. Before you decide
              where to park it, it&apos;s worth checking how quickly you can
              actually withdraw it, minimum-balance requirements, early
              withdrawal penalties, online/branch access in an emergency, and
              whether you&apos;re keeping too much with just one bank.
            </p>
            <p className="text-sm text-ink/75">
              Long-lock-in products like PPF and Sukanya Samriddhi
              shouldn&apos;t be your only emergency savings — they&apos;re
              built to be hard to touch, which is the opposite of what you
              need here.
            </p>
          </Section>

          <Section title="Review your health cover before you rely on it">
            <p className="text-sm text-ink/75">Start with what you already have:</p>
            <BulletList
              items={[
                "Employer or group health insurance",
                "A family policy",
                "Government health coverage you may qualify for",
                "Your spouse's employer policy, if it covers you",
                "Hospital or state maternity programmes",
              ]}
            />
            <p className="text-sm text-ink/75">
              Private health policies vary a lot. Maternity care, childbirth,
              and newborn expenses may be excluded, capped, only available as
              an add-on, or only covered after a waiting period — and a
              policy bought during pregnancy may not cover this pregnancy at
              all. Even if your current pregnancy isn&apos;t covered, having
              broader health insurance can still matter for other medical
              costs.
            </p>
            <p className="text-sm text-ink/75 font-semibold">
              Questions worth asking before delivery
            </p>
            <BulletList
              items={[
                "Is maternity care covered for this pregnancy?",
                "What waiting period applies, and have you completed it?",
                "Is there a separate maternity or C-section sub-limit?",
                "Are there room-rent, procedure, or co-payment restrictions?",
                "Is your preferred hospital in the cashless network?",
                "Do you need pre-authorisation, and who arranges it?",
                "Is your newborn covered from birth, or only after you enrol them?",
                "What's the deadline and process for adding your baby?",
                "Are congenital conditions, vaccinations, and outpatient visits covered?",
                "What's explicitly excluded?",
              ]}
            />
            <p className="text-sm text-ink/75">
              Get the answers in writing from your insurer, and read the
              actual policy wording — a hospital&apos;s cost estimate isn&apos;t
              a guarantee the insurer will approve the full claim. If
              you&apos;re eligible, also check Ayushman Bharat–PM-JAY and
              other programmes in the{" "}
              <Link href="/dashboard/wealth/schemes" className="underline text-gold-deep font-semibold">
                Government Benefits &amp; Savings Directory
              </Link>
              .
            </p>
          </Section>

          <Section title="Think about life cover if someone depends on you">
            <p className="text-sm text-ink/75">
              Life insurance protects the people who&apos;d face a financial
              loss if you weren&apos;t there — including your earnings, and
              the cost of replacing the unpaid caregiving and household work
              you do. Pure term insurance keeps life cover separate from
              investing, and generally gives you more cover per rupee of
              premium than products that bundle insurance with savings. That
              doesn&apos;t make any one policy right for you specifically.
            </p>
            <p className="text-sm text-ink/75">
              Try not to lean only on a shortcut like &quot;10–15 times your
              annual income&quot; — a real estimate should also weigh:
            </p>
            <BulletList
              items={[
                "Your outstanding loans and other obligations",
                "The income your household would need to replace",
                "What it would cost to replace your unpaid caregiving",
                "The number and ages of the people who depend on you",
                "Childcare and education needs ahead",
                "How long your family would need the support",
                "Your existing savings, investments, and life cover",
                "Inflation and future costs",
                "Whether you can afford the premium for the full term",
              ]}
            />
            <p className="text-sm text-ink/75 italic">
              This is meant to explain the concept — not to recommend an
              insurer, a coverage amount, or a specific policy.
            </p>
          </Section>

          <Section title="Deal with debt thoughtfully">
            <p className="text-sm text-ink/75">
              Credit card debt and some personal loans carry interest rates
              well above what low-risk savings can earn you, so paying them
              down usually gives you a strong, predictable return. That said,
              don&apos;t put every spare rupee toward repayment if it leaves
              you unable to cover food, housing, healthcare, or an
              unpaid-leave period that&apos;s coming up. A practical
              approach: build a small buffer, keep all your minimum payments
              current, then send whatever&apos;s left toward your costliest
              debt first.
            </p>
            <p className="text-sm text-ink/75">
              Lower-rate debt, like a home loan, is a different calculation —
              cheap debt isn&apos;t automatically debt you should keep. If
              payments are becoming hard to manage, talk to your lender
              early rather than waiting, and don&apos;t take a new loan just
              to make it look like you have savings.
            </p>
          </Section>

          <Section title="Government-backed savings, in more depth">
            <p className="text-sm text-ink/75">
              PPF and Sukanya Samriddhi are long-term, government-backed
              savings products. The government sets their interest rates
              periodically. Neither requires you to pick individual shares
              or funds, but both come with real restrictions on accessing
              your money. Knowing how something works is different from
              deciding it&apos;s right for you.
            </p>
            <NoteCard>
              <p className="font-semibold text-ink mb-1">Public Provident Fund (PPF)</p>
              <p className="mb-2">
                Minimum deposit ₹500/year, maximum ₹1.5 lakh/year. Interest
                rate: 7.1% per year for 1 July–30 September 2026, reviewed
                quarterly. Matures 15 complete financial years after the year
                you opened it, extendable afterward in 5-year blocks. Loans
                and partial withdrawals only under specific conditions.
              </p>
              <p>
                Your contribution can qualify for a tax deduction, but only
                within the overall ₹1.5 lakh Section 80C limit — shared
                across PPF, insurance premiums, EPF, and other eligible
                investments combined, not extra room on top. Available only
                under the old tax regime. Interest earned is tax-exempt
                under current rules.
              </p>
            </NoteCard>
            <NoteCard>
              <p className="font-semibold text-ink mb-1">Sukanya Samriddhi Account (SSY)</p>
              <p>
                Opened by a parent or guardian for a daughter under 10. You
                deposit for 15 years, and the account matures 21 years after
                opening. Annual deposits range from ₹250 to ₹1.5 lakh,
                currently earning 8.2% per year (1 July–30 September 2026),
                also reviewed quarterly. Withdrawals and early closure are
                restricted to specific situations. See the{" "}
                <Link href="/dashboard/wealth/schemes" className="underline text-gold-deep font-semibold">
                  Government Benefits &amp; Savings Directory
                </Link>{" "}
                for the full entry.
              </p>
            </NoteCard>
            <p className="text-sm text-ink/75 italic">
              These products may or may not be right for your household —
              this guide isn&apos;t telling you how much to put in either.
            </p>
          </Section>

          <Section title="Thinking about education costs, honestly">
            <p className="text-sm text-ink/75">
              Education 15–18 years from now will likely cost more than it
              does today — how much more depends on the institution, course,
              city or country, scholarships, how you finance it, and
              inflation. Nobody can tell you the exact number today. Instead
              of treating one forecast as certain:
            </p>
            <NumberedList
              items={[
                "Start with a present-day cost for the kind of education you're picturing.",
                "Work out more than one future scenario using different inflation assumptions.",
                "Decide how much of it you're aiming to fund — you don't have to plan for every possible cost.",
                "Revisit the estimate as your child grows and the picture gets clearer.",
                "Keep your own retirement and household security in view — your child's education shouldn't have to crowd out everything else.",
              ]}
            />
          </Section>

          <Section title="Get your basic financial paperwork in order">
            <p className="text-sm text-ink/75">Around the birth is a good time to check:</p>
            <BulletList
              items={[
                "Nominees on your bank, insurance, retirement, and investment accounts",
                "Beneficiary details wherever they apply",
                "Whether someone else could access your policy numbers, account details, and adviser/employer contacts in an emergency",
                "Who can pay household bills if one of you is hospitalised or unavailable",
                "Birth-certificate and insurance-enrolment deadlines",
                "A basic will and guardian arrangements — get legal advice if you need it",
                "Whether both partners understand the household's loans, insurance, and regular payments",
              ]}
            />
            <p className="text-sm text-ink/75">
              A nominee can receive or hold money through an account&apos;s
              process, but that doesn&apos;t always make them the final legal
              owner — for wills, succession, and guardianship, it&apos;s
              worth getting actual legal advice rather than relying on
              nomination forms alone. Never write passwords, PINs, or OTPs
              into a shared family document.
            </p>
          </Section>

          <Section title="Watch for pressure and scams">
            <p className="text-sm text-ink/75">
              Be cautious of anything sold to you using fear, guilt about
              your child&apos;s future, urgency, or promises of guaranteed
              high returns. Before you pay for or invest in anything:
            </p>
            <BulletList
              items={[
                "Verify the seller and any registration they claim, with the actual regulator",
                "Ask for the full product document, all charges, and the withdrawal or surrender terms",
                "Understand exactly where your money goes and when you can access it",
                "Never sign a blank form or share an OTP",
                "Don't borrow money just to buy an investment or insurance-plus-savings product",
                "Take your time comparing — a genuine long-term product shouldn't require an on-the-spot decision",
              ]}
            />
            <p className="text-sm text-ink/75 italic">
              No properly regulated investment professional will ever
              guarantee market-linked returns.
            </p>
          </Section>

          <NoteCard>
            <span className="font-semibold text-ink">When general education isn&apos;t enough anymore: </span>
            this guide can&apos;t tell you exactly how much to hold in cash,
            how much insurance you need, which debt to pay off first, or
            which investments fit your goals — because it doesn&apos;t know
            your numbers. When you want recommendations built around your
            income, debts, savings, goals, timeline, and comfort with risk,
            that&apos;s the point to consult a SEBI-registered Investment
            Adviser.
          </NoteCard>

          <SourceFooter>
            Checked July 2026 against IRDAI, the National Savings Institute,
            and SEBI. Rates, tax rules, and insurance terms change — dated
            figures (like PPF and SSY interest rates) get a fresh check
            before republishing, and on a regular schedule after that.
          </SourceFooter>
        </>
      )}
    </main>
  );
}
