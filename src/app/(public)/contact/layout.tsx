import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Ades Aesthetics",
  description: "Contact Ades Aesthetics in Ikorodu, Lagos by email, phone, WhatsApp, or the website form.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
