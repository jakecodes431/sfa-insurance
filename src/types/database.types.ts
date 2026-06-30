/**
 * database.types.ts — Supabase schema types.
 *
 * NOTE: In a live build these are generated via `supabase gen types typescript`
 * (or the MCP generate_typescript_types tool). Because this build uses placeholder
 * credentials and applies no migrations, these are hand-authored to EXACTLY match
 * the migrations in supabase/migrations/. Regenerate from the real project once it
 * exists (see WIRE-UP CHECKLIST) and overwrite this file.
 */

export type UserRole = 'customer' | 'staff' | 'admin';
export type BookingType = 'in_shop' | 'mobile' | 'roadside';
export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'en_route'
  | 'completed'
  | 'cancelled'
  | 'no_show';
export type PaymentStatus = 'none' | 'deposit_paid' | 'paid' | 'refunded' | 'failed';
export type PromoStatusDb = 'draft' | 'published' | 'archived';
export type LocaleDb = 'en' | 'es';
export type ServiceCategoryDb = 'in_shop' | 'mobile' | 'consultation';
export type ReviewSource = 'google' | 'facebook' | 'native';
export type TireCondition = 'new' | 'used';

/** SFA Insurance: the product line a lead is interested in. */
export type ProductLineDb =
  | 'medicare'
  | 'dental-vision'
  | 'life-final-expense'
  | 'under-65-health'
  | 'general';

/** SFA Insurance: lifecycle of a captured lead through the agency pipeline. */
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'booked'
  | 'enrolled'
  | 'closed_lost';

/** Consumer's preferred call-back window. */
export type CallWindow = 'anytime' | 'morning' | 'afternoon' | 'evening';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ---------------------------------------------------------------------------------------
// Shared ServiceFlowPro backend (project ekuzbozvnouexksthlfa). ADN runs as a tenant here,
// keyed by `organization_code`. Public reads go through SECURITY DEFINER RPCs (anon-safe,
// never expose cost_cents); authenticated staff writes hit the sfp_-prefixed tables (RLS
// scopes them via sfp_user_org_code()). src/lib/sfp.ts maps these to the app's Row types.
// ---------------------------------------------------------------------------------------

/** One in-stock tire from sfp_public_tire_search (cost_cents intentionally absent). */
export interface SfpPublicTireRow {
  id: string;
  brand: string;
  model_name: string;
  tire_size: string;
  width: number;
  aspect: number;
  diameter: number;
  condition: TireCondition;
  quantity: number;
  price_cents: number | null;
  tread_depth_32nds: number | null;
  dot_info: string | null;
  description: string | null;
  image_url: string | null;
  organization_code: string;
}

/** One service from sfp_public_services. */
export interface SfpPublicServiceRow {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  service_type: string;
  duration_minutes: number;
  price_cents: number;
  drop_in_price_cents: number | null;
  allow_online_booking: boolean;
  image_url: string | null;
  sort_order: number;
}

/** Invoice + line items as returned by sfp_public_tire_invoice (Stripe ids excluded). */
export interface SfpPublicInvoiceBundle {
  invoice: {
    id: string;
    organization_code: string;
    invoice_number: number;
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    status: InvoiceStatus;
    currency: string;
    subtotal_cents: number;
    tax_cents: number;
    total_cents: number;
    notes: string | null;
    due_date: string | null;
    hosted_pay_url: string | null;
    locale: LocaleDb;
    created_at: string;
  };
  items: InvoiceLineItemRow[];
}

/** One published review from sfp_public_reviews. */
export interface SfpPublicReview {
  id: string;
  author_name: string;
  rating: number;
  body: string | null;
  reply_text: string | null;
  created_at: string;
}

/** One published promotion from sfp_public_tire_promotions / _promotion. */
export interface SfpPublicPromotion {
  id: string;
  slug: string;
  title_en: string;
  title_es: string;
  body_en: string | null;
  body_es: string | null;
  image_url: string | null;
  status: PromoStatusDb;
  is_event: boolean;
  event_start: string | null;
  event_end: string | null;
  requires_registration: boolean;
  price_cents: number | null;
  capacity: number | null;
  published_at: string | null;
  created_at: string;
}

