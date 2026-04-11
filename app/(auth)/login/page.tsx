import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { RouteHeader } from "@/src/components/ui/route-header";

export default function LoginPage() {
  return (
    <div className="grid gap-6">
      <RouteHeader
        description="Placeholder login page for the future credentials flow. This route intentionally omits forms, validation, and session handling."
        eyebrow="Route /login"
        title="Login Page"
      />
      <PlaceholderList
        items={[
          "Reserved for email and password sign-in.",
          "Will use the shared authentication layout wrapper.",
          "Contains static placeholder content only in this scaffold.",
        ]}
      />
    </div>
  );
}
