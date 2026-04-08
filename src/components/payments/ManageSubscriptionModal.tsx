import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X, CheckCircle2, ArrowRight, CreditCard, Receipt,
  AlertTriangle, Loader2, Zap, Calendar, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import PaymentModal, { type PaymentItem } from "./PaymentModal";

interface ManageSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

// Mock data — replace with real API data when auth is connected
const CURRENT_PLAN = {
  id: "plus",
  name: "Plus",
  price: 49,
  credits: 500,
  renewsOn: "1 Nov 2026",
  status: "active" as "active" | "cancelled" | "past_due",
  paymentMethod: { brand: "Visa", last4: "4242", expiry: "12/27" },
  stripeCustomerId: "", // populated after real auth
};

const BILLING_HISTORY = [
  { id: "inv_1", date: "1 Oct 2026", amount: 49, status: "paid", plan: "Plus" },
  { id: "inv_2", date: "1 Sep 2026", amount: 49, status: "paid", plan: "Plus" },
  { id: "inv_3", date: "1 Aug 2026", amount: 49, status: "paid", plan: "Plus" },
  { id: "inv_4", date: "1 Jul 2026", amount: 19, status: "paid", plan: "Basic" },
];

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 19,
    credits: 100,
    features: ["100 monthly credits", "Basic school list", "Standard roadmap"],
  },
  {
    id: "plus",
    name: "Plus",
    price: 49,
    credits: 500,
    features: ["500 monthly credits", "Advanced agent planning", "Document generation"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: null,
    credits: null,
    features: ["Unlimited credits", "Dedicated counsellor", "1:1 strategy sessions"],
  },
];

type Tab = "overview" | "plans" | "billing" | "cancel";

