import { MailApp } from "@/components/mail-app";
import { listAvailableDomains } from "@/lib/domains";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const configuredDomains = await listAvailableDomains().catch(() => []);
  const domains = configuredDomains.length ? configuredDomains : ["mail.domainanda.com"];

  return <MailApp domains={domains} />;
}
