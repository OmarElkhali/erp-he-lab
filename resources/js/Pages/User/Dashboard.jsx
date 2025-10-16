import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UserDashboard({ auth }) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="User Dashboard" />
      <div className="container mx-auto mt-10">
        <h1 className="text-3xl font-bold text-green-600">Tableau de bord Utilisateur</h1>
        <p className="mt-4">Bienvenue dans l’espace utilisateur 👤</p>
      </div>
    </AuthenticatedLayout>
  );
}
