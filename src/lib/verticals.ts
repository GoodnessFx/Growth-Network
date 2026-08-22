/**
 * Vertical configuration system.
 * Adding a 5th vertical is a data change here — no page rewrites needed.
 * Pages import `getVertical(industry)` and use the returned config for
 * terminology, CRM field labels, and default module visibility.
 */

export type VerticalId = 'generic' | 'law' | 'clinic' | 'school'

export interface VerticalConfig {
  id: VerticalId
  label: string
  /** Plural noun for the people the business serves */
  contactsNoun: string
  /** Singular */
  contactNoun: string
  /** What a new relationship is called at first contact */
  leadNoun: string
  /** What a closed/active relationship is called */
  clientNoun: string
  /** What a revenue-generating unit is called */
  dealNoun: string
  /** Label for the pipeline/funnel */
  pipelineLabel: string
  /** CRM column headers: [name, identifier, stage, value] */
  crmColumns: [string, string, string, string]
  /** Compliance module label (null = not applicable) */
  complianceLabel: string | null
  /** Suggested pipeline stages */
  stages: string[]
  /** Industry icon name (lucide) */
  icon: string
  /** Example KPIs shown on overview */
  kpis: Array<{ label: string; key: string }>
  /** Compliance deadline types */
  deadlineTypes: string[]
}

export const VERTICALS: Record<VerticalId, VerticalConfig> = {
  generic: {
    id: 'generic',
    label: 'Generic SME',
    contactsNoun: 'Customers',
    contactNoun: 'Customer',
    leadNoun: 'Lead',
    clientNoun: 'Client',
    dealNoun: 'Deal',
    pipelineLabel: 'Sales Pipeline',
    crmColumns: ['Name', 'Phone / Email', 'Stage', 'Value'],
    complianceLabel: null,
    stages: ['New Lead', 'Contacted', 'Proposal Sent', 'Negotiating', 'Closed Won', 'Closed Lost'],
    icon: 'Building2',
    kpis: [
      { label: 'Revenue MTD', key: 'revenue_mtd' },
      { label: 'Active Clients', key: 'active_clients' },
      { label: 'Open Leads', key: 'open_leads' },
      { label: 'Pipeline Value', key: 'pipeline_value' },
    ],
    deadlineTypes: ['Tax filing', 'License renewal', 'Insurance renewal', 'Annual return'],
  },
  law: {
    id: 'law',
    label: 'Law Firm',
    contactsNoun: 'Clients',
    contactNoun: 'Client',
    leadNoun: 'Enquiry',
    clientNoun: 'Client',
    dealNoun: 'Matter',
    pipelineLabel: 'Matters Pipeline',
    crmColumns: ['Client Name', 'Matter / Case Ref', 'Stage', 'Retainer Value'],
    complianceLabel: 'Court Deadlines & Filings',
    stages: ['Enquiry', 'Conflict Check', 'Engagement Letter', 'Active Matter', 'Judgment / Settlement', 'Closed'],
    icon: 'Scale',
    kpis: [
      { label: 'Retainer Revenue', key: 'revenue_mtd' },
      { label: 'Active Matters', key: 'active_clients' },
      { label: 'New Enquiries', key: 'open_leads' },
      { label: 'Unbilled Hours', key: 'pipeline_value' },
    ],
    deadlineTypes: ['Court filing', 'Statute of limitations', 'Discovery deadline', 'Appeal window', 'Retainer review', 'Bar association CPD'],
  },
  clinic: {
    id: 'clinic',
    label: 'Clinic / Hospital',
    contactsNoun: 'Patients',
    contactNoun: 'Patient',
    leadNoun: 'New Patient',
    clientNoun: 'Patient',
    dealNoun: 'Appointment',
    pipelineLabel: 'Appointment Pipeline',
    crmColumns: ['Patient Name', 'Patient ID / Phone', 'Status', 'Outstanding Balance'],
    complianceLabel: 'Licences & Accreditations',
    stages: ['Enquiry', 'Registration', 'Booked', 'Attended', 'Follow-up Due', 'Discharged'],
    icon: 'Stethoscope',
    kpis: [
      { label: 'Revenue MTD', key: 'revenue_mtd' },
      { label: 'Active Patients', key: 'active_clients' },
      { label: 'New Registrations', key: 'open_leads' },
      { label: 'Outstanding Bills', key: 'pipeline_value' },
    ],
    deadlineTypes: ['NAFDAC licence renewal', 'Medical board registration', 'Practitioner licence', 'Insurance accreditation', 'Health & safety audit', 'Equipment calibration'],
  },
  school: {
    id: 'school',
    label: 'School / University',
    contactsNoun: 'Students',
    contactNoun: 'Student',
    leadNoun: 'Applicant',
    clientNoun: 'Enrolled Student',
    dealNoun: 'Enrolment',
    pipelineLabel: 'Enrolment Pipeline',
    crmColumns: ['Student Name', 'Parent Contact', 'Status', 'Fee Balance'],
    complianceLabel: 'Accreditation & Exam Cycles',
    stages: ['Enquiry', 'Application', 'Offer Made', 'Enrolled', 'Active', 'Alumni'],
    icon: 'GraduationCap',
    kpis: [
      { label: 'Fee Revenue MTD', key: 'revenue_mtd' },
      { label: 'Enrolled Students', key: 'active_clients' },
      { label: 'Applications', key: 'open_leads' },
      { label: 'Outstanding Fees', key: 'pipeline_value' },
    ],
    deadlineTypes: ['Ministry accreditation renewal', 'Exam board registration', 'WAEC/NECO registration', 'School calendar deadline', 'Staff certification renewal', 'Fire safety inspection'],
  },
}

/** Returns the vertical config for a business type string. Falls back to generic. */
export function getVertical(industryOrType?: string | null): VerticalConfig {
  if (!industryOrType) return VERTICALS.generic
  const t = industryOrType.toLowerCase()
  if (t.includes('law') || t.includes('legal') || t.includes('solicitor') || t.includes('barrister')) return VERTICALS.law
  if (t.includes('clinic') || t.includes('hospital') || t.includes('health') || t.includes('medical') || t.includes('pharma')) return VERTICALS.clinic
  if (t.includes('school') || t.includes('university') || t.includes('college') || t.includes('academ') || t.includes('education')) return VERTICALS.school
  return VERTICALS.generic
}

export const VERTICAL_OPTIONS: Array<{ value: VerticalId; label: string }> = [
  { value: 'generic', label: 'Generic SME' },
  { value: 'law',     label: 'Law Firm' },
  { value: 'clinic',  label: 'Clinic / Hospital' },
  { value: 'school',  label: 'School / University' },
]
