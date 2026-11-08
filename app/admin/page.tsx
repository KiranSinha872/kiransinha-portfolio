import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal | Kiran Sinha',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AdminRootPage() {
  redirect('/admin/dashboard');
}
