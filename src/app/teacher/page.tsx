import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TeacherDashboard from '@/components/TeacherDashboard';

export default async function TeacherPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  if (session.user?.role !== 'teacher') {
    redirect('/');
  }

  return <TeacherDashboard />;
}