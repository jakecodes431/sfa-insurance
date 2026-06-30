/**
 * automations.config.ts — the automated email (Resend) + SMS (Twilio) follow-up sequences
 * for SFA Insurance Group, shown in the admin Automations tab. Each runs off a lead event or
 * a status change in the pipeline. Copy is TCPA/CMS-aware (SMS carries opt-out language; these
 * fire only for leads who consented to contact). Live sending wires to the client's Resend +
 * Twilio in the real build; this config drives the demo view.
 *
 * Merge fields in previews: {first} = lead first name, {time} = appointment time.
 */
export type Channel = 'email' | 'sms';

export interface AutomationStep {
  channel: Channel;
  /** Email subject (omitted for SMS). */
  subject?: string;
  /** Short preview of the message body. */
  preview: string;
}

export interface Automation {
  id: string;
  name: string;
  /** Human-readable trigger. */
  trigger: string;
  /** When it fires after the trigger. */
  timing: string;
  enabled: boolean;
  steps: AutomationStep[];
}

export const automations: Automation[] = [
  {
    id: 'new-lead-welcome',
    name: 'New lead welcome',
    trigger: 'Lead captured (status: New)',
    timing: 'Immediately',
    enabled: true,
    steps: [
      {
        channel: 'sms',
        preview:
          'Hi {first}, thanks for reaching out to SFA Insurance Group. A licensed agent will call you shortly to go over your options. Reply STOP to opt out.',
      },
      {
        channel: 'email',
        subject: 'Your no-cost Medicare plan review',
        preview:
          'Welcome to SFA. Here is what to expect from your free, no-pressure plan review, plus how to reach a licensed agent.',
      },
    ],
  },
  {
    id: 'no-response-followup',
    name: 'No-response follow-up',
    trigger: 'Still New after 24 hours',
    timing: '24 hours later',
    enabled: true,
    steps: [
      {
        channel: 'sms',
        preview:
          'Hi {first}, just checking in. Whenever you are ready to compare Medicare plans, we are here. Call (833) 791-1800. Reply STOP to opt out.',
      },
    ],
  },
  {
    id: 'appointment-confirmation',
    name: 'Appointment confirmation',
    trigger: 'Status changed to Appointment Set',
    timing: 'Immediately',
    enabled: true,
    steps: [
      {
        channel: 'email',
        subject: 'Your appointment is confirmed',
        preview:
          'We have your call scheduled for {time}. Here is how to prepare and what your licensed agent will cover.',
      },
    ],
  },
  {
    id: 'appointment-reminder',
    name: 'Appointment reminder',
    trigger: 'Upcoming appointment',
    timing: '1 day before',
    enabled: true,
    steps: [
      {
        channel: 'sms',
        preview:
          'Reminder: your call with a licensed SFA agent is tomorrow at {time}. Reply STOP to opt out.',
      },
    ],
  },
  {
    id: 'quote-followup',
    name: 'Quote follow-up',
    trigger: 'Status changed to Quoted',
    timing: 'Immediately',
    enabled: true,
    steps: [
      {
        channel: 'email',
        subject: 'Your plan options and next steps',
        preview:
          'A recap of the plans we compared, what each covers, and the simple next step to enroll when you are ready.',
      },
    ],
  },
  {
    id: 'enrollment-welcome',
    name: 'Enrollment welcome',
    trigger: 'Status changed to Enrolled',
    timing: 'Immediately',
    enabled: true,
    steps: [
      {
        channel: 'email',
        subject: 'You are enrolled: what happens next',
        preview:
          'Congratulations on your new plan. Here is your coverage summary, key dates, and how to reach us all year.',
      },
      {
        channel: 'sms',
        preview:
          'Welcome to SFA, {first}! Your enrollment is in progress and we will be in touch with next steps. Reply STOP to opt out.',
      },
    ],
  },
  {
    id: 'aep-annual-review',
    name: 'Annual review (AEP)',
    trigger: 'Annual Enrollment opens',
    timing: 'Seasonal: Oct 15',
    enabled: false,
    steps: [
      {
        channel: 'email',
        subject: 'Medicare Annual Enrollment is open',
        preview:
          'It is time for your yearly plan review. Plans change every year, so let us make sure yours still fits before December 7.',
      },
    ],
  },
];

export interface AutomationLogEntry {
  id: string;
  channel: Channel;
  /** Which sequence sent it. */
  automation: string;
  /** Recipient (name + masked contact). */
  to: string;
  at: string; // ISO
  status: 'sent' | 'delivered' | 'opened';
}

/** Sample recent activity for the demo (mirrors the seeded leads/appointments). */
export const automationLog: AutomationLogEntry[] = [
  { id: 'al-1', channel: 'sms', automation: 'New lead welcome', to: 'Robert Alvarez · (815) •••-0142', at: '2026-06-30T13:41:00.000Z', status: 'delivered' },
  { id: 'al-2', channel: 'email', automation: 'New lead welcome', to: 'Robert Alvarez · r.a•••@example.com', at: '2026-06-30T13:41:00.000Z', status: 'opened' },
  { id: 'al-3', channel: 'sms', automation: 'Appointment reminder', to: 'Marcus Hill · (248) •••-0176', at: '2026-06-30T09:00:00.000Z', status: 'delivered' },
  { id: 'al-4', channel: 'email', automation: 'Enrollment welcome', to: 'Maria Santos · m.s•••@example.com', at: '2026-06-29T16:20:00.000Z', status: 'opened' },
  { id: 'al-5', channel: 'sms', automation: 'No-response follow-up', to: 'Diane Whitfield · (248) •••-0188', at: '2026-06-29T14:05:00.000Z', status: 'delivered' },
  { id: 'al-6', channel: 'email', automation: 'Appointment confirmation', to: 'Rosa Delgado · r.d•••@example.com', at: '2026-06-26T17:02:00.000Z', status: 'sent' },
];