/** Tenant branding/config from sfp_public_tenant. */
export interface SfpPublicTenant {
  organization_code: string;
  business_type: string;
  display_name: string;
  slug: string;
  logo_url: string | null;
  hero_image_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  timezone: string;
  currency: string;
  branding_config: Json;
  feature_flags: Json;
  payment_required_at_booking: boolean;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          preferred_locale: LocaleDb;
          role: UserRole;
        };
        Insert: {
          id: string;
          created_at?: string;
          full_name?: string | null;
          email?: string | null;
          phone?: string | null;
          preferred_locale?: LocaleDb;
          role?: UserRole;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          profile_id: string;
          make: string | null;
          model: string | null;
          year: number | null;
          tire_size: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          make?: string | null;
          model?: string | null;
          year?: number | null;
          tire_size?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          slug: string;
          name_en: string;
          name_es: string;
          description_en: string | null;
          description_es: string | null;
          category: ServiceCategoryDb;
          bookable: boolean;
          deposit_cents: number;
          base_price_cents: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_en: string;
          name_es: string;
          description_en?: string | null;
          description_es?: string | null;
          category: ServiceCategoryDb;
          bookable?: boolean;
          deposit_cents?: number;
          base_price_cents?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
        Relationships: [];
      };
      leads: {
        Row: {
          id: string;
          tenant_id: string;
          profile_id: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          zip: string | null;
          product_line: ProductLineDb;
          message: string | null;
          best_time: CallWindow;
          /** Permission-to-contact (TPMO/CMS): consumer consented to be contacted. */
          consent_contact: boolean;
          /** Campaign / source / UTM tag for attribution. */
          source: string | null;
          status: LeadStatus;
          locale: LocaleDb;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          profile_id?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          zip?: string | null;
          product_line: ProductLineDb;
          message?: string | null;
          best_time?: CallWindow;
          consent_contact?: boolean;
          source?: string | null;
          status?: LeadStatus;
          locale?: LocaleDb;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          author_name: string;
          rating: number;
          body: string | null;
          source: ReviewSource;
          featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          rating: number;
          body?: string | null;
          source?: ReviewSource;
          featured?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          profile_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          booking_type: BookingType;
          service_slug: string;
          status: BookingStatus;
          scheduled_at: string | null;
          location_address: string | null;
          location_lat: number | null;
          location_lng: number | null;
          vehicle_info: Json | null;
          issue_description: string | null;
          locale: LocaleDb;
          payment_status: PaymentStatus;
          deposit_cents: number;
          stripe_payment_intent_id: string | null;
          calcom_booking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          booking_type: BookingType;
          service_slug: string;
          status?: BookingStatus;
          scheduled_at?: string | null;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          vehicle_info?: Json | null;
          issue_description?: string | null;
          locale?: LocaleDb;
          payment_status?: PaymentStatus;
          deposit_cents?: number;
          stripe_payment_intent_id?: string | null;
          calcom_booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          booking_id: string | null;
          promo_id: string | null;
          profile_id: string | null;
          amount_cents: number;
          currency: string;
          status: PaymentStatus;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          promo_id?: string | null;
          profile_id?: string | null;
          amount_cents: number;
          currency?: string;
          status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [];
      };
      promotions: {
        Row: {
          id: string;
          slug: string;
          title_en: string;
          title_es: string;
          body_en: string | null;
          body_es: string | null;
          image_url: string | null;
          status: PromoStatusDb;
          is_event: boolean;
          event_start: string | null;
          event_end: string | null;
          requires_registration: boolean;
          price_cents: number | null;
          capacity: number | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_en: string;
          title_es: string;
          body_en?: string | null;
          body_es?: string | null;
          image_url?: string | null;
          status?: PromoStatusDb;
          is_event?: boolean;
          event_start?: string | null;
          event_end?: string | null;
          requires_registration?: boolean;
          price_cents?: number | null;
          capacity?: number | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['promotions']['Insert']>;
        Relationships: [];
      };
      promo_registrations: {
        Row: {
          id: string;
          promo_id: string;
          profile_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          quantity: number;
          payment_status: PaymentStatus;
          stripe_payment_intent_id: string | null;
          locale: LocaleDb;
          created_at: string;
        };
        Insert: {
          id?: string;
          promo_id: string;
          profile_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          quantity?: number;
          payment_status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
          locale?: LocaleDb;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['promo_registrations']['Insert']>;
        Relationships: [];
      };
      automation_log: {
        Row: {
          id: string;
          event_type: string;
          payload: Json | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          payload?: Json | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['automation_log']['Insert']>;
        Relationships: [];
      };
      vehicle_catalog: {
        Row: { id: string; year: number; make: string; model: string };
        Insert: { id?: string; year: number; make: string; model: string };
        Update: Partial<Database['public']['Tables']['vehicle_catalog']['Insert']>;
        Relationships: [];
      };
      vehicle_tire_fitment: {
        Row: {
          id: string;
          vehicle_catalog_id: string;
          tire_size: string;
          is_oe: boolean;
          notes: string | null;
        };
        Insert: {
          id?: string;
          vehicle_catalog_id: string;
          tire_size: string;
          is_oe?: boolean;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['vehicle_tire_fitment']['Insert']>;
        Relationships: [];
      };
      tire_inventory: {
        Row: {
          id: string;
          tenant_id: string;
          brand: string;
          model_name: string;
          tire_size: string;
          width: number;
          aspect: number;
          diameter: number;
          condition: TireCondition;
          quantity: number;
          price_cents: number | null;
          cost_cents: number | null;
          tread_depth_32nds: number | null;
          dot_info: string | null;
          description: string | null;
          image_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          brand: string;
          model_name: string;
          tire_size: string;
          width: number;
          aspect: number;
          diameter: number;
          condition?: TireCondition;
          quantity?: number;
          price_cents?: number | null;
          cost_cents?: number | null;
          tread_depth_32nds?: number | null;
          dot_info?: string | null;
          description?: string | null;
          image_url?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tire_inventory']['Insert']>;
        Relationships: [];
      };
      tire_quote_requests: {
        Row: {
          id: string;
          tenant_id: string;
          profile_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          vehicle_catalog_id: string | null;
          entered_make: string | null;
          entered_model: string | null;
          entered_year: number | null;
          tire_size: string | null;
          selected_inventory_id: string | null;
          locale: LocaleDb;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          profile_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          vehicle_catalog_id?: string | null;
          entered_make?: string | null;
          entered_model?: string | null;
          entered_year?: number | null;
          tire_size?: string | null;
          selected_inventory_id?: string | null;
          locale?: LocaleDb;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tire_quote_requests']['Insert']>;
        Relationships: [];
      };
      service_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name_en: string;
          name_es: string;
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          name_en: string;
          name_es: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['service_categories']['Insert']>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          tenant_id: string;
          invoice_number: number;
          customer_profile_id: string | null;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          status: InvoiceStatus;
          currency: string;
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          notes: string | null;
          due_date: string | null;
          stripe_payment_intent_id: string | null;
          stripe_invoice_id: string | null;
          hosted_pay_url: string | null;
          locale: LocaleDb;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string;
          invoice_number?: number;
          customer_profile_id?: string | null;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          status?: InvoiceStatus;
          currency?: string;
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          notes?: string | null;
          due_date?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_invoice_id?: string | null;
          hosted_pay_url?: string | null;
          locale?: LocaleDb;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
        Relationships: [];
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price_cents: number;
          amount_cents: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price_cents?: number;
          amount_cents?: number;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['invoice_line_items']['Insert']>;
        Relationships: [];
      };
      // --- shared SFP backend (organization_code tenancy) ---
      sfp_tire_inventory: {
        Row: {
          id: string;
          organization_code: string;
          brand: string;
          model_name: string;
          tire_size: string;
          width: number;
          aspect: number;
          diameter: number;
          condition: TireCondition;
          quantity: number;
          price_cents: number | null;
          cost_cents: number | null;
          tread_depth_32nds: number | null;
          dot_info: string | null;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          brand: string;
          model_name: string;
          tire_size: string;
          width: number;
          aspect: number;
          diameter: number;
          condition?: TireCondition;
          quantity?: number;
          price_cents?: number | null;
          cost_cents?: number | null;
          tread_depth_32nds?: number | null;
          dot_info?: string | null;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_inventory']['Insert']>;
        Relationships: [];
      };
      sfp_service_categories: {
        Row: {
          id: string;
          organization_code: string;
          name: string;
          description: string | null;
          color: string;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          name: string;
          description?: string | null;
          color?: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: Partial<Database['public']['Tables']['sfp_service_categories']['Insert']>;
        Relationships: [];
      };
      sfp_tire_bookings: {
        Row: {
          id: string;
          organization_code: string;
          client_auth_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          booking_type: BookingType;
          service_slug: string;
          status: BookingStatus;
          scheduled_at: string | null;
          location_address: string | null;
          location_lat: number | null;
          location_lng: number | null;
          vehicle_info: Json | null;
          issue_description: string | null;
          locale: LocaleDb;
          payment_status: PaymentStatus;
          deposit_cents: number;
          stripe_payment_intent_id: string | null;
          calcom_booking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          client_auth_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          booking_type: BookingType;
          service_slug: string;
          status?: BookingStatus;
          scheduled_at?: string | null;
          location_address?: string | null;
          location_lat?: number | null;
          location_lng?: number | null;
          vehicle_info?: Json | null;
          issue_description?: string | null;
          locale?: LocaleDb;
          payment_status?: PaymentStatus;
          deposit_cents?: number;
          stripe_payment_intent_id?: string | null;
          calcom_booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_bookings']['Insert']>;
        Relationships: [];
      };
      sfp_tire_orders: {
        Row: {
          id: string;
          organization_code: string;
          booking_id: string | null;
          promo_id: string | null;
          client_auth_id: string | null;
          amount_cents: number;
          currency: string;
          status: PaymentStatus;
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          booking_id?: string | null;
          promo_id?: string | null;
          client_auth_id?: string | null;
          amount_cents: number;
          currency?: string;
          status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_orders']['Insert']>;
        Relationships: [];
      };
      sfp_tire_invoices: {
        Row: {
          id: string;
          organization_code: string;
          invoice_number: number;
          customer_auth_id: string | null;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string | null;
          status: InvoiceStatus;
          currency: string;
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          notes: string | null;
          due_date: string | null;
          stripe_payment_intent_id: string | null;
          stripe_invoice_id: string | null;
          hosted_pay_url: string | null;
          locale: LocaleDb;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          invoice_number?: number;
          customer_auth_id?: string | null;
          customer_name: string;
          customer_email?: string | null;
          customer_phone?: string | null;
          status?: InvoiceStatus;
          currency?: string;
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          notes?: string | null;
          due_date?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_invoice_id?: string | null;
          hosted_pay_url?: string | null;
          locale?: LocaleDb;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_invoices']['Insert']>;
        Relationships: [];
      };
      sfp_tire_invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          unit_price_cents: number;
          amount_cents: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number;
          unit_price_cents?: number;
          amount_cents?: number;
          sort_order?: number;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_invoice_line_items']['Insert']>;
        Relationships: [];
      };
      sfp_tire_promotions: {
        Row: {
          id: string;
          organization_code: string;
          slug: string;
          title_en: string;
          title_es: string;
          body_en: string | null;
          body_es: string | null;
          image_url: string | null;
          status: PromoStatusDb;
          is_event: boolean;
          event_start: string | null;
          event_end: string | null;
          requires_registration: boolean;
          price_cents: number | null;
          capacity: number | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          slug: string;
          title_en: string;
          title_es: string;
          body_en?: string | null;
          body_es?: string | null;
          image_url?: string | null;
          status?: PromoStatusDb;
          is_event?: boolean;
          event_start?: string | null;
          event_end?: string | null;
          requires_registration?: boolean;
          price_cents?: number | null;
          capacity?: number | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_promotions']['Insert']>;
        Relationships: [];
      };
      sfp_tire_promo_registrations: {
        Row: {
          id: string;
          organization_code: string;
          promo_id: string;
          client_auth_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          quantity: number;
          payment_status: PaymentStatus;
          stripe_payment_intent_id: string | null;
          locale: LocaleDb;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          promo_id: string;
          client_auth_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          quantity?: number;
          payment_status?: PaymentStatus;
          stripe_payment_intent_id?: string | null;
          locale?: LocaleDb;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_promo_registrations']['Insert']>;
        Relationships: [];
      };
      sfp_tire_content_blocks: {
        Row: {
          id: string;
          organization_code: string;
          key: string;
          label: string;
          value: string | null;
          block_type: 'text' | 'html' | 'image_url' | 'number' | 'boolean';
          group_name: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          key: string;
          label: string;
          value?: string | null;
          block_type?: 'text' | 'html' | 'image_url' | 'number' | 'boolean';
          group_name?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_content_blocks']['Insert']>;
        Relationships: [];
      };
      sfp_tire_vehicle_catalog: {
        Row: {
          id: string;
          organization_code: string;
          make: string;
          model: string;
          tire_size: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          make: string;
          model: string;
          tire_size: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_tire_vehicle_catalog']['Insert']>;
        Relationships: [];
      };
      sfp_reviews: {
        Row: {
          id: string;
          organization_code: string;
          client_name: string;
          client_email: string;
          rating: number;
          body: string | null;
          is_published: boolean;
          is_flagged: boolean;
          reply_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          client_name: string;
          client_email: string;
          rating: number;
          body?: string | null;
          is_published?: boolean;
          is_flagged?: boolean;
          reply_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_reviews']['Insert']>;
        Relationships: [];
      };
      // SFA Insurance lead capture (org-scoped, RLS by sfp_user_org_code()).
      sfp_ins_leads: {
        Row: {
          id: string;
          organization_code: string;
          name: string;
          email: string;
          phone: string | null;
          zip: string | null;
          product_line: string;
          best_time: string | null;
          message: string | null;
          consent_contact: boolean;
          status: string;
          source: string;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_code: string;
          name: string;
          email: string;
          phone?: string | null;
          zip?: string | null;
          product_line?: string;
          best_time?: string | null;
          message?: string | null;
          consent_contact?: boolean;
          status?: string;
          source?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['sfp_ins_leads']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_staff: { Args: Record<string, never>; Returns: boolean };
      sfp_public_tenant: { Args: { p_org: string }; Returns: SfpPublicTenant | null };
      sfp_public_services: { Args: { p_org: string }; Returns: SfpPublicServiceRow[] };
      sfp_public_tire_search: {
        Args: {
          p_org: string;
          p_width?: number | null;
          p_aspect?: number | null;
          p_diameter?: number | null;
          p_brand?: string | null;
        };
        Returns: SfpPublicTireRow[];
      };
      sfp_public_log_tire_quote: {
        Args: {
          p_org: string;
          p_name?: string | null;
          p_email?: string | null;
          p_phone?: string | null;
          p_make?: string | null;
          p_model?: string | null;
          p_year?: number | null;
          p_tire_size?: string | null;
          p_selected_inventory_id?: string | null;
          p_locale?: string;
        };
        Returns: string;
      };
      sfp_public_create_tire_booking: {
        Args: {
          p_org: string;
          p_booking_type: string;
          p_service_slug: string;
          p_name: string;
          p_email: string;
          p_phone?: string | null;
          p_scheduled_at?: string | null;
          p_location_address?: string | null;
          p_location_lat?: number | null;
          p_location_lng?: number | null;
          p_vehicle_info?: Json | null;
          p_issue_description?: string | null;
          p_locale?: string;
          p_deposit_cents?: number;
          p_calcom_booking_id?: string | null;
        };
        Returns: string;
      };
      sfp_public_tire_invoice: {
        Args: { p_id: string };
        Returns: SfpPublicInvoiceBundle | null;
      };
      sfp_public_reviews: { Args: { p_org: string }; Returns: SfpPublicReview[] };
      sfp_public_create_review: {
        Args: { p_org: string; p_name: string; p_rating: number; p_body?: string | null; p_email?: string | null };
        Returns: string;
      };
      sfp_public_tire_promotions: { Args: { p_org: string }; Returns: SfpPublicPromotion[] };
      sfp_public_tire_promotion: {
        Args: { p_org: string; p_slug: string };
        Returns: SfpPublicPromotion | null;
      };
      sfp_public_create_promo_registration: {
        Args: {
          p_org: string;
          p_promo_id: string;
          p_name: string;
          p_email: string;
          p_phone?: string | null;
          p_quantity?: number;
          p_locale?: string;
        };
        Returns: string;
      };
      sfp_public_create_ins_lead: {
        Args: {
          p_org: string;
          p_name: string;
          p_email: string;
          p_phone?: string | null;
          p_zip?: string | null;
          p_product_line?: string;
          p_best_time?: string | null;
          p_message?: string | null;
          p_consent_contact?: boolean;
          p_locale?: string;
        };
        Returns: string;
      };
      sfp_public_tire_content: { Args: { p_org: string }; Returns: Record<string, string | null> };
      sfp_public_vehicle_catalog: {
        Args: { p_org: string };
        Returns: { make: string; model: string; tire_size: string }[];
      };
    };
    Enums: {
      user_role: UserRole;
      booking_type: BookingType;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      promo_status: PromoStatusDb;
      locale: LocaleDb;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row aliases used throughout the app.
export type LeadRow = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
export type ServiceRow = Database['public']['Tables']['services']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type PromotionRow = Database['public']['Tables']['promotions']['Row'];
export type PromotionInsert = Database['public']['Tables']['promotions']['Insert'];
export type PromoRegistrationRow = Database['public']['Tables']['promo_registrations']['Row'];
export type PromoRegistrationInsert =
  Database['public']['Tables']['promo_registrations']['Insert'];
export type AutomationLogRow = Database['public']['Tables']['automation_log']['Row'];
export type VehicleCatalogRow = Database['public']['Tables']['vehicle_catalog']['Row'];
export type FitmentRow = Database['public']['Tables']['vehicle_tire_fitment']['Row'];
export type TireInventoryRow = Database['public']['Tables']['tire_inventory']['Row'];
export type TireInventoryInsert = Database['public']['Tables']['tire_inventory']['Insert'];
export type TireQuoteRequestRow = Database['public']['Tables']['tire_quote_requests']['Row'];
export type TireQuoteRequestInsert =
  Database['public']['Tables']['tire_quote_requests']['Insert'];
export type ServiceCategoryRow = Database['public']['Tables']['service_categories']['Row'];
export type ServiceCategoryInsert = Database['public']['Tables']['service_categories']['Insert'];
export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceLineItemRow = Database['public']['Tables']['invoice_line_items']['Row'];
export type InvoiceLineItemInsert = Database['public']['Tables']['invoice_line_items']['Insert'];

// Shared SFP backend aliases.
export type SfpInsLeadRow = Database['public']['Tables']['sfp_ins_leads']['Row'];
export type SfpInsLeadInsert = Database['public']['Tables']['sfp_ins_leads']['Insert'];
export type SfpTireInventoryRow = Database['public']['Tables']['sfp_tire_inventory']['Row'];
export type SfpTireInventoryInsert =
  Database['public']['Tables']['sfp_tire_inventory']['Insert'];
export type SfpServiceCategoryRow =
  Database['public']['Tables']['sfp_service_categories']['Row'];
export type SfpServiceCategoryInsert =
  Database['public']['Tables']['sfp_service_categories']['Insert'];
export type SfpTireBookingRow = Database['public']['Tables']['sfp_tire_bookings']['Row'];
export type SfpTireBookingInsert = Database['public']['Tables']['sfp_tire_bookings']['Insert'];
export type SfpTireOrderRow = Database['public']['Tables']['sfp_tire_orders']['Row'];
export type SfpTireInvoiceRow = Database['public']['Tables']['sfp_tire_invoices']['Row'];
export type SfpTireInvoiceInsert = Database['public']['Tables']['sfp_tire_invoices']['Insert'];
export type SfpTireInvoiceLineItemRow =
  Database['public']['Tables']['sfp_tire_invoice_line_items']['Row'];
export type SfpTirePromotionRow = Database['public']['Tables']['sfp_tire_promotions']['Row'];
export type SfpTirePromotionInsert =
  Database['public']['Tables']['sfp_tire_promotions']['Insert'];
export type SfpTirePromoRegistrationRow =
  Database['public']['Tables']['sfp_tire_promo_registrations']['Row'];
export type SfpTireContentBlockRow =
  Database['public']['Tables']['sfp_tire_content_blocks']['Row'];
export type SfpTireContentBlockInsert =
  Database['public']['Tables']['sfp_tire_content_blocks']['Insert'];