export default function ManageSubscriptionModal({ open, onClose }: ManageSubscriptionModalProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [showHistory, setShowHistory] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeItem, setUpgradeItem] = useState<PaymentItem | null>(null);

  const openStripePortal = async () => {
    if (!CURRENT_PLAN.stripeCustomerId) {
      // No real customer yet — prompt user to connect Stripe key
      alert("Connect your Stripe account to manage payment methods.\n\nAdd STRIPE_SECRET_KEY to .env and set up a real customer ID.");
      return;
    }
    setPortalLoading(true);
    try {
      const res = await fetch("/api/payments/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: CURRENT_PLAN.stripeCustomerId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setCancelling(true);
    await new Promise((r) => setTimeout(r, 1800));
    setCancelling(false);
    setCancelled(true);
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "plans", label: "Change Plan" },
    { id: "billing", label: "Billing History" },
    { id: "cancel", label: "Cancel" },
  ];

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
            <div className="bg-calm-surface border border-calm-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-calm-border">
                <Dialog.Title className="text-base font-semibold text-calm-text">
                  Manage Subscription
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-calm-surface-2 transition-colors">
                    <X className="w-4 h-4 text-calm-text-muted" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-calm-border px-6 gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "text-xs font-medium py-3 px-3 border-b-2 transition-colors -mb-px",
                      tab === t.id
                        ? "border-calm-primary text-calm-primary"
                        : "border-transparent text-calm-text-muted hover:text-calm-text",
                      t.id === "cancel" && "text-red-400 hover:text-red-400"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-6 py-5">
                {/* ── OVERVIEW ── */}
                {tab === "overview" && (
                  <div className="space-y-4">
                    {/* Status badge */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-calm-text">AdmitOS {CURRENT_PLAN.name}</p>
                        <p className="text-xs text-calm-text-muted mt-0.5">£{CURRENT_PLAN.price}/month</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                        CURRENT_PLAN.status === "active"
                          ? "bg-calm-success/15 text-calm-success"
                          : CURRENT_PLAN.status === "past_due"
                          ? "bg-calm-warning/15 text-calm-warning"
                          : "bg-red-500/15 text-red-400"
                      )}>
                        {CURRENT_PLAN.status === "active" ? "Active" : CURRENT_PLAN.status === "past_due" ? "Past Due" : "Cancelled"}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-calm-surface-2 rounded-xl p-4 border border-calm-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-3.5 h-3.5 text-calm-warning" />
                          <span className="text-[10px] font-semibold text-calm-text-muted uppercase tracking-wider">Credits</span>
                        </div>
                        <p className="text-xl font-semibold text-calm-text">{CURRENT_PLAN.credits}<span className="text-xs text-calm-text-muted font-normal">/mo</span></p>
                      </div>
                      <div className="bg-calm-surface-2 rounded-xl p-4 border border-calm-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-calm-primary" />
                          <span className="text-[10px] font-semibold text-calm-text-muted uppercase tracking-wider">Renews</span>
                        </div>
                        <p className="text-sm font-semibold text-calm-text">{CURRENT_PLAN.renewsOn}</p>
                      </div>
                    </div>

                    {/* Payment method */}
                    <div className="flex items-center justify-between p-4 bg-calm-surface-2 rounded-xl border border-calm-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-6 bg-calm-surface border border-calm-border rounded flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5 text-calm-text-muted" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-calm-text capitalize">{CURRENT_PLAN.paymentMethod.brand} ···· {CURRENT_PLAN.paymentMethod.last4}</p>
                          <p className="text-[10px] text-calm-text-muted">Expires {CURRENT_PLAN.paymentMethod.expiry}</p>
                        </div>
                      </div>
                      <button
                        onClick={openStripePortal}
                        disabled={portalLoading}
                        className="text-xs text-calm-primary hover:underline flex items-center gap-1 disabled:opacity-60"
                      >
                        {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Update
                      </button>
                    </div>

                    {/* Quick actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setTab("plans")}
                        className="w-full flex items-center justify-between px-4 py-3 bg-calm-surface-2 hover:bg-calm-bg/60 rounded-xl border border-calm-border transition-colors text-sm text-calm-text"
                      >
                        <span className="flex items-center gap-2.5"><RefreshCw className="w-4 h-4 text-calm-text-muted" /> Change plan</span>
                        <ArrowRight className="w-3.5 h-3.5 text-calm-text-muted" />
                      </button>
                      <button
                        onClick={openStripePortal}
                        disabled={portalLoading}
                        className="w-full flex items-center justify-between px-4 py-3 bg-calm-surface-2 hover:bg-calm-bg/60 rounded-xl border border-calm-border transition-colors text-sm text-calm-text disabled:opacity-60"
                      >
                        <span className="flex items-center gap-2.5"><ExternalLink className="w-4 h-4 text-calm-text-muted" /> Open Stripe billing portal</span>
                        <ArrowRight className="w-3.5 h-3.5 text-calm-text-muted" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-calm-text-muted justify-center pt-1">
                      <ShieldCheck className="w-3 h-3" />
                      Secured by Stripe · Cancel anytime
                    </div>
                  </div>
                )}

                {/* ── CHANGE PLAN ── */}
                {tab === "plans" && (
                  <div className="space-y-3">
                    {PLANS.map((plan) => {
                      const isCurrent = plan.id === CURRENT_PLAN.id;
                      const isCustom = plan.price === null;
                      return (
                        <div
                          key={plan.id}
                          className={cn(
                            "p-4 rounded-xl border transition-colors",
                            isCurrent
                              ? "border-calm-primary/40 bg-calm-primary/5"
                              : "border-calm-border bg-calm-surface-2"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-calm-text">{plan.name}</p>
                                {isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-calm-primary text-white uppercase tracking-wider">Current</span>
                                )}
                                {plan.popular && !isCurrent && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-calm-accent/15 text-calm-accent uppercase tracking-wider">Popular</span>
                                )}
                              </div>
                              <p className="text-xs text-calm-text-muted mb-2">
                                {isCustom ? "Custom pricing" : `£${plan.price}/month`}
                                {plan.credits && ` · ${plan.credits} credits`}
                              </p>
                              <ul className="space-y-1">
                                {plan.features.map((f) => (
                                  <li key={f} className="flex items-center gap-1.5 text-[11px] text-calm-text-muted">
                                    <CheckCircle2 className="w-3 h-3 text-calm-success shrink-0" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="shrink-0 mt-1">
                              {isCurrent ? (
                                <button disabled className="text-xs px-3 py-1.5 rounded-lg bg-calm-surface border border-calm-border text-calm-text-muted cursor-not-allowed">
                                  Current
                                </button>
                              ) : isCustom ? (
                                <button className="text-xs px-3 py-1.5 rounded-lg bg-calm-surface border border-calm-border text-calm-text-muted hover:bg-calm-surface-2 transition-colors">
                                  Contact Sales
                                </button>
                              ) : (
                                <button
                                  onClick={() => setUpgradeItem({
                                    name: `AdmitOS ${plan.name}`,
                                    description: plan.features[0],
                                    amount: plan.price!,
                                    plan: plan.id,
                                    isSubscription: true,
                                  })}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-calm-primary text-white hover:bg-calm-primary-hover transition-colors"
                                >
                                  {plan.price! > CURRENT_PLAN.price ? "Upgrade" : "Downgrade"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── BILLING HISTORY ── */}
                {tab === "billing" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-calm-text-muted">Recent invoices</p>
                      <button
                        onClick={openStripePortal}
                        disabled={portalLoading}
                        className="text-xs text-calm-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View all in Stripe
                      </button>
                    </div>

                    {BILLING_HISTORY.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between px-4 py-3 bg-calm-surface-2 rounded-xl border border-calm-border">
                        <div className="flex items-center gap-3">
                          <Receipt className="w-4 h-4 text-calm-text-muted shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-calm-text">AdmitOS {inv.plan}</p>
                            <p className="text-[10px] text-calm-text-muted">{inv.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-semibold text-calm-success bg-calm-success/10 px-2 py-0.5 rounded-full uppercase">
                            {inv.status}
                          </span>
                          <p className="text-xs font-medium text-calm-text">£{inv.amount}</p>
                          <button className="text-[10px] text-calm-primary hover:underline">PDF</button>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs text-calm-text-muted hover:text-calm-text transition-colors py-1"
                    >
                      {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      {showHistory ? "Show less" : "Load more"}
                    </button>
                  </div>
                )}

                {/* ── CANCEL ── */}
                {tab === "cancel" && (
                  <div className="space-y-4">
                    {cancelled ? (
                      <div className="text-center py-6 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-calm-surface-2 flex items-center justify-center mx-auto border border-calm-border">
                          <CheckCircle2 className="w-6 h-6 text-calm-success" />
                        </div>
                        <p className="text-sm font-semibold text-calm-text">Subscription cancelled</p>
                        <p className="text-xs text-calm-text-muted max-w-xs mx-auto">
                          Your Plus plan is active until <strong>{CURRENT_PLAN.renewsOn}</strong>. You won't be charged again.
                        </p>
                        <button onClick={onClose} className="text-xs text-calm-primary hover:underline mt-2">
                          Close
                        </button>
                      </div>
                    ) : cancelStep === 1 ? (
                      <>
                        <div className="flex items-start gap-3 p-4 bg-calm-warning/10 border border-calm-warning/20 rounded-xl">
                          <AlertTriangle className="w-4 h-4 text-calm-warning shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-calm-text mb-1">Before you cancel</p>
                            <p className="text-xs text-calm-text-muted leading-relaxed">
                              You'll lose access to <strong>500 monthly credits</strong>, advanced AI planning, and document generation on <strong>{CURRENT_PLAN.renewsOn}</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {[
                            "Switch to Basic (£19/mo) and keep AI access",
                            "Pause subscription for up to 3 months",
                            "Talk to our team about a discount",
                          ].map((option) => (
                            <button
                              key={option}
                              onClick={() => setTab("plans")}
                              className="w-full flex items-center justify-between px-4 py-3 bg-calm-surface-2 hover:bg-calm-bg/60 rounded-xl border border-calm-border transition-colors text-left"
                            >
                              <span className="text-xs text-calm-text">{option}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-calm-text-muted shrink-0" />
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCancelStep(2)}
                          className="w-full py-2.5 text-xs text-red-400 hover:text-red-300 transition-colors border border-red-500/20 rounded-xl hover:bg-red-500/5"
                        >
                          I still want to cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="text-center py-2 space-y-1">
                          <p className="text-sm font-semibold text-calm-text">Confirm cancellation</p>
                          <p className="text-xs text-calm-text-muted">
                            Your Plus plan will remain active until <strong>{CURRENT_PLAN.renewsOn}</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setCancelStep(1)}
                            className="py-3 text-xs font-medium rounded-xl border border-calm-border bg-calm-surface-2 hover:bg-calm-bg/60 text-calm-text transition-colors"
                          >
                            Keep my plan
                          </button>
                          <button
                            onClick={handleCancelConfirm}
                            disabled={cancelling}
                            className="py-3 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                          >
                            {cancelling ? (
                              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling…</>
                            ) : "Cancel plan"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Upgrade/downgrade payment modal */}
      <PaymentModal
        open={!!upgradeItem}
        onClose={() => setUpgradeItem(null)}
        item={upgradeItem}
      />
    </>
  );
}
