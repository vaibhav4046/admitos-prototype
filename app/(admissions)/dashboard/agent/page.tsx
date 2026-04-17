/**
 * Dashboard → Agent deploy hub.
 *
 * Manus-style "Deploy your agent for research" hero with four
 * capability cards and a "Get started" CTA below. Server component —
 * all state lives on the sidebar / settings modal layer.
 */

import Link from "next/link";

import { getCurrentUser } from "@/services/auth/server";
import { displayNameFromEmail } from "@/lib/utils";

import { getDashboardCopy } from "@/app/_i18n";
import { readLocale } from "@/app/_i18n/server";

import { DashboardShell } from "../_components/DashboardShell";

const CAPS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h3" />
      </svg>
    ),
    title: "Brand-consistent AI identity",
    body: "Trained on your voice and the UK/US admissions canon — wired into every tool you already use.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Persistent memory and cloud desk",
    body: "A cloud assistant that never forgets — full application context carries across every session.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19.4 5.6-7-7-7 7 2.8 2.8 4.2-4.2 4.2 4.2 2.8-2.8Z" />
        <path d="M3 21h18M6 21v-7M18 21v-7M10 21v-7M14 21v-7" />
      </svg>
    ),
    title: "Specialist skills",
    body: "Twelve agents trained on essay strategy, test prep, school research, interview prep, and more.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
      </svg>
    ),
    title: "In every messenger",
    body: "Telegram, Line, and Slack today. WhatsApp and Messenger queued for M2.",
  },
];

export default async function AgentPage() {
  const [authed, locale] = await Promise.all([getCurrentUser(), readLocale()]);
  const copy = getDashboardCopy(locale);
  const user = authed
    ? {
        displayName: displayNameFromEmail(authed.email) || authed.email,
        email: authed.email,
      }
    : null;

  return (
    <DashboardShell copy={copy} locale={locale} title={copy.sidebar.agent} user={user}>
      <section className="uo-dash-agent">
        <div className="uo-dash-agent-hero">
          <div className="uo-dash-agent-orbits" aria-hidden="true">
            <div className="uo-dash-agent-phone" />
            <div className="uo-dash-agent-chip">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z" />
                <path d="M22 6 12 13 2 6" />
              </svg>
              UniOffer
              <svg viewBox="0 0 24 24" width="13" height="13" fill="#3ea1ff" stroke="none">
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <span className="uo-dash-agent-orb o1" title="Telegram">✈</span>
            <span className="uo-dash-agent-orb o2" title="Messenger">ᴹ</span>
            <span className="uo-dash-agent-orb o3" title="Line">L</span>
            <span className="uo-dash-agent-orb o4" title="WhatsApp">W</span>
            <span className="uo-dash-agent-orb o5" title="Slack">#</span>
          </div>

          <h1 className="uo-dash-agent-title">
            Deploy your agent for <em>admissions</em>
          </h1>
        </div>

        <div className="uo-dash-capgrid">
          {CAPS.map((c) => (
            <article key={c.title} className="uo-dash-capcard">
              <span className="uo-dash-capcard-ic">{c.icon}</span>
              <h4>{c.title}</h4>
              <p>{c.body}</p>
            </article>
          ))}
        </div>

        <Link href="/dashboard" className="uo-dash-agent-cta">
          <span aria-hidden="true" style={{ display: "inline-flex", gap: 4 }}>
            <span style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "#1ea3d6", fontSize: 11, color: "#fff" }}>✈</span>
            <span style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "#06c755", fontSize: 11, color: "#fff" }}>L</span>
            <span style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "#4a154b", fontSize: 11, color: "#fff" }}>#</span>
          </span>
          Get started
        </Link>

        <div className="uo-dash-agent-coming">
          <span>Coming soon</span>
          <div className="uo-dash-agent-coming-row">
            <span className="uo-dash-agent-coming-item">
              <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "#25d366", color: "#fff", fontSize: 12 }}>W</span>
              WhatsApp
            </span>
            <span className="uo-dash-agent-coming-item">
              <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: 22, height: 22, borderRadius: 999, background: "#0084ff", color: "#fff", fontSize: 12 }}>ᴹ</span>
              Messenger
            </span>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
