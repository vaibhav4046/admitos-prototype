import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using the AdmitOS platform ("Platform"), creating an account, clicking "Continue", or making any payment, you ("Client", "Parent", "Student", or "School") confirm that you have read, understood, and agree to be legally bound by these Terms of Service ("Terms") and all incorporated policies.

If you do not agree to these Terms in full, you must not use the Platform or Services.

These Terms constitute a binding legal agreement between you and Admitos Limited ("Admitos", "we", "us", "our"), a company incorporated in England and Wales. These Terms are governed by the laws of England and Wales.

Where you are a consumer, nothing in these Terms affects any statutory rights that cannot be excluded or limited under the Consumer Rights Act 2015, the Unfair Contract Terms Act 1977, or other applicable mandatory consumer protection legislation.`,
  },
  {
    id: "nature",
    title: "2. Nature of Services & Admitos Status",
    content: `Admitos is an independent education consulting and AI platform company. Admitos is NOT, and shall not be represented as:

• A guarantor of admission to any educational institution
• An agent, legal representative, or official representative of any university, school, or admissions body
• A lawyer, immigration adviser, licensed financial adviser, licensed therapist, regulated mental health professional, or medical practitioner
• An employee, officer, or representative of the Parent, Student, or School
• A fiduciary, trustee, or co-decision-maker in respect of any application or institutional decision

IMPORTANT NOTICE: This Agreement does not guarantee admission to any educational institution. All admission decisions rest exclusively with the relevant institutions. AdmitOS provides preparation guidance and platform services only.

Admitos provides education consulting, platform access, and AI-assisted preparation guidance services. These services are not a substitute for the Student's own judgment, the Parent's own decisions, professional legal or immigration advice, medical or psychological treatment, or any other regulated professional service.

The following are entirely outside Admitos's control, and Admitos assumes no responsibility for them:
• Application submission, truthfulness of application content, institutional communications, and final application decisions
• The Student's academic performance, standardised test results, or extracurricular achievements
• Changes in institutional admissions policies, deadlines, financial aid, or visa requirements
• Recommendation letters, school reports, or school counsellor actions
• The conduct of any third-party platform (including Common App, UCAS, or similar systems)`,
  },
  {
    id: "services",
    title: "3. Services Description",
    content: `Subject to payment of applicable Fees, Admitos may provide the following Services:

• Candidacy evaluation and multi-year admissions strategy development
• School and university list strategy (including reach, target, and likely school analysis)
• Academic profiling and Student DNA analysis (including the 8-dimension profile and Writing Style Vector)
• Essay development guidance — structure, narrative, and authenticity coaching. Admitos does not write essays on behalf of Students.
• Extracurricular activities, research, and academic enrichment planning
• Interview preparation and coaching
• Application readiness assessment through the Application Readiness Engine (ARE) — qualitative indicators only
• Wellbeing support through Adie (peer support tool, not a clinical service)
• Access to the Admitos Platform, AI tools, and content libraries
• Progress tracking, deadline management, and preparation roadmap updates

Standard of Service: Admitos will provide the Services using reasonable skill and care and in accordance with its internal quality standards. Admitos makes no warranty, express or implied, beyond this standard, except as required by mandatory applicable law.

Personnel & Resourcing: Admitos may at its reasonable discretion assign, reassign, replace, supplement, or remove counsellors, staff, AI agents, or other personnel; adjust meeting frequency, communication channels, or delivery methods; or substitute certain one-to-one support with group sessions, recorded content, platform tools, or AI-assisted resources. Such adjustments shall not constitute a breach and shall not give rise to a right to a refund or fee reduction, provided the overall scope of Services continues to be delivered in all material respects.

