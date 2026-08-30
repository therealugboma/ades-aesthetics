const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (
  configuredSiteUrl || "https://www.adesaesthetics.store"
).replace(/\/$/, "");

export const WHATSAPP_NUMBER = "2348164695802";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ades_aesthetics",
  facebook: "https://facebook.com/adesaesthetics",
  tiktok: "https://www.tiktok.com/@ades_aesthetics",
} as const;

export function buildWhatsAppUrl(message: string) {
  const url = new URL(WHATSAPP_URL);
  url.searchParams.set("text", message);
  return url.toString();
}
