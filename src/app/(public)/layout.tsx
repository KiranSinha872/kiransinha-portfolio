import PublicHeader from '@/components/layout/Header';
import PublicFooter from '@/components/layout/Footer';
import { getProfile } from '@/lib/services/firestore';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <div className="public-site min-h-screen flex flex-col bg-[#F9F9F9] text-[#121212] font-sans antialiased">
      <PublicHeader profile={profile} />
      <main className="flex-1">{children}</main>
      <PublicFooter profile={profile} />
    </div>
  );
}