Non-Exclusivity: Admitos reserves the right to provide similar or identical services to other clients. You do not acquire any exclusive rights to Admitos's personnel, methods, or resources.`,
  },
  {
    id: "obligations",
    title: "4. Client Obligations & Acceptable Use",
    content: `By using the Platform and Services, you jointly and severally undertake to:

• Provide all information, documents, academic records, test scores, extracurricular records, personal statements, and identity information promptly, completely, and accurately
• Disclose all material facts relevant to the application process, including any disciplinary records, academic irregularities, or circumstances that may affect any application
• Attend scheduled meetings and sessions, read feedback, complete agreed tasks, and maintain active engagement with the Services
• Provide at least 24 hours' notice to cancel or reschedule any session. Admitos may at its discretion decline to reschedule sessions cancelled with less than 24 hours' notice.
• Ensure that all application materials submitted to institutions are truthful, original, and the Student's own work, and comply with all institutional academic integrity and AI usage policies
• NOT submit, cause to be submitted, or facilitate the submission of any false, misleading, plagiarised, AI-generated, ghostwritten, or otherwise dishonest application content
• Take full personal responsibility for all final application submissions, institutional communications, acceptance or rejection of offers, and enrolment decisions
• Treat all Admitos personnel, counsellors, and other clients with courtesy and respect
• NOT engage in abusive, threatening, harassing, defamatory, discriminatory, or bad-faith conduct towards Admitos or its personnel
• NOT initiate unjustified chargebacks, payment reversals, or credit card disputes as a substitute for the dispute resolution process set out in these Terms
• Comply with all Platform rules, institutional policies, examination regulations, and applicable law

Representations: Each client-side Party represents and warrants to Admitos that:
• They are not subject to any applicable sanctions list, and are not located in or acting on behalf of any sanctioned territory
• They will not use the Services to facilitate any sanctioned transaction, money laundering, terrorism financing, bribery, corruption, export control violation, or other unlawful activity
• They will provide KYC, identity, and source of funds information as reasonably requested by Admitos
• All information provided to Admitos is true, accurate, and not misleading in any material respect`,
  },
  {
    id: "platform",
    title: "5. Platform Access & Usage Restrictions",
    content: `Subject to these Terms, Admitos grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform solely for the purposes of receiving the Services.

You must NOT:
• Copy, reproduce, sell, licence, sublicence, reverse-engineer, decompile, disassemble, or create derivative works from the Platform or its content
• Use automated tools, bots, scrapers, or scripts to extract data from the Platform
• Use Platform content or outputs to train third-party AI or machine learning models
• Circumvent any security, access control, or authentication measure of the Platform
• Share Platform access credentials with any unauthorised third party

Recording & Monitoring: For the purposes of quality assurance, staff training, dispute resolution, compliance, platform security, and evidence preservation, Admitos may record, log, and monitor sessions, Platform interactions, messages, and service delivery processes. All recordings and data will be handled in accordance with Admitos's Privacy Policy and applicable law. Each client-side Party expressly consents to such recording and monitoring by entering into this Agreement.

AI Tools & Outputs: Admitos's AI systems — including the multi-agent preparation mesh, the Application Readiness Engine, and Adie — are designed to assist preparation and support, not to make decisions on behalf of students or institutions. Admitos does not guarantee that any AI output is error-free, free from bias, or will produce any particular outcome. Client-side Parties are responsible for verifying the accuracy of any AI output before relying on it for any submission or decision.

Academic Integrity & AI: Where the Student uses any AI tool — whether provided by Admitos or otherwise — in connection with application materials, the Student is solely responsible for ensuring that such use complies with the academic integrity policies of every institution to which they apply.`,
  },
  {
    id: "fees",
    title: "6. Fees, Payment & Non-Refund Policy",
    content: `Fee Structure: The Fees represent compensation for the whole of the Services, including strategic value delivered at the outset, resource allocation, counsellor assignment, capacity reservation, and platform access, whether or not all sessions are attended or all services are fully utilised.

Payment Terms: All Fees are due and payable on the dates stated at the time of purchase. Fees are exclusive of all third-party fees, examination fees, application fees, visa fees, translation fees, postage, bank transfer charges, and taxes. Instalment arrangements are administrative payment conveniences only and do not create separate, independent service agreements.

NON-REFUND POLICY: To the maximum extent permitted by applicable law, all Fees paid or due under this Agreement are final, non-refundable, non-creditable, and non-cancellable. The Parties acknowledge that:
• Admitos begins incurring costs, reserving capacity, and delivering strategic value from the commencement of Services
• The extent to which a client-side Party actually uses or engages with the Services does not affect the earned nature of the Fees
• No refund shall be due on account of any admission outcome, including rejection, deferral, waitlisting, or other result

Statutory consumer rights: Where you qualify as a consumer under the Consumer Rights Act 2015 or other mandatory consumer protection legislation, you may have statutory rights to a refund in limited circumstances, including in respect of any cooling-off period under the Consumer Contracts Regulations 2013. Such statutory rights are preserved to the extent required by law.

Late Payment: If any amount remains outstanding more than 7 days after its due date, Admitos may without prejudice to any other rights:
• Suspend all or any part of the Services (including Platform access, counsellor sessions, and AI tools) without liability
• Charge interest on overdue amounts at 8% per annum above the Bank of England base rate, accruing daily
• Declare all remaining instalments immediately due and payable
• Engage debt recovery agents and charge the reasonable costs of recovery, including legal fees
• Terminate this Agreement

Prohibited Payment Actions: Client-side Parties shall not initiate, request, or cause any chargeback, payment reversal, credit card dispute, or bank recall in respect of any payment made under this Agreement as a means of resolving any dispute. Any such action shall constitute a material breach of this Agreement. The proper mechanism for disputes is set out in Section 13.

Taxes: Each client-side Party is responsible for all taxes, duties, levies, or withholdings applicable to their receipt of the Services in their jurisdiction.`,
  },
  {
    id: "ip",
    title: "7. Intellectual Property",
    content: `Admitos Ownership: All Intellectual Property Rights in the Platform, AI systems and agents, methodology, scoring models, Application Readiness Engine (ARE), Writing Style Vector technology, counsellor matching algorithms, prompt engineering systems, training content, templates, editorial frameworks, anonymised datasets, Deliverables, and all other materials created or developed by or on behalf of Admitos are and shall remain the exclusive property of Admitos.

Client Use Restriction: You may use Deliverables solely for the internal educational purposes of the Student in connection with the Services. You may NOT:
• Reproduce, distribute, publish, or share Deliverables with any third party (other than the relevant admissions institutions for application purposes)
• Use Deliverables for commercial purposes, to train AI models, or to establish or operate a competing service
• Disclose Admitos's methods, frameworks, or systems to any competitor or third party without Admitos's prior written consent

Licence to Client Content: You grant Admitos a worldwide, non-exclusive, royalty-free licence to access, process, store, transmit, analyse, and use content uploaded to the Platform or provided in connection with the Services, for the purposes of providing the Services, improving the Platform, quality assurance, risk management, and compliance.

Anonymised Data: Admitos may use anonymised, de-identified statistical data, aggregate outcomes, project types, and satisfaction feedback (without disclosing any directly personally identifiable information) for internal analysis, platform improvement, investor reporting, and marketing purposes.

Feedback: Any suggestions, ideas, recommendations, or feedback provided by any client-side Party regarding the Services or Platform may be used by Admitos freely and without obligation, attribution, or compensation.`,
  },
  {
    id: "disclaimers",
    title: "8. No Guarantee & Disclaimers",
    content: `No Admission Guarantee: Admitos makes no representation, warranty, or guarantee, express or implied, that the Student will gain admission to any educational institution, programme, scholarship, or award. Admissions decisions are made exclusively by the relevant institutions in the exercise of their own independent judgment and are not within Admitos's control.

Application Readiness Engine (ARE) Disclaimer: The ARE produces qualitative preparation strength indicators only. ARE outputs:
• Are preparation guidance tools, not admission probability predictions
• Do not display, represent, or imply any numerical probability of admission to any named institution
• Do not constitute a guarantee, representation, or promise of any admission outcome
• Are based on the Student's preparation profile at a given point in time and will change as the profile develops
All ARE outputs carry a mandatory non-prediction disclaimer that cannot be removed, hidden, or overridden.

Adie Wellbeing Companion Disclaimer: Adie is a peer support and wellbeing resource tool. Adie:
• Is NOT a medical service, mental health service, therapy service, or clinical service of any kind
• Does NOT provide medical or psychological advice, diagnosis, or treatment
• Does NOT replace the need for professional mental health support

In the event that Adie detects crisis-related language, it will immediately cease normal conversation, display pre-approved fixed professional resource information (including crisis helplines), and log the event securely. Adie will not generate any AI response to a crisis disclosure.

Crisis support resources:
• UK: Samaritans 116 123 (free, 24/7) | NHS urgent mental health: 111 option 2
• US: 988 Suicide & Crisis Lifeline (call or text 988, free, 24/7)
• If the Student is in immediate danger, call emergency services.

Third-Party Services: Admitos is not responsible for the acts, omissions, accuracy, availability, or decisions of any university, school, examination body, government authority, visa authority, payment provider, or third-party platform. Admitos does not warrant the continued accuracy of any third-party admissions data, policy information, or institutional deadline.`,
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    content: `Exclusion of Consequential Loss: To the maximum extent permitted by applicable law, Admitos shall not be liable for any:
• Indirect, incidental, special, punitive, or consequential loss or damage
• Loss of profit, loss of opportunity, loss of expected admission outcome, loss of anticipated scholarship, or loss of reputation
• Loss of data, system failure, or platform unavailability
arising out of or in connection with this Agreement or the Services, howsoever caused.

Aggregate Liability Cap: To the maximum extent permitted by applicable law, Admitos's total aggregate liability to all client-side Parties combined, arising out of or in connection with this Agreement and the Services (whether in contract, tort, including negligence, breach of statutory duty, or otherwise), shall not exceed the total Fees actually paid by the Parent to Admitos in the twelve (12) months immediately preceding the event giving rise to the claim.

Mandatory Non-Excludable Liability: Nothing in these Terms shall exclude or limit Admitos's liability for:
• Death or personal injury caused by Admitos's negligence
• Fraudulent misrepresentation
• Any other liability that cannot lawfully be excluded or limited under applicable law, including mandatory consumer protection provisions under the Consumer Rights Act 2015 or the Unfair Contract Terms Act 1977`,
  },
  {
    id: "indemnification",
    title: "10. Indemnification, Non-Solicitation & Non-Circumvention",
    content: `Client-Side Indemnity: The Parent and Student (and, where applicable, the School) jointly and severally agree to indemnify, defend, and hold harmless Admitos, its affiliates, directors, officers, employees, agents, and contractors from and against any claims, investigations, penalties, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from or related to:
• Any breach of these Terms by any client-side Party
• The provision of false, incomplete, or misleading information to Admitos or to any institution
• Any plagiarised, AI-ghostwritten, fabricated, or otherwise dishonest application content
• Any violation of institutional academic integrity policies
• Any defamatory, harassing, or unlawful conduct by a client-side Party
• Any unjustified chargeback, payment reversal, or payment dispute
• Any violation of applicable data protection, sanctions, AML, or export control obligations
• Any third-party claim arising from the Student's application content, conduct, or decisions

Non-Solicitation: During the Term and for 24 months following termination or expiry, all client-side Parties shall not, directly or indirectly, solicit, engage, employ, or enter into a comparable arrangement with any Admitos employee, counsellor, or contractor introduced to them through the Platform or Services, without Admitos's prior written consent.

Non-Circumvention: Client-side Parties shall not directly or indirectly circumvent, avoid, bypass, or obviate Admitos's fees, administration, or contractual arrangements — whether through private arrangements with Admitos-introduced personnel, use of third-party intermediaries, or otherwise. In the event of circumvention, Admitos shall be entitled to recover:
• The full fees that would have been payable had the circumvented arrangement proceeded through Admitos
• A circumvention fee equal to 30% of the value of the arrangement entered into outside of Admitos
• Injunctive relief and all reasonable legal costs`,
  },
  {
    id: "termination",
    title: "11. Term & Termination",
    content: `Term: This Agreement commences on the Effective Date and continues until the Services have been completed, or until earlier termination.

Termination by Admitos for Cause: Admitos may immediately suspend or terminate this Agreement, in whole or in part, without refund and without prejudice to any other remedy, upon written notice if any client-side Party:
• Fails to pay any amount due within 7 days of the due date
• Provides false, misleading, or materially incomplete information to Admitos or to any institution
• Submits or facilitates the submission of plagiarised, fabricated, AI-ghostwritten, or dishonest application content
• Engages in abusive, threatening, harassing, discriminatory, or defamatory conduct towards Admitos personnel or other clients
• Circumvents the Platform to engage Admitos-introduced counsellors or staff privately
• Initiates an unjustified chargeback or payment reversal
• Breaches any provision relating to intellectual property, confidentiality, or Platform use
• Creates sanctions, AML, reputational, or legal compliance risk for Admitos
• Commits a material breach of this Agreement that is not capable of remedy, or that remains unremedied for 10 business days after written notice

Termination by Client: A client-side Party may terminate this Agreement by giving 30 days' written notice to Admitos. Upon such termination: all Fees that have already been paid are non-refundable; all Fees that have fallen due but remain unpaid must be paid in full.

Effect of Termination: Upon termination or expiry: all Platform access rights shall immediately cease; each Party shall return or securely destroy the other Party's Confidential Information upon request; Sections 7, 8, 9, 10, 11, 12, and 13 shall survive termination.

Goodwill Adjustments: Admitos may, in its sole commercial discretion, offer account credits, service deferrals, counsellor substitutions, or partial future service credits in exceptional circumstances. Any such gesture shall constitute a one-time commercial accommodation only and shall not be construed as an admission of liability, a precedent, or a waiver of any right.`,
  },
  {
    id: "dispute",
    title: "12. Confidentiality & Dispute Resolution",
    content: `Confidentiality: Each Party shall maintain strict confidentiality in respect of all Confidential Information received from or relating to any other Party. Confidential Information may be disclosed only with prior written consent; to employees and contractors who have a need to know; as required by applicable law or court order; or to the extent necessary to exercise rights under this Agreement.

Internal Escalation: If any dispute arises, the disputing Party shall submit a written notice of dispute to Admitos at legal@admitos.ai. The Parties shall use reasonable endeavours to resolve the dispute through good-faith negotiation within 15 business days. During any dispute resolution period, obligations under this Agreement (including payment of undisputed amounts) continue in full force.

Business Client Dispute Resolution: Where the dispute relates to commercial, IP, confidentiality, platform, data, payment, or non-solicitation matters, this Agreement shall be governed by and construed in accordance with the laws of England and Wales. The Parties submit to the exclusive jurisdiction of the courts of England and Wales, or, if Admitos so elects, to arbitration under the rules of the London Court of International Arbitration (LCIA), with the seat of arbitration in London and proceedings in English.

Consumer Client Dispute Resolution: Where the Parent or Student qualifies as a consumer under applicable law, any dispute that cannot be resolved by negotiation may be referred to the courts of England and Wales, or to an alternative dispute resolution (ADR) scheme approved under the Alternative Dispute Resolution for Consumer Disputes Regulations 2015.

Limitation Period: To the maximum extent permitted by applicable law, any claim arising out of or in connection with this Agreement must be brought within 12 months of the date on which the claiming Party first became aware of the facts giving rise to the claim. This limitation period does not apply to any claim for non-payment of Fees.`,
  },
  {
    id: "general",
    title: "13. General Provisions",
    content: `Force Majeure: Admitos shall not be in breach of this Agreement or otherwise liable for any failure or delay in performing its obligations to the extent that such failure or delay results from any event beyond its reasonable control, including natural disasters, war, civil unrest, pandemic, epidemic, governmental orders, changes in law or sanctions, cyberattacks, platform or infrastructure failures, strikes, power outages, or supplier failures. No refund obligation shall arise solely as a result of a Force Majeure Event.

Severability: If any provision of these Terms is found to be invalid, unlawful, or unenforceable, it shall be modified to the minimum extent necessary to make it valid and enforceable, or deleted if modification is not possible. The remaining provisions shall continue in full force and effect.

No Waiver: Admitos's failure to exercise or enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.

Assignment: Admitos may assign, novate, or transfer this Agreement and all rights and obligations hereunder to any affiliate, successor entity, or acquirer of all or part of its business, with notice to the client-side Parties. Client-side Parties may not assign any right or obligation under this Agreement without Admitos's prior written consent.

Entire Agreement: These Terms, together with Admitos's Privacy Policy and any applicable service agreement, constitute the entire agreement between the Parties with respect to the subject matter and supersede all prior representations, discussions, and marketing materials. No representation, warranty, or undertaking not expressly set out in these Terms shall be binding on Admitos.

Amendments: Admitos may update these Terms with reasonable notice. Continued use of the Platform after the effective date of any update constitutes acceptance of the updated Terms.

Electronic Signatures: Platform click-through acceptances, email confirmations, and equivalent electronic execution methods shall have the same legal effect as handwritten signatures. Platform logs, session records, email trails, payment records, and electronic signatures shall constitute valid and admissible evidence in any dispute.

Language: In the event of any inconsistency between the English and Chinese versions of these Terms, the English version shall prevail.

Notices: All notices under this Agreement shall be in writing and delivered by email to legal@admitos.ai. Notices shall be deemed received at the time of transmission unless the sender receives notification of non-delivery.

Contact: Admitos Limited · admitos.ai · legal@admitos.ai · privacy@admitos.ai

Last updated: April 2026`,
  },
];

export default function TermsOfService() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>("acceptance");

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
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-calm-text-muted text-sm">
            Admitos Limited · admitos.ai · Last updated: April 2026
          </p>
          <div className="mt-4 p-4 rounded-xl bg-calm-surface-2 border border-calm-border">
            <p className="text-sm text-calm-text-muted leading-relaxed">
              <span className="font-semibold text-calm-text">IMPORTANT NOTICE:</span> This Agreement does not
              guarantee admission to any educational institution. All admission decisions rest exclusively with the
              relevant institutions. AdmitOS provides preparation guidance and platform services only. Please read
              these Terms in full before using the Platform.
            </p>
          </div>
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
            By using AdmitOS, you acknowledge that you have read and agree to these Terms of Service.
          </p>
          <p className="mt-1">
            Questions? Contact us at{" "}
            <span className="text-calm-text">legal@admitos.ai</span>
          </p>
        </div>
      </main>
    </div>
  );
}
