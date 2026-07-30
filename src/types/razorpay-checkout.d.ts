// Ambient type for the global window.Razorpay object that Checkout.js
// (loaded from https://checkout.razorpay.com/v1/checkout.js) attaches —
// there's no official npm types package for this, it's a plain script tag.
interface RazorpayCheckoutOptions {
  key: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  order_id?: string;
  subscription_id?: string;
  prefill?: { contact?: string; name?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature: string;
  }) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayCheckoutInstance {
  open(): void;
  on(event: string, handler: (response: unknown) => void): void;
}

interface Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
}
