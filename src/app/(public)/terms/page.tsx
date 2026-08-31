import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_URL,
} from "@/lib/site";

export const metadata = {
  title: "Terms of Service | Ades Aesthetics",
  description: "Terms of service for Ades Aesthetics beauty services and products.",
};

export default function TermsPage() {
  return (
    <main className="flex-1 bg-white">
      <section className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Terms of Service
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Services</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Ades Aesthetics provides beauty services including nail care, lash extensions, brow styling, and skin treatments. All services are performed by trained professionals. Service availability may vary by location and appointment availability.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Booking & Payment</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li>A 30% deposit is required to confirm service bookings</li>
                  <li>Full payment is required for product orders at checkout</li>
                  <li>All payments are processed securely via Paystack</li>
                  <li>Prices are listed in Nigerian Naira (₦) and include applicable taxes</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Product Orders</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Products are subject to availability. We reserve the right to cancel orders if products are out of stock. In such cases, a full refund will be issued. Product images are for illustration purposes and actual products may vary slightly.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellations & Refunds</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Please refer to our <a href="/refund-policy" className="text-rose-600 hover:text-rose-700 underline">Refund & Cancellation Policy</a> for detailed information about cancellations, returns, and refunds.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Ades Aesthetics shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or products. Our liability is limited to the amount paid for the specific service or product in question.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>For questions about these terms, contact us at:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Email: adesaesthetics@gmail.com</li>
                  <li>Phone: <a href={BUSINESS_PHONE_URL} className="text-rose-600 hover:text-rose-700 underline">{BUSINESS_PHONE_DISPLAY}</a></li>
                  <li>Address: 34, Beach Road, Police Post Ebutte, Ikorodu, Lagos, Nigeria</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
