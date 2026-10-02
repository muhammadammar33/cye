import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/StatusBadge";
import { getSettings } from "@/lib/content";

export default async function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Open or close registrations, set notification inboxes and social links." />
      <div className="max-w-4xl">
        <SettingsForm settings={await getSettings()} />
      </div>
    </>
  );
}
