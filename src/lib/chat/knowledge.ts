/**
 * knowledge.ts — the SFA Insurance assistant's knowledge base.
 *
 * Content is sourced from the live sfainsure.com site (mission, FAQ, products,
 * enrollment periods, agents, carriers, compliance) plus this demo's sections. The
 * local responder (respond.ts) matches a visitor's question to the best entry so the
 * widget is useful offline in MOCK_MODE. At go-live this same KB can be handed to a
 * real Claude endpoint (see respond.ts + VITE_CHAT_ENDPOINT) for free-form answers.
 */

export interface KbEntry {
  /** Lowercase trigger terms / phrases. Multi-word phrases score higher. */
  keywords: string[];
  answer: string;
}

export const GREETING =
  "Hi! I'm the SFA Insurance assistant. I can answer questions about Medicare plans, costs, enrollment dates, keeping your doctors, and more. What would you like to know?";

export const FALLBACK =
  "I can help with Medicare plans, costs, enrollment timing, keeping your doctors, dental/vision/hearing, and how we work. Could you rephrase that? Or speak with a licensed agent now at (833) 791-1800, or use the form on this page to request a call.";

/** One-tap starter questions shown under the greeting. */
export const QUICK_REPLIES = [
  'How much does it cost?',
  'When can I enroll?',
  'What plans do you offer?',
  'Can I keep my doctors?',
  'How does it work?',
];

