import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CreditCard, ShieldCheck, Loader2, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod =
  | "card"
  | "apple_pay"
  | "google_pay"
  | "paypal"
  | "link"
  | "klarna"
  | "afterpay"
  | "bacs_debit"
  | "wechat_pay"
  | "alipay";

export interface PaymentItem {
  name: string;
  description: string;
  amount: number; // GBP
  credits?: number;
  plan?: string;
  isSubscription?: boolean;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  item: PaymentItem | null;
}

// ── Icon Components ────────────────────────────────────────────────────────────

function ApplePayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.543 12.116c-.022-2.065 1.686-3.063 1.763-3.112-.961-1.406-2.455-1.598-2.985-1.621-1.27-.129-2.484.748-3.127.748-.643 0-1.637-.729-2.694-.71-1.387.021-2.672.808-3.386 2.051-1.443 2.502-.369 6.202 1.037 8.231.687.993 1.508 2.107 2.586 2.067 1.039-.042 1.431-.669 2.688-.669 1.257 0 1.609.669 2.706.648 1.114-.021 1.821-.999 2.504-1.995.791-1.145 1.117-2.255 1.135-2.311-.025-.011-2.174-.833-2.197-3.327zm-2.06-6.104c.572-.693.957-1.655.852-2.612-.824.033-1.82.549-2.412 1.242-.53.614-.994 1.596-.869 2.537.917.071 1.854-.465 2.429-1.167z" />
    </svg>
  );
}

function GooglePayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M11.99 10.93v2.29h3.6c-.15.99-.56 1.72-1.18 2.23l1.91 1.48c1.11-1.03 1.75-2.54 1.75-4.33 0-.43-.04-.84-.1-1.24l-5.98-.43z" fill="#4285F4"/>
      <path d="M6.31 12.64c-.11-.34-.17-.69-.17-1.06s.06-.72.17-1.06V8.95H4.25A6.89 6.89 0 0 0 3.5 11.58c0 .92.18 1.8.75 2.63l1.81-1.41-.75-.16z" fill="#FBBC05"/>
      <path d="M11.99 7.5c.99 0 1.88.34 2.58.99l1.93-1.93A6.9 6.9 0 0 0 11.99 4.5a6.9 6.9 0 0 0-6.16 3.8l2.15 1.67c.51-1.53 1.93-2.47 4.01-2.47z" fill="#EA4335"/>
      <path d="M11.99 18.5c2.16 0 3.98-.72 5.3-1.95l-1.91-1.48c-.72.48-1.63.77-2.68.77-2.07 0-3.83-1.4-4.44-3.29l-2.06 1.59A7 7 0 0 0 11.99 18.5z" fill="#34A853"/>
    </svg>
  );
}

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.067 8.478c.492.315.844.825.983 1.39.544 2.226-.921 4.757-3.934 4.757h-.962a.672.672 0 0 0-.664.566l-.717 4.546H11.43l.717-4.546H9.895l-.15.952H7.402L8.63 8.478h11.437zm-1.714 1.322c-.078-.328-.339-.545-.673-.545H9.895L9.12 14.02h1.344l.717-4.546h4.017c.344 0 .618.245.56.577l-.566 3.589h.962c1.49 0 2.401-1.135 2.16-2.278a.981.981 0 0 0-.001-.562zM6.804 4h8.863c.492.315.844.825.983 1.39.544 2.226-.921 4.757-3.934 4.757H8.35L7.18 17.5H4.837L6.804 4z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
    </svg>
  );
}

function KlarnaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.592 2h2.77v20H4.59V2zm8.244 0c0 4.025-1.72 7.637-4.648 10.076L14.29 22h3.51l-6.42-10.285C13.568 9.276 15.1 5.782 15.1 2h-2.264zM17.18 19.304a2.697 2.697 0 1 1 5.395 0 2.697 2.697 0 0 1-5.394 0z" />
    </svg>
  );
}

function AfterpayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.996 2C6.478 2 2 6.478 2 11.996c0 2.64 1.03 5.037 2.701 6.82L2.516 22h4.508l.96-1.92A9.913 9.913 0 0 0 12 22c5.518 0 10-4.478 10-10.004C22 6.478 17.518 2 11.996 2zM9.5 14.5L6 12l6-3.5V14L9.5 14.5zm8.5-3L12 15v-5.5l3.5 2 2.5-1.5V11.5z" />
    </svg>
  );
}

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 4C5.36 4 2 6.92 2 10.5c0 2.05 1.06 3.87 2.73 5.05L4 18l2.35-1.17C7.12 17.26 8.29 17.5 9.5 17.5c.28 0 .55-.01.82-.04A5.97 5.97 0 0 1 10 15c0-3.31 2.69-6 6-6 .28 0 .56.02.83.05C16.17 6.63 13.07 4 9.5 4zm-2 4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm4 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
      <path d="M16 11c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-1 3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5zm2 0a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5z" />
    </svg>
  );
}

function AlipayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.422 15.358C19.256 14.267 16.15 12.72 14.4 11.853c.498-.985.882-2.085 1.102-3.253H18V7.2h-3.75V5.4h-1.35V7.2H9.15v1.4h3.75c-.204.882-.5 1.705-.875 2.428C10.678 9.995 9.014 9.6 7.8 9.6 5.578 9.6 4.2 10.845 4.2 12.6c0 1.8 1.35 2.85 3.6 2.85 1.694 0 3.298-.72 4.65-1.896 1.35.72 4.95 2.55 6.75 3.546L21.422 15.358zM7.8 14.1c-1.35 0-2.1-.54-2.1-1.5 0-.915.75-1.65 2.1-1.65 1.026 0 2.25.3 3.6.87C10.398 13.2 9.15 14.1 7.8 14.1z" />
    </svg>
  );
}

// ── Method groups ──────────────────────────────────────────────────────────────

interface MethodDef {
  id: PaymentMethod;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  /** methods not available for subscriptions */
  oneTimeOnly?: boolean;
  /** methods only for subscriptions (recurring) */
  subscriptionOnly?: boolean;
  badge?: string;
}

