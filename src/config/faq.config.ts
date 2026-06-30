/**
 * faq.config.ts — landing-page FAQ content for SFA Insurance Group.
 * Accurate, compliant (CMS/TPMO), plain language, no em dashes. Also feeds FAQPage
 * structured data for SEO (see FaqSection).
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const faqs: FaqItem[] = [
  {
    q: 'What is the difference between Medicare Advantage and Medicare Supplement?',
    a: 'Medicare Advantage (Part C) bundles your hospital, medical, and usually prescription coverage into one plan from a private carrier, often with extras like dental or vision and a low or $0 premium. A Medicare Supplement (Medigap) plan works alongside Original Medicare and helps pay the out-of-pocket costs it leaves behind, with wider doctor choice but a separate monthly premium. A licensed agent can show you which one fits your doctors, prescriptions, and budget.',
  },
  {
    q: 'Is there any cost to work with SFA Insurance Group?',
    a: 'No. Our help is always free. Licensed agents are paid directly by the insurance carriers, never by you, so comparing plans, enrolling, and yearly check-ins cost you nothing and never raise your premium.',
  },
  {
    q: 'When can I enroll or change my Medicare plan?',
    a: 'Most changes happen during the Annual Enrollment Period, October 15 to December 7. You may also qualify for a Special Enrollment Period after certain life events, such as moving, losing other coverage, or turning 65. We can check which window applies to you.',
  },
  {
    q: 'Will changing my plan affect my doctors or prescriptions?',
    a: 'It can, which is why we check first. Before you switch, a licensed agent confirms your doctors are in the new plan network and your prescriptions are covered, so there are no surprises after you enroll.',
  },
  {
    q: 'How does SFA keep my information secure?',
    a: 'Your information is kept private and used only to help you review and enroll in coverage. We follow HIPAA and TCPA requirements and never sell your information to anyone.',
  },
  {
    q: 'Are you connected with Medicare or the federal government?',
    a: 'No. SFA Insurance Group is an independent, licensed insurance agency. We are not connected with or endorsed by the U.S. Government or the federal Medicare program. We do not offer every plan available in your area, and the information we provide is limited to the plans we offer.',
  },
];
