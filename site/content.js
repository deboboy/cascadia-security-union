/**
 * Cascadia Security Leadership Council — site content
 *
 * Edit this file to change what the site says.
 * Leave structure (arrays, keys) intact; only change the string values
 * unless you are adding/removing list items.
 */
window.SITE_CONTENT = {
  meta: {
    title: "Cascadia Security Leadership Council",
    description:
      "A Seattle-area peer community for nonprofit leaders building strategies and operational playbooks for current and future cybersecurity threats.",
    url: "https://www.cascadiasecurity.org/",
    image: "https://www.cascadiasecurity.org/og-image.png",
    imageAlt:
      "Cascadia Security Leadership Council — nonprofit cybersecurity strategies and playbooks",
  },

  header: {
    eyebrow: "Seattle + Online · Nonprofit Focus",
    title: "Cascadia Security Leadership Council",
    lede:
      "A peer community that organizes nonprofit leaders to develop strategies and operational playbooks for the cybersecurity threats nonprofits face today—and the ones coming next.",
    primaryCta: { label: "Request Founding Invite", href: "#invite" },
    secondaryCta: { label: "View Program Model", href: "#program" },
  },

  value: {
    title: "Why this community exists",
    items: [
      {
        title: "Built for nonprofit realities",
        body: "Nonprofits face the same threat landscape as enterprises, often with leaner teams, tighter budgets, and mission-critical data about vulnerable communities. This council is designed around those constraints—not enterprise playbooks that do not fit.",
      },
      {
        title: "Strategies and playbooks, not theory",
        body: "Members work together to produce usable strategies and operational playbooks: incident response, ransomware readiness, vendor risk, board communication, and more—ready to adapt inside your organization.",
      },
      {
        title: "Peer-first, vendor-free core",
        body: "A private leadership setting for candid discussion of real threats and tradeoffs. No sales decks or product pitches in core sessions.",
      },
      {
        title: "Blended format by design",
        body: "Monthly Seattle-area roundtables paired with online working sessions so leaders can stay engaged between in-person meetings and respond quickly when threats escalate.",
      },
    ],
  },

  program: {
    title: "Program rhythm",
    items: [
      {
        title: "Monthly In-Person Roundtable",
        body: "90-minute peer discussion for nonprofit leaders, hosted across Seattle, Bellevue, and Redmond—focused on live threats and strategy choices.",
      },
      {
        title: "Monthly Online Working Session",
        body: "60-minute briefing and playbook build: peer exchange, rapid response to emerging threats, and shared operational templates.",
      },
      {
        title: "Quarterly Playbook Deep Dive",
        body: "3-hour scenario workshop where members stress-test and refine operational playbooks for high-priority threat scenarios.",
      },
      {
        title: "Annual Strategy Summit",
        body: "In-person summit to set regional priorities, publish shared playbook updates, and plan for the next year's threat landscape.",
      },
    ],
  },

  themes: {
    title: "Year-one focus areas",
    items: [
      "Ransomware readiness for resource-constrained teams",
      "Protecting sensitive beneficiary and donor data",
      "Board and funder communication on cyber risk",
      "Incident response playbooks nonprofits can actually run",
      "Vendor and cloud risk without a large security staff",
      "AI tools, fraud, and emerging threat preparedness",
    ],
  },

  apply: {
    title: "Founding member criteria",
    criteria: [
      "Executive, operations, IT, or security leader at a nonprofit organization",
      "Accountability for cybersecurity outcomes, resilience, or critical systems",
      "Willingness to co-develop strategies and operational playbooks with peers",
      "Commitment to confidentiality and active participation in-person and online",
    ],
    cohortNote: "Founding cohort target: 20-30 nonprofit leaders.",
  },

  invite: {
    title: "Request a founding invite",
    lede: "Share a few details and we will follow up with next steps for the founding cohort.",
    fields: {
      name: "Full name",
      email: "Work email",
      organization: "Nonprofit / organization",
      role: "Role / title",
      notes: "What cybersecurity challenges are most pressing for your organization? (optional)",
      challenge: "Quick check (helps reduce spam)",
    },
    submitLabel: "Submit request",
    successMessage: "Thanks — your request was received. We will be in touch soon.",
    errorMessage: "Something went wrong sending your request. Please try again in a moment.",
    sessionErrorMessage: "Could not prepare the form. Please refresh and try again.",
  },

  faq: {
    title: "FAQ",
    items: [
      {
        question: "Who is this for?",
        answer:
          "Nonprofit executives and leaders responsible for cybersecurity, IT, operations, or organizational resilience—especially those navigating threats without enterprise-scale security teams.",
      },
      {
        question: "Is this a vendor-sponsored community?",
        answer:
          "Sponsorship can support logistics, but sponsors do not control membership, agenda, or peer sessions. Core work stays focused on peer strategies and playbooks.",
      },
      {
        question: "What do members walk away with?",
        answer:
          "Shared strategies and operational playbooks tailored to nonprofit constraints—plus peer relationships for when real incidents and hard decisions arrive.",
      },
      {
        question: "What confidentiality model do you use?",
        answer:
          "Chatham House Rule applies by default, with no recording unless explicitly approved.",
      },
    ],
  },

  footer: {
    text: "A Seattle-area community for nonprofit leaders building cybersecurity strategies and operational playbooks.",
  },
};