const METHOD_GROUPS: { title: string; methods: MethodDef[] }[] = [
  {
    title: "Express Checkout",
    methods: [
      {
        id: "apple_pay",
        label: "Apple Pay",
        sublabel: "Touch ID · Face ID",
        icon: <ApplePayIcon className="w-5 h-5" />,
        color: "text-calm-text",
      },
      {
        id: "google_pay",
        label: "Google Pay",
        sublabel: "Fast · Secure",
        icon: <GooglePayIcon className="w-5 h-5" />,
        color: "text-calm-text",
      },
      {
        id: "paypal",
        label: "PayPal",
        sublabel: "Pay with your PayPal account",
        icon: <PayPalIcon className="w-5 h-5" />,
        color: "text-[#003087]",
      },
      {
        id: "link",
        label: "Link",
        sublabel: "1-click checkout · Save payment info",
        icon: <LinkIcon className="w-5 h-5" />,
        color: "text-[#00D66B]",
        badge: "Fastest",
      },
    ],
  },
  {
    title: "Card",
    methods: [
      {
        id: "card",
        label: "Credit / Debit Card",
        sublabel: "Visa, Mastercard, Amex, Discover",
        icon: <CreditCard className="w-5 h-5" />,
        color: "text-calm-primary",
      },
    ],
  },
  {
    title: "Buy Now, Pay Later",
    methods: [
      {
        id: "klarna",
        label: "Klarna",
        sublabel: "Pay in 3 · 0% interest",
        icon: <KlarnaIcon className="w-5 h-5" />,
        color: "text-[#FFB3C7]",
        oneTimeOnly: true,
      },
      {
        id: "afterpay",
        label: "Clearpay / Afterpay",
        sublabel: "Pay in 4 instalments",
        icon: <AfterpayIcon className="w-5 h-5" />,
        color: "text-[#B2FCE4]",
        oneTimeOnly: true,
      },
    ],
  },
  {
    title: "Regional",
    methods: [
      {
        id: "wechat_pay",
        label: "微信支付",
        sublabel: "WeChat Pay",
        icon: <WeChatIcon className="w-5 h-5" />,
        color: "text-[#07C160]",
        oneTimeOnly: true,
      },
      {
        id: "alipay",
        label: "支付宝",
        sublabel: "Alipay",
        icon: <AlipayIcon className="w-5 h-5" />,
        color: "text-[#1677FF]",
      },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function PaymentModal({ open, onClose, item }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("apple_pay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) return null;

  // Filter methods based on context
  const visibleGroups = METHOD_GROUPS.map((group) => ({
    ...group,
    methods: group.methods.filter((m) => {
      if (item.isSubscription && m.oneTimeOnly) return false;
      return true;
    }),
  })).filter((g) => g.methods.length > 0);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = item.isSubscription
        ? "/api/payments/create-subscription-session"
        : "/api/payments/create-checkout-session";

      const body = item.isSubscription
        ? { plan: item.plan, paymentMethod: selectedMethod }
        : { amount: item.amount, credits: item.credits, paymentMethod: selectedMethod };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Payment failed. Please try again.");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const allMethods = visibleGroups.flatMap((g) => g.methods);
  const selectedDef = allMethods.find((m) => m.id === selectedMethod) ?? allMethods[0];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg">
          <div className="bg-calm-surface border border-calm-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-calm-border">
              <Dialog.Title className="text-sm font-semibold text-calm-text flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-calm-success" />
                Secure Checkout
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-calm-surface-2 transition-colors">
                  <X className="w-3.5 h-3.5 text-calm-text-muted" />
                </button>
              </Dialog.Close>
            </div>

            {/* Order Summary */}
            <div className="px-5 py-3 bg-calm-bg/40 border-b border-calm-border flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-calm-text">{item.name}</p>
                <p className="text-xs text-calm-text-muted">{item.description}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-lg font-semibold text-calm-text">£{item.amount.toFixed(2)}</p>
                {item.isSubscription && <p className="text-[11px] text-calm-text-muted">/month</p>}
              </div>
            </div>

            {/* Payment Methods — grouped, compact */}
            <div className="px-5 pt-3 pb-2 space-y-3">
              {visibleGroups.map((group) => (
                <div key={group.title}>
                  <p className="text-[9px] font-bold text-calm-text-muted uppercase tracking-widest mb-1.5 px-0.5">
                    {group.title}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.methods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left",
                          selectedMethod === method.id
                            ? "border-calm-primary bg-calm-primary/5 shadow-sm"
                            : "border-calm-border bg-calm-surface-2 hover:bg-calm-bg/60"
                        )}
                      >
                        {/* Radio dot */}
                        <div
                          className={cn(
                            "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            selectedMethod === method.id ? "border-calm-primary" : "border-calm-border"
                          )}
                        >
                          {selectedMethod === method.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-calm-primary" />
                          )}
                        </div>

                        {/* Icon */}
                        <span className={cn("shrink-0 w-4 h-4", method.color)}>{method.icon}</span>

                        {/* Labels */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-calm-text leading-tight truncate">{method.label}</p>
                          <p className="text-[10px] text-calm-text-muted truncate">{method.sublabel}</p>
                        </div>

                        {method.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-calm-success/15 text-calm-success flex items-center gap-0.5 shrink-0">
                            <Zap className="w-2 h-2" />
                            {method.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {item.isSubscription && (
                <p className="text-[10px] text-calm-text-muted">
                  Buy Now Pay Later &amp; WeChat Pay unavailable for subscriptions.
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mx-5 mb-2 flex items-start gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Pay button */}
            <div className="px-5 pb-4 pt-2 space-y-2 border-t border-calm-border mt-2">
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-calm-primary text-white font-semibold text-sm hover:bg-calm-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  <>
                    <span className={cn("shrink-0 w-4 h-4 opacity-80", selectedDef?.color)}>
                      {selectedDef?.icon}
                    </span>
                    Pay £{item.amount.toFixed(2)}{item.isSubscription ? "/mo" : ""}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-calm-text-muted">
                <ShieldCheck className="w-3 h-3" />
                256-bit SSL · Powered by Stripe
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
