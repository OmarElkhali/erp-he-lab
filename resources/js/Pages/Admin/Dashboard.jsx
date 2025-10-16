import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function AdminDashboard({ auth }) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Admin Dashboard" />
      <div className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold text-blue-600">Tableau de bord Administrateur</h1>
        <p className="mt-4">Bienvenue dans l’espace admin 👑</p>
      </div>
    </AuthenticatedLayout>
  );
}
