import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_URL,
  WHATSAPP_URL,
} from "@/lib/site";

export const metadata = {
  title: "Refund Policy | Ades Aesthetics",
  description: "Refund and cancellation policy for Ades Aesthetics beauty services and products.",
};

export default function RefundPolicyPage() {
  return (
    <main className="flex-1 bg-white">
      <section className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Refund & Cancellation Policy
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Last updated: August 2026
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none space-y-10">

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Service Bookings</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Deposit Policy:</strong> A 30% deposit is required to confirm all service bookings. This deposit secures your appointment time and is deducted from the total service cost.
                </p>
                <p>
                  <strong>Cancellation by Customer:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cancellations made <strong>24 hours or more</strong> before the appointment time will receive a <strong>full refund</strong> of the deposit.</li>
                  <li>Cancellations made <strong>less than 24 hours</strong> before the appointment time will <strong>not be eligible</strong> for a deposit refund.</li>
                  <li>No-shows will forfeit the deposit entirely.</li>
                </ul>
                <p>
                  <strong>Rescheduling:</strong> You may reschedule your appointment at no extra cost if done at least 12 hours before the original appointment time. Rescheduling within 12 hours may incur a 10% administrative fee.
                </p>
                <p>
                  <strong>Cancellation by Ades Aesthetics:</strong> If we need to cancel or reschedule your appointment due to unforeseen circumstances, you will receive a full refund of any deposit paid, or the option to reschedule at no additional cost.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Product Orders</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Full Payment:</strong> All product orders require full payment at the time of purchase. There are no deposits or partial payments for products.
                </p>
                <p>
                  <strong>Returns:</strong> Due to the nature of beauty and personal care products, we accept returns only for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Products that are <strong>damaged or defective</strong> upon delivery</li>
                  <li>Products that are <strong>significantly different</strong> from what was ordered</li>
                  <li>Unopened products returned within <strong>7 days</strong> of delivery</li>
                </ul>
                <p>
                  <strong>Non-Returnable Items:</strong> Opened or used products, gift cards, and promotional items cannot be returned or refunded.
                </p>
                <p>
                  <strong>Refund Process:</strong> To request a return or refund, contact us within 7 days of delivery with your order number and photos of the product (if damaged/defective). Refunds will be processed within 5-10 business days to the original payment method.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Delivery</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Delivery Fees:</strong> Delivery fees are non-refundable once the delivery process has been initiated.
                </p>
                <p>
                  <strong>Failed Deliveries:</strong> If a delivery fails due to incorrect address information provided by the customer, the customer will bear the cost of re-delivery. If the product is returned to us, a refund will be issued minus the delivery cost.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How to Request a Refund</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>To request a refund, please contact us through any of the following channels:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>WhatsApp:</strong> <a href={WHATSAPP_URL} className="text-rose-600 hover:text-rose-700 underline">Chat with us</a></li>
                  <li><strong>Phone:</strong> <a href={BUSINESS_PHONE_URL} className="text-rose-600 hover:text-rose-700 underline">{BUSINESS_PHONE_DISPLAY}</a></li>
                  <li><strong>Email:</strong> <a href="mailto:adesaesthetics@gmail.com" className="text-rose-600 hover:text-rose-700 underline">adesaesthetics@gmail.com</a></li>
                </ul>
                <p>
                  Please include your order/booking reference number, the reason for your refund request, and any supporting evidence (photos for damaged products). We aim to respond to all refund requests within 24 hours.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Processing Time</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service booking refunds:</strong> Processed within 3-5 business days</li>
                  <li><strong>Product order refunds:</strong> Processed within 5-10 business days</li>
                  <li>Refunds are made to the original payment method used during checkout</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disputes</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  If you are unsatisfied with the outcome of your refund request, you may escalate the matter by contacting us directly. We are committed to resolving all disputes fairly and promptly. We encourage open communication to reach a mutually agreeable resolution.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Ades Aesthetics reserves the right to update this refund policy at any time. Changes will be posted on this page with an updated revision date. We encourage customers to review this policy periodically.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
