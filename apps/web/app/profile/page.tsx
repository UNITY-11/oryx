import { ProfileDashboard } from "@/features/profile/profile-dashboard";

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-6 pb-6">
        <h1 className="font-serif text-3xl font-medium text-primary-dark">My Profile</h1>
      </div>
      <ProfileDashboard />
    </div>
  );
}
