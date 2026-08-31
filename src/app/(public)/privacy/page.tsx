import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_URL,
} from "@/lib/site";

export const metadata = {
  title: "Privacy Policy | Ades Aesthetics",
  description: "Privacy policy for Ades Aesthetics beauty services.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="flex-1 bg-white">
      <section className="bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Privacy Policy
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>We collect information you provide directly:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, phone number when you book services or create an account</li>
                  <li>Delivery address for product orders</li>
                  <li>Payment information (processed securely via Paystack — we do not store card details)</li>
                  <li>Booking preferences and notes</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <ul className="list-disc pl-6 space-y-2">
                  <li>To process bookings and orders</li>
                  <li>To communicate about appointments and order status</li>
                  <li>To send promotional offers (with your consent)</li>
                  <li>To improve our services</li>
                  <li>To respond to your inquiries</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  We implement appropriate security measures to protect your personal information. Payment processing is handled securely by Paystack, and we do not store your payment card details on our servers.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Us</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>For questions about this privacy policy, contact us at:</p>
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
