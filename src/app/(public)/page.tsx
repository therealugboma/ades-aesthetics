import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeServices, HomeProducts } from "@/components/home/HomeContent";

export const metadata: Metadata = {
  title: "Ades Aesthetics | Premium Beauty Services in Lagos",
  description:
    "Ades Aesthetics offers premium beauty services in Lagos, Nigeria. Expert nail care, lash extensions, brow styling, and skin treatments in a relaxing atmosphere.",
  openGraph: {
    title: "Ades Aesthetics | Premium Beauty Services in Lagos",
    description:
      "Premium beauty services in Lagos, Nigeria. Book your appointment today.",
    type: "website",
  },
};

const features = [
  {
    title: "Expert Technicians",
    description:
      "Our certified beauty professionals bring years of experience to every treatment.",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
  },
  {
    title: "Premium Products",
    description:
      "We use only top-quality, professional-grade products for all our services.",
    icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z",
  },
  {
    title: "Relaxing Atmosphere",
    description:
      "Unwind in our luxurious salon designed for your comfort and peace of mind.",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z",
  },
];

const galleryImages = [
  { src: "/services/premium/gel-french-pink.webp", alt: "Gel manicure artwork", category: "nails" },
  { src: "/services/premium/wispy-lashes-portrait.webp", alt: "Lash extensions", category: "lashes" },
  { src: "/services/premium/biab-yellow-pattern.webp", alt: "BIAB nail pattern", category: "nails" },
  { src: "/services/premium/hybrid-lashes-front.webp", alt: "Hybrid lashes", category: "lashes" },
  { src: "/services/premium/acrylic-long.webp", alt: "Acrylic nail design", category: "nails" },
  { src: "/services/premium/classic-lashes.webp", alt: "Classic lashes", category: "lashes" },
];

const testimonials = [
  {
    name: "Chidinma O.",
    text: "Ades Aesthetics transformed my nails! The attention to detail is unmatched. I get compliments every time.",
    rating: 5,
  },
  {
    name: "Temi A.",
    text: "Best lash experience in Lagos. The technicians are so gentle and professional. My lashes look absolutely stunning.",
    rating: 5,
  },
  {
    name: "Ngozi E.",
    text: "The HydraFacial was incredible. My skin has never looked this radiant. I've become a regular customer.",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-amber-50">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Ades Aesthetics
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
                Premium Beauty Services in Lagos
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/booking"
                  className="rounded-full bg-rose-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-colors"
                >
                  Book Appointment
                </Link>
                <Link
                  href="/shop"
                  className="rounded-full border border-rose-600 px-8 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-colors"
                >
                  Shop Products
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Featured Services
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Discover our most popular treatments crafted just for you.
              </p>
            </div>
            <HomeServices />
            <div className="mt-10 text-center">
              <Link
                href="/services"
                className="text-sm font-semibold text-rose-600 hover:text-rose-500 transition-colors"
              >
                View All Services &rarr;
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Why Choose Ades Aesthetics
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                We are committed to providing an exceptional beauty experience.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl bg-white p-8 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
                    <svg
                      className="h-6 w-6 text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Portfolio
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Browse our latest work and get inspired.
              </p>
            </div>
            <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-3">
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-xl"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={800}
                    height={1000}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                    className="aspect-[3/4] h-auto w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/gallery"
                className="text-sm font-semibold text-rose-600 hover:text-rose-500 transition-colors"
              >
                View Full Gallery &rarr;
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Products
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                Professional-grade beauty products for your daily routine.
              </p>
            </div>
            <HomeProducts />
            <div className="mt-10 text-center">
              <Link
                href="/shop"
                className="text-sm font-semibold text-rose-600 hover:text-rose-500 transition-colors"
              >
                View All Products &rarr;
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                What Our Clients Say
              </h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <svg
                        key={i}
                        className="h-5 w-5 text-amber-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="mt-4 text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Visit Us
                </h2>
                <div className="mt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <svg
                      className="h-6 w-6 text-rose-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Address
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        34, Beach Road, Police Post Ebutte
                        <br />
                        Ikorodu, Lagos, Nigeria
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg
                      className="h-6 w-6 text-rose-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Business Hours
                      </h3>
                      <ul className="mt-1 space-y-1 text-sm text-gray-600">
                        <li>Monday - Saturday: 10:00 AM - 7:00 PM</li>
                        <li>Sunday: Closed</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <svg
                      className="h-6 w-6 text-rose-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Phone
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        +234 816 469 5802
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <a
                  href="https://www.google.com/maps/search/34+Beach+Road+Police+Post+Ebutte+Ikorodu+Lagos+Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-80 w-full flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gradient-to-br from-rose-50 to-pink-50 p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 mb-4">
                    <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">34, Beach Road, Ikorodu</p>
                  <p className="text-xs text-gray-500 mt-1">Lagos, Nigeria</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-rose-600">
                    Get Directions
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
