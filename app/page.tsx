import { MailApp } from "@/components/mail-app";

export default function HomePage() {
  const domains = (process.env.NEXT_PUBLIC_MAIL_DOMAINS || "mail.domainanda.com")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  return <MailApp domains={domains} />;
}
