import { redirect } from 'next/navigation';

export default function AttendanceRootPage() {
    redirect('/dashboard/attendance/overview');
}
