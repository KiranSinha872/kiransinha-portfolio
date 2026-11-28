import PublicHeader from '@/components/layout/Header';
import PublicFooter from '@/components/layout/Footer';
import { getProfile } from '@/lib/services/firestore';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import SmoothScroll from '@/components/layout/SmoothScroll';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  return (
    <ThemeProvider>
      <SmoothScroll>
        <div className="public-site min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased transition-colors duration-300">
          <PublicHeader profile={profile} />
          <main className="flex-1">{children}</main>
          <PublicFooter profile={profile} />
        </div>
      </SmoothScroll>
    </ThemeProvider>
  );
}