export const KB: KbEntry[] = [
  {
    keywords: ['cost', 'free', 'pay', 'price', 'fee', 'charge', 'how much', 'expensive', 'afford'],
    answer:
      "Working with SFA Insurance Group is 100% free. Our licensed agents are paid directly by the insurance carriers, never by you, so there's no cost and no obligation to get help comparing plans or enrolling.",
  },
  {
    keywords: ['how does it work', 'how do you work', 'process', 'steps', 'get started', 'start', 'next step'],
    answer:
      "Three simple steps: 1) Talk with a licensed agent about your doctors, prescriptions, and budget. 2) We compare your Medicare options side by side. 3) You enroll with confidence, and we support you year-round with renewals and questions.",
  },
  {
    keywords: ['advantage', 'supplement', 'medigap', 'part c', 'difference', 'versus', ' vs '],
    answer:
      'Medicare Advantage (Part C) replaces Original Medicare with an all-in-one private plan that often includes prescription drugs, dental, and vision. A Medicare Supplement (Medigap) works alongside Original Medicare to help pay deductibles and out-of-pocket costs. A licensed agent can help you decide which fits you best.',
  },
  {
    keywords: ['prescription', 'drug', 'part d', 'medication', 'pharmacy', 'formulary', 'meds'],
    answer:
      "We check each plan's drug list (formulary) to make sure your prescriptions are covered before you enroll, and we also offer standalone Part D Prescription Drug Plans.",
  },
  {
    keywords: ['dental', 'vision', 'hearing', 'eye', 'teeth', 'glasses', 'dvh'],
    answer:
      'Yes. We offer Dental, Vision & Hearing coverage to enhance your Medicare plan and protect your smile, sight, and hearing at a price that fits your budget.',
  },
  {
    keywords: ['doctor', 'provider', 'network', 'keep my', 'physician', 'specialist'],
    answer:
      'Your care matters. Before you enroll, we verify your preferred doctors and prescriptions against each plan’s network so you can keep seeing the providers you trust, with no surprises later.',
  },
  {
    keywords: [
      'when can i enroll', 'enroll', 'sign up', 'deadline', 'october', 'december', 'enrollment period',
      'annual enrollment', 'aep', 'open enrollment', 'change my plan', 'change plans',
    ],
    answer:
      'Most people first enroll around age 65 (the Initial Enrollment Period). After that, you can review or change plans during the Annual Enrollment Period, October 15 to December 7, or during a Special Enrollment Period if you qualify.',
  },
  {
    keywords: ['eligible', 'eligibility', 'qualify', '65', 'turning', 'new to medicare', 'too young'],
    answer:
      "If you're turning 65 or already on Medicare, we can help, and a majority of people qualify for a monthly medical plan. Tell a licensed agent about your situation and we'll review your options at no cost.",
  },
  {
    keywords: ['agent', 'advisor', 'team', 'who are', 'mayra', 'clive', 'pamela', 'specialist', 'staff'],
    answer:
      'Our licensed advisors include Mayra Gutierrez, Clive Hughes, and Pamela Ginart, part of a team of 10+ experienced, certified Medicare agents who listen and explain every option clearly.',
  },
  {
    keywords: [
      'carrier', 'carriers', 'company', 'companies', 'aetna', 'anthem', 'humana', 'uhc',
      'unitedhealthcare', 'cigna', 'work with', 'which plans',
    ],
    answer:
      "We're partnered with top carriers including Aetna, Anthem, Cigna, UnitedHealthcare, Ambetter, Oscar, and Healthfirst, and we compare plans across them to find the right fit. (We don't offer every plan available in your area; information is limited to the plans we offer.)",
  },
  {
    keywords: [
      'call', 'phone', 'number', 'contact', 'reach', 'hours', 'open', 'speak', 'talk to',
      'appointment', 'book', 'schedule', 'callback',
    ],
    answer:
      "You can reach a licensed agent at (833) 791-1800, Monday to Friday, 9 AM to 5 PM EST. To book a time, click “Speak With a Specialist” at the top of the page and pick a slot on the calendar, or fill out the form and we'll call you back at your preferred time.",
  },
  {
    keywords: ['privacy', 'secure', 'security', 'hipaa', 'data', 'safe', 'protected', 'personal information'],
    answer:
      'Your information is encrypted and protected under HIPAA and applicable privacy laws. It is used only to help you find and enroll in the right plan, and it is never sold.',
  },
  {
    keywords: ['special needs', 'snp', 'chronic', 'dual', 'medicaid'],
    answer:
      'We also offer Special Needs Plans (SNPs), designed for people with specific chronic conditions or who qualify for both Medicare and Medicaid.',
  },
  {
    keywords: ['life insurance', 'final expense', 'burial', 'life'],
    answer:
      'Alongside Medicare, our agents can also help with life and final expense coverage. Ask a licensed agent and we’ll walk you through the options that fit your budget.',
  },
  {
    keywords: ['under 65', 'under-65', 'not 65', 'individual health', 'family health', 'before medicare'],
    answer:
      "Not yet on Medicare? We can help individuals and families under 65 find health coverage that fits. A licensed agent will walk you through your options.",
  },
  {
    keywords: ['obligation', 'pressure', 'pushy', 'commit', 'sales'],
    answer:
      'There is no obligation and no pressure. Our agents give clear, honest guidance so you can make a confident choice at your own pace.',
  },
  {
    keywords: ['about', 'mission', 'why choose', 'who are you', 'sfa', 'trust', 'reputation'],
    answer:
      'SFA Insurance Group is a team of independent, licensed agents on a mission to make Medicare simple, transparent, and stress-free, with personal attention and coverage that fits your health and budget.',
  },
  {
    keywords: ['rating', 'review', 'reviews', 'stars', 'rated', 'testimonial'],
    answer:
      "SFA Insurance Group is rated 4.9 out of 5 by the Medicare beneficiaries we've helped.",
  },
  {
    keywords: ['resource', 'pdf', 'guide', 'download', 'medicare 101', 'learn', 'understand'],
    answer:
      'We have helpful resources like a Medicare 101 guide and a New to Medicare overview, and a licensed agent can walk you through anything you would like to understand.',
  },
  {
    keywords: ['government', 'official', 'medicare.gov', 'affiliated', 'endorsed', 'federal'],
    answer:
      "SFA Insurance Group is a private, independent agency. We are not connected with or endorsed by the U.S. government or the federal Medicare program. For official information, visit Medicare.gov or call 1-800-MEDICARE.",
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    answer:
      "Hello! I'm happy to help. You can ask me about Medicare plans, costs, enrollment dates, keeping your doctors, or how SFA works, or call a licensed agent at (833) 791-1800.",
  },
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    answer:
      "You're welcome! If you'd like to speak with a licensed agent, call (833) 791-1800 or request a call using the form on this page.",
  },
];
