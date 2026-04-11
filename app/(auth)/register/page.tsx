import { PlaceholderList } from "@/src/components/ui/placeholder-list";
import { RouteHeader } from "@/src/components/ui/route-header";

export default function RegisterPage() {
  return (
    <div className="grid gap-6">
      <RouteHeader
        description="Placeholder registration page for the future account creation flow. This route intentionally omits forms, validation, and auth integration."
        eyebrow="Route /register"
        title="Register Page"
      />
      <PlaceholderList
        items={[
          "Reserved for future email and password registration.",
          "Uses the same shared authentication shell as /login.",
          "Contains static placeholder content only in this scaffold.",
        ]}
      />
    </div>
  );
}
