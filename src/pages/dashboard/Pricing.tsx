import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Zap, CreditCard, PartyPopper, X } from "lucide-react";
import { mockStudent } from "@/data/mockData";
import { useSearchParams } from "react-router-dom";
import PaymentModal from "@/components/payments/PaymentModal";
import ManageSubscriptionModal from "@/components/payments/ManageSubscriptionModal";

interface PaymentItem {
  name: string;
  description: string;
  amount: number;
  credits?: number;
  plan?: string;
  isSubscription?: boolean;
}

export default function Pricing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItem, setSelectedItem] = useState<PaymentItem | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "cancelled"; message: string } | null>(null);

  // Handle Stripe redirect-back
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const subscriptionStatus = searchParams.get("subscription");
    const credits = searchParams.get("credits");
    const plan = searchParams.get("plan");

    if (paymentStatus === "success") {
      setToast({ type: "success", message: `+${credits} credits added to your account!` });
      setSearchParams({}, { replace: true });
    } else if (subscriptionStatus === "success") {
      setToast({ type: "success", message: `${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "Plan"} subscription activated!` });
      setSearchParams({}, { replace: true });
    } else if (paymentStatus === "cancelled" || subscriptionStatus === "cancelled") {
      setToast({ type: "cancelled", message: "Payment cancelled. No charges made." });
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="max-w-5xl mx-auto w-full pt-12 pb-24 px-6 space-y-16">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all animate-in slide-in-from-top-2 ${
            toast.type === "success"
              ? "bg-calm-surface border-calm-success/30 text-calm-success"
              : "bg-calm-surface border-calm-border text-calm-text-muted"
          }`}
        >
          {toast.type === "success" ? (
            <PartyPopper className="w-4 h-4 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-calm-text mb-2">Plan & Credits</h1>
        <p className="text-calm-text-muted text-lg">Manage your subscription and agent execution credits.</p>
      </div>

      {/* Credit Usage + Current Plan */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-medium text-calm-text mb-2">
            <Zap className="w-5 h-5 text-calm-warning fill-calm-warning" />
            Credit Usage
          </div>
          <p className="text-calm-text-muted text-sm mb-8">Credits are used for advanced AI agent runs and document generation.</p>

          <div className="mb-10">
            <div className="flex justify-between text-sm font-medium mb-3">
              <span className="text-calm-text">{mockStudent.credits} Credits Remaining</span>
              <span className="text-calm-text-muted">500 Total</span>
            </div>
            <Progress value={(mockStudent.credits / 500) * 100} className="h-2 bg-calm-surface-2" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* +100 Credits */}
            <div className="p-5 rounded-xl border border-calm-border bg-calm-surface-2 flex items-center justify-between">
              <div>
                <div className="font-semibold text-calm-text text-lg">+100 Credits</div>
                <div className="text-sm text-calm-text-muted mt-0.5">£10.00</div>
              </div>
              <button
                onClick={() =>
                  setSelectedItem({
                    name: "+100 AdmitOS Credits",
                    description: "AI agent execution credits — never expire",
                    amount: 10,
                    credits: 100,
                  })
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-calm-primary text-white hover:bg-calm-primary-hover transition-colors shadow-sm"
              >
                Buy
              </button>
            </div>

            {/* +500 Credits */}
            <div className="p-5 rounded-xl border border-calm-primary/30 bg-calm-primary/5 flex items-center justify-between relative">
              <div className="absolute -top-2.5 right-4 bg-calm-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Save 20%
              </div>
              <div>
                <div className="font-semibold text-calm-text text-lg">+500 Credits</div>
                <div className="text-sm text-calm-text-muted mt-0.5">£40.00</div>
              </div>
              <button
                onClick={() =>
                  setSelectedItem({
                    name: "+500 AdmitOS Credits",
                    description: "AI agent execution credits — 20% off bundle",
                    amount: 40,
                    credits: 500,
                  })
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-calm-primary text-white hover:bg-calm-primary-hover transition-colors shadow-sm"
              >
                Buy
              </button>
            </div>
          </div>

          {/* Payment method note */}
          <p className="text-xs text-calm-text-muted mt-4 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Accepts credit card, WeChat Pay (微信支付) and Alipay (支付宝)
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-calm-surface text-calm-text border border-calm-border rounded-2xl p-8 shadow-md flex flex-col">
          <div className="flex items-center gap-2 text-lg font-medium text-calm-text mb-6">
            <CreditCard className="w-5 h-5 text-calm-text-muted" />
            Current Plan
          </div>

          <div className="text-4xl font-semibold tracking-tight mb-2">{mockStudent.planTier}</div>
          <div className="text-sm text-calm-text-muted mb-8">£49/month, renews Nov 1</div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-center gap-3 text-sm text-calm-text-muted">
              <CheckCircle2 className="w-4 h-4 text-calm-success shrink-0" /> 500 monthly credits
            </li>
            <li className="flex items-center gap-3 text-sm text-calm-text-muted">
              <CheckCircle2 className="w-4 h-4 text-calm-success shrink-0" /> Advanced agent planning
            </li>
            <li className="flex items-center gap-3 text-sm text-calm-text-muted">
              <CheckCircle2 className="w-4 h-4 text-calm-success shrink-0" /> Priority support
            </li>
          </ul>

          <button
            onClick={() => setManageOpen(true)}
            className="w-full py-3 rounded-xl bg-calm-surface text-calm-text font-medium hover:bg-calm-surface-2 transition-colors mt-auto border border-calm-border text-sm"
          >
            Manage Subscription
          </button>
        </div>
      </div>

      {/* Compare Plans */}
      <div className="pt-8 border-t border-calm-border">
        <h2 className="text-xl font-semibold text-calm-text mb-8">Compare Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-medium text-calm-text mb-2">Basic</h3>
            <div className="text-3xl font-semibold text-calm-text mb-6">
              £19<span className="text-base text-calm-text-muted font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text-muted shrink-0" /> 100 monthly credits
              </li>
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text-muted shrink-0" /> Basic school list
              </li>
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text-muted shrink-0" /> Standard roadmap
              </li>
            </ul>
            <button
              onClick={() =>
                setSelectedItem({
                  name: "AdmitOS Basic",
                  description: "100 monthly credits · Standard roadmap",
                  amount: 19,
                  plan: "basic",
                  isSubscription: true,
                })
              }
              className="w-full py-2.5 rounded-xl border border-calm-primary/40 text-sm font-medium text-calm-primary bg-calm-primary/5 hover:bg-calm-primary/10 transition-colors mt-auto"
            >
              Downgrade to Basic
            </button>
          </div>

          {/* Plus (Current) */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 flex flex-col relative shadow-sm">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-calm-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Current
            </div>
            <h3 className="text-lg font-medium text-calm-text mb-2">Plus</h3>
            <div className="text-3xl font-semibold text-calm-text mb-6">
              £49<span className="text-base text-calm-text-muted font-normal">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> 500 monthly credits
              </li>
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> Advanced agent planning
              </li>
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text shrink-0" /> Document generation
              </li>
            </ul>
            <button
              disabled
              className="w-full py-2.5 rounded-xl border border-calm-border text-sm font-medium text-calm-text-muted bg-calm-surface-2 cursor-not-allowed mt-auto"
            >
              Current Plan
            </button>
          </div>

          {/* Premium */}
          <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-medium text-calm-text mb-2">Premium</h3>
            <div className="text-3xl font-semibold text-calm-text mb-6">Custom</div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text-muted shrink-0" /> Unlimited credits
              </li>
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text-muted shrink-0" /> Dedicated counsellor
              </li>
              <li className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                <CheckCircle2 className="w-4 h-4 text-calm-text-muted shrink-0" /> 1:1 strategy sessions
              </li>
            </ul>
            <button className="w-full py-2.5 rounded-xl border border-calm-border text-sm font-medium text-calm-text-muted bg-calm-surface hover:bg-calm-surface-2 transition-colors mt-auto">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      {/* Manage Subscription Modal */}
      <ManageSubscriptionModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
      />
    </div>
  );
}
