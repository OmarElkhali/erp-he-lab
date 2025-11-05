// resources/js/Pages/User/Sauvegardes/Index.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';

export default function SauvegardesIndex({ auth, sauvegardes }) {
    const handleDelete = (sauvegardeId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
            router.delete(route('sauvegardes.destroy', sauvegardeId));
        }
    };

    const handleContinue = (sauvegarde) => {
        router.visit(route('sauvegardes.show', sauvegarde.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mes brouillons sauvegardés" />
            
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#26658C]">Mes brouillons sauvegardés</h1>
                <p className="text-gray-600">
                    {sauvegardes.length} brouillon(s) en cours
                </p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {sauvegardes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📝</div>
                        <p className="text-gray-500 text-lg mb-2">Aucun brouillon sauvegardé</p>
                        <p className="text-gray-400">
                            Vos formulaires en cours apparaîtront ici lorsque vous les sauvegarderez
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Matrice
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Étape
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dernière modification
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sauvegardes.map((sauvegarde) => (
                                    <tr key={sauvegarde.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaFileAlt className="text-blue-500 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {sauvegarde.nom_sauvegarde}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ICE: {sauvegarde.data.ice || 'Non renseigné'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {sauvegarde.matrice.label}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                sauvegarde.current_step === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                sauvegarde.current_step === 2 ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                Étape {sauvegarde.current_step}/3
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(sauvegarde.updated_at).toLocaleDateString('fr-FR')} à{' '}
                                            {new Date(sauvegarde.updated_at).toLocaleTimeString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleContinue(sauvegarde)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                    <span>Continuer</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sauvegarde.id)}
                                                    className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                    <span>Supprimer</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}