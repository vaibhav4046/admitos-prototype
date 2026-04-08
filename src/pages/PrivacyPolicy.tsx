import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "intro",
    title: "1. Introduction & Data Controller",
    content: `This Privacy Policy explains how Admitos Limited ("Admitos", "we", "us", "our") collects, uses, stores, and protects personal data in connection with the AdmitOS platform ("Platform") and associated services ("Services").

Data Controller: Admitos Limited
Contact: privacy@admitos.ai
UK ICO Registration: [Registration number]
Full Policy: admitos.ai/privacy

This Privacy Policy is incorporated into and forms part of Admitos's Terms of Service. By using the Platform or Services, you confirm that you have read and understood this Policy.

Admitos complies with the UK General Data Protection Regulation (UK GDPR) as retained in UK law by the European Union (Withdrawal) Act 2018, the Data Protection Act 2018, and all other applicable data protection legislation in any jurisdiction in which the Services are delivered.

Where a Data Processing Addendum (DPA) is required (for example, in connection with a School partnership), it will be entered into separately by the relevant Parties.`,
  },
  {
    id: "collect",
    title: "2. Data We Collect",
    content: `Admitos collects and processes the following categories of personal data:

Identity & Contact Data
• Full legal name, date of birth, nationality
• Email address, phone number, postal address
• Parent/guardian name and contact details (where Student is a minor)

Academic & Profile Data
• Academic grades, predicted scores, test results (SAT, ACT, A-level, IB, etc.)
• Academic interests, extracurricular activities, awards, and achievements
• Personal statements, essays, and draft application materials
• Candidacy Evaluation Form (CEF) responses and Student DNA profile
• Writing Style Vector analysis outputs
• School reports, reference letters (where provided)

Platform & Usage Data
• Login credentials, session logs, device type, browser type
• Pages visited, features used, interaction patterns on the Platform
• AI agent interactions, chat logs, task outputs
• Search queries related to school research

Wellbeing Data
• Adie wellbeing companion interaction logs (limited; see Section 7)
• Crisis detection flags (anonymised; see Section 7)

Payment & Financial Data
• Payment records, transaction history
• Bank or card details processed via our secure third-party payment provider (Admitos does not store raw card data)

Biometric Data (Opt-in Only)
• Voice emotion analysis data collected via Hume AI during interview coaching sessions (where explicitly consented to — see Section 7)

Communications Data
• Emails, messages, and written communications exchanged with Admitos
• Session recordings and meeting transcripts (where applicable)

Identity Verification & Compliance Data
• Government-issued identification (where required for KYC/AML compliance)
• Source of funds information (where required)`,
  },
  {
    id: "use",
    title: "3. How We Use Your Data",
    content: `Admitos uses personal data for the following purposes and on the following lawful bases:

Service Delivery (Legal basis: Contract performance)
• To provide education consulting, AI-assisted preparation guidance, and platform access
• To generate candidacy profiles, school shortlists, essay feedback, and application roadmaps
• To operate the Application Readiness Engine (ARE) and generate qualitative preparation indicators
• To assign and coordinate counsellors, tutors, and other service providers
• To communicate with you regarding your application journey

Platform Improvement & Quality Assurance (Legal basis: Legitimate interests)
• To monitor and improve platform performance, features, and AI model accuracy
• To record sessions for quality assurance, staff training, and dispute resolution
• To analyse anonymised aggregate data for product development and investor reporting
• To conduct security monitoring, fraud detection, and compliance screening

Wellbeing Support (Legal basis: Legitimate interests / Consent)
• To operate the Adie wellbeing companion and provide peer support resources
• To detect crisis-related language and trigger pre-approved safety responses
• To log crisis detection events securely for safeguarding purposes

Compliance & Legal Obligations (Legal basis: Legal obligation / Legitimate interests)
• To conduct sanctions screening, AML checks, and KYC verification
• To comply with applicable laws, regulatory requirements, and court orders
• To maintain financial records for tax and accounting purposes
• To preserve evidence for dispute resolution and legal proceedings

Marketing & Communications (Legal basis: Consent / Legitimate interests)
• To send service-related communications, progress updates, and deadline reminders
• To send marketing communications where you have consented or where Admitos has a legitimate interest
• You may opt out of marketing communications at any time by contacting privacy@admitos.ai

Admitos does not sell your personal data to third parties.`,
  },
  {
    id: "retention",
    title: "4. Data Retention",
    content: `Admitos retains personal data for the periods set out below. Data is securely deleted or anonymised once the applicable retention period expires, unless a longer period is required by law.

Student Profile & CEF Data
Purpose: Service delivery, ARE generation, agent profiling
Retention: Duration of Term + 3 years
Basis: Contract performance

Essay Drafts & Application Content
Purpose: Writing style analysis, feedback, version history
Retention: Duration of Term + 3 years
Basis: Contract performance

Wellbeing Signals & Adie Interactions
Purpose: Wellbeing support, crisis detection
Retention: 90 days (anonymised signals)
Basis: Legitimate interest / Consent

Payment Records
Purpose: Financial compliance, dispute resolution
Retention: 7 years
Basis: Legal obligation

Session Recordings & Platform Logs
Purpose: Quality control, compliance, dispute evidence
Retention: 3 years
Basis: Legitimate interest

Identity & KYC Records
Purpose: AML and sanctions compliance
Retention: 5 years from end of relationship (or as required by law)
Basis: Legal obligation

Biometric Data (Hume AI voice analysis, if opted in)
Purpose: Interview coaching emotional pace analysis
Retention: Session only; text summary maximum 90 days
Basis: Explicit GDPR Article 9 consent

Marketing Preferences
Purpose: Managing opt-in/out status
Retention: Until withdrawn or 3 years after last interaction
Basis: Consent / Legitimate interest

Where the Student is under 18, Admitos applies enhanced data minimisation and retention practices in accordance with applicable child protection legislation.`,
  },
  {
    id: "sharing",
    title: "5. Data Sharing & Third-Party Processors",
    content: `Admitos shares personal data with third parties only where necessary and on terms that protect your rights.

Service Providers & Sub-Processors
Admitos works with carefully selected service providers who process data on Admitos's behalf, including:
• Cloud infrastructure and hosting providers
• AI model providers (for platform AI functionality)
• Payment processors (for secure payment handling)
• Video conferencing platforms (for session delivery)
• Interview coaching AI tools (including Hume AI, where consented to)
• Email and communication service providers

All sub-processors are contractually bound to process data only on Admitos's instructions, to maintain appropriate security measures, and to comply with applicable data protection law.

School Partners
Where the Services are delivered through a School partnership arrangement, relevant student data may be shared with the Partner School to the extent necessary to coordinate and deliver the Services. The School must have a lawful basis for such sharing and must have obtained all necessary consents.

Legal & Regulatory Disclosure
Admitos may disclose personal data to law enforcement authorities, courts, regulators, or government agencies where required by applicable law, court order, or regulatory requirement. Admitos will, where lawfully permitted, notify you of any such disclosure.

Sanctions & Compliance Screening
Admitos may share data with compliance screening providers as part of its obligations under applicable sanctions regulations, anti-money laundering rules, and export control requirements.

Business Transfers
In the event of a merger, acquisition, restructuring, or sale of all or part of Admitos's business, personal data may be transferred to the relevant successor entity. You will be notified of any such transfer.

Admitos does not sell, rent, or trade personal data with third parties for their own marketing purposes.`,
  },
  {
    id: "transfers",
    title: "6. International Data Transfers",
    content: `The Services may involve cross-border data processing. Your personal data may be accessed, processed, or stored in jurisdictions outside the United Kingdom, including the United States and other countries where Admitos's service providers operate.

Where personal data is transferred outside the UK, Admitos ensures that appropriate safeguards are in place, including:
• Standard Contractual Clauses (SCCs) approved by the UK Information Commissioner's Office (ICO)
• Adequacy decisions issued by the UK Government
• Other approved transfer mechanisms under UK GDPR

By accepting these Terms and this Privacy Policy, you consent to such international transfers, subject to the safeguards described above.

For more information about the specific safeguards applied to international data transfers, please contact privacy@admitos.ai.`,
  },
  {
    id: "special",
    title: "7. Special Category & Sensitive Data",
    content: `Wellbeing Data & Adie
Adie is a peer support and wellbeing resource tool. It is NOT a medical service, mental health service, therapy service, or clinical service of any kind. Adie does not provide medical or psychological advice, diagnosis, or treatment.

Adie interaction data is processed with strict limitations:
• Anonymised wellbeing signals are retained for a maximum of 90 days
• In the event that Adie detects crisis-related language, the interaction is immediately logged securely and the user is presented with pre-approved professional resource information. Adie will NOT generate any AI response to a crisis disclosure.
• Crisis detection logs are retained for safeguarding and compliance purposes only

Crisis support resources:
• UK: Samaritans 116 123 (free, 24/7) | NHS urgent mental health: 111 option 2
• US: 988 Suicide & Crisis Lifeline (call or text 988, free, 24/7)
• If you or the Student are in immediate danger, call emergency services immediately.

Biometric Data (Hume AI Voice Emotion Analysis)
Biometric data — specifically voice emotion analysis conducted via Hume AI during interview coaching sessions — is:
• STRICTLY OPT-IN. It is not required for any core Service.
• Only collected and processed where the Student has provided explicit, freely given, separate consent under GDPR Article 9 via a dedicated consent form
• Retained for the duration of the session only; a text summary may be retained for a maximum of 90 days
• Not shared with any third party other than Hume AI (acting as a sub-processor under contract)

Where the Student is based in the United States, additional state-level biometric privacy consents may be required, including:
• Illinois Biometric Information Privacy Act (BIPA)
• Texas Capture or Use of Biometric Identifier Act (CBTPA)
• Washington My Health MY Data Act (MHMDA)
The relevant consent form will be provided before any biometric feature is activated.

Child Data
Where the Student is under 18, Admitos treats all Student data as child data and applies enhanced protections including:
• Processing Student data only as necessary for Service delivery
• Not using child data for marketing purposes
• Applying heightened security and access controls
• Requiring parental/guardian consent for data collection and processing`,
  },
  {
    id: "rights",
    title: "8. Your Rights",
    content: `Under UK GDPR and applicable data protection law, you have the following rights in respect of your personal data:

Right of Access: You have the right to request a copy of the personal data Admitos holds about you, together with information about how it is processed.

Right to Rectification: You have the right to request that Admitos correct any inaccurate or incomplete personal data it holds about you.

Right to Erasure ("Right to be Forgotten"): You have the right to request that Admitos delete your personal data in certain circumstances, including where it is no longer necessary for the purpose for which it was collected, or where you withdraw consent. This right does not apply where Admitos is required to retain data by law or for the establishment, exercise, or defence of legal claims.

Right to Restrict Processing: You have the right to request that Admitos restricts the processing of your personal data in certain circumstances, for example while the accuracy of the data is contested.

Right to Data Portability: Where processing is based on consent or contract performance, and is carried out by automated means, you have the right to receive your personal data in a structured, commonly used, and machine-readable format.

Right to Object: You have the right to object to processing based on legitimate interests, including for direct marketing purposes. Where you object to processing for direct marketing, Admitos will cease such processing immediately.

Rights in Relation to Automated Decision-Making: Admitos uses AI and automated systems to assist in preparation guidance. You have the right not to be subject to a decision based solely on automated processing that produces legal or similarly significant effects. All significant outputs (such as ARE assessments and strategic recommendations) are reviewed within Admitos's human-in-the-loop system.

Right to Withdraw Consent: Where processing is based on your consent, you have the right to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing carried out prior to withdrawal.

How to Exercise Your Rights: To exercise any of the above rights, please contact privacy@admitos.ai. Admitos will respond to verified requests within 30 days (or such other period as required by applicable law). Admitos may need to verify your identity before processing your request.

Right to Lodge a Complaint: If you are not satisfied with how Admitos handles your personal data, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at ico.org.uk, or with the relevant supervisory authority in your country of residence.`,
  },
  {
    id: "security",
    title: "9. Security & Incident Response",
    content: `Admitos implements commercially reasonable technical and organisational security measures to protect your personal data against unauthorised access, loss, destruction, alteration, or disclosure.

Security measures include, but are not limited to:
• Encryption of data in transit and at rest
• Access controls and authentication requirements
• Regular security assessments and penetration testing
• Staff training on data protection and security obligations
• Monitoring and logging of access to personal data

Security Incidents: Each Party shall promptly notify all relevant other Parties upon becoming aware of any security incident, data breach, or unauthorised access involving data shared under this Agreement, and shall cooperate in any investigation and remediation.

Where a personal data breach is likely to result in a risk to the rights and freedoms of individuals, Admitos will notify the ICO within 72 hours of becoming aware of the breach, and will notify affected individuals without undue delay where required by applicable law.

No security system is impenetrable. Admitos cannot guarantee the absolute security of your personal data, and accepts no liability for breaches that result from circumstances outside its reasonable control.`,
  },
  {
    id: "recording",
    title: "10. Recording & Monitoring",
    content: `For the purposes of quality assurance, staff training, dispute resolution, compliance, platform security, and evidence preservation, Admitos may record, log, and monitor:

• Video and audio sessions (where applicable)
• Platform interactions, messages, and AI agent conversations
• Service delivery processes and counsellor actions
• Payment transactions and financial records

All recordings and monitoring data will be handled in accordance with this Privacy Policy and applicable law. By using the Platform and Services, each client-side Party expressly consents to such recording and monitoring.

Recordings and monitoring data are retained for 3 years for quality control, compliance, and dispute evidence purposes. They are accessible only to authorised Admitos personnel and, where required, to regulators, courts, or legal representatives in the context of a legal dispute.

Session recordings will not be used for purposes incompatible with those stated in this Privacy Policy without your prior consent, except where required by law.`,
  },
  {
    id: "contact",
    title: "11. Updates & Contact",
    content: `Updates to This Policy: Admitos may update this Privacy Policy from time to time. We will notify you of material changes by posting a notice on the Platform or by email. Continued use of the Platform after the effective date of any update constitutes acceptance of the updated Policy.

Contact Us: For any questions, concerns, or requests regarding this Privacy Policy or the processing of your personal data, please contact:

Data Protection Contact: privacy@admitos.ai
Legal Contact: legal@admitos.ai
Mailing Address: Admitos Limited, [registered address]

UK ICO (Supervisory Authority): ico.org.uk | 0303 123 1113

This Privacy Policy was last updated: April 2026

Admitos Limited · admitos.ai · Excellence as a Service
Compliance-First · Wellbeing-First · Student-Centred`,
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("intro");

  return (
    <div className="min-h-screen bg-calm-surface text-calm-text font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-calm-border bg-calm-surface-2 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-calm-text-muted hover:text-calm-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-calm-primary text-white p-1.5 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm">AdmitOS.ai</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-calm-text-muted text-sm">
            Admitos Limited · admitos.ai · Last updated: April 2026
          </p>
          <div className="mt-4 p-4 rounded-xl bg-calm-surface-2 border border-calm-border">
            <p className="text-sm text-calm-text-muted leading-relaxed">
              Admitos Limited is committed to protecting your privacy and handling your personal data with care,
              transparency, and in accordance with applicable data protection law, including the UK GDPR and the
              Data Protection Act 2018.
            </p>
          </div>
        </div>

        {/* Quick reference grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Data Controller", value: "Admitos Limited" },
            { label: "Contact", value: "privacy@admitos.ai" },
            { label: "Governing Law", value: "England & Wales (UK GDPR)" },
            { label: "Biometric Data", value: "Opt-in only" },
            { label: "Data Sales", value: "We never sell your data" },
            { label: "Complaints", value: "ico.org.uk" },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-calm-surface-2 border border-calm-border">
              <div className="text-xs text-calm-text-muted mb-1">{item.label}</div>
              <div className="text-sm font-medium">{item.value}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-2">
          {sections.map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div
                key={section.id}
                className="rounded-xl border border-calm-border bg-calm-surface-2 overflow-hidden"
              >
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-calm-surface transition-colors"
                >
                  <span className="font-medium text-sm">{section.title}</span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-calm-text-muted shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-calm-text-muted shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 border-t border-calm-border">
                    <div className="pt-4 text-sm text-calm-text-muted leading-relaxed whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-10 text-center text-xs text-calm-text-muted">
          <p>
            Questions about your data? Contact us at{" "}
            <span className="text-calm-text">privacy@admitos.ai</span>
          </p>
          <p className="mt-1">
            To exercise your rights, email privacy@admitos.ai with the subject line "Data Rights Request".
          </p>
        </div>
      </main>
    </div>
  );
}
