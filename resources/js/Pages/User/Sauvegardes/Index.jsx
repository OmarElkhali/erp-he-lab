// resources/js/Pages/User/Sauvegardes/Index.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaEdit, FaTrash, FaEye, FaFileAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function SauvegardesIndex({ auth, sauvegardes }) {
    const handleDelete = async (sauvegardeId, nomSauvegarde) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: `Voulez-vous vraiment supprimer le brouillon "${nomSauvegarde}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#26658C',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler',
            background: '#fff',
            color: '#333',
            customClass: {
                popup: 'text-sm'
            }
        });

        if (result.isConfirmed) {
            router.delete(route('sauvegardes.destroy', sauvegardeId), {
                onSuccess: () => {
                    Swal.fire({
                        title: 'Supprimé!',
                        text: 'Le brouillon a été supprimé avec succès.',
                        icon: 'success',
                        confirmButtonColor: '#26658C',
                        background: '#fff',
                        color: '#333',
                        customClass: {
                            popup: 'text-sm'
                        }
                    });
                },
                onError: () => {
                    Swal.fire({
                        title: 'Erreur!',
                        text: 'Une erreur est survenue lors de la suppression.',
                        icon: 'error',
                        confirmButtonColor: '#d33',
                        background: '#fff',
                        color: '#333',
                        customClass: {
                            popup: 'text-sm'
                        }
                    });
                }
            });
        }
    };

    const handleContinue = (sauvegarde) => {
        Swal.fire({
            title: 'Continuer le brouillon',
            text: `Voulez-vous continuer l'édition de "${sauvegarde.nom_sauvegarde}" ?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#26658C',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Continuer',
            cancelButtonText: 'Annuler',
            background: '#fff',
            color: '#333',
            customClass: {
                popup: 'text-sm'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.visit(route('sauvegardes.show', sauvegarde.id));
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mes brouillons sauvegardés" />
            
            <div className="mb-4">
                <h1 className="text-xl font-bold text-[#26658C]">Mes brouillons sauvegardés</h1>
                <p className="text-gray-600 text-sm">
                    {sauvegardes.length} brouillon(s) en cours
                </p>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                {sauvegardes.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 mb-3">
                            <FaFileAlt className="w-12 h-12 mx-auto opacity-50" />
                        </div>
                        <p className="text-gray-500 text-sm mb-2">Aucun brouillon sauvegardé</p>
                        <p className="text-gray-400 text-xs">
                            Vos formulaires en cours apparaîtront ici lorsque vous les sauvegarderez
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nom
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Matrice
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Étape
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Dernière modification
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sauvegardes.map((sauvegarde) => (
                                    <tr key={sauvegarde.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FaFileAlt className="text-[#26658C] mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {sauvegarde.nom_sauvegarde}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ICE: {sauvegarde.data?.ice || 'Non renseigné'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {sauvegarde.matrice?.label || 'Non spécifiée'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                sauvegarde.current_step === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                sauvegarde.current_step === 2 ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                Étape {sauvegarde.current_step}/3
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(sauvegarde.updated_at).toLocaleDateString('fr-FR')} à{' '}
                                            {new Date(sauvegarde.updated_at).toLocaleTimeString('fr-FR', { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleContinue(sauvegarde)}
                                                    className="text-[#26658C] hover:text-blue-800 transition duration-150 transform hover:scale-110"
                                                    title="Continuer l'édition"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(sauvegarde.id, sauvegarde.nom_sauvegarde)}
                                                    className="text-[#26658C] hover:text-red-700 transition duration-150 transform hover:scale-110"
                                                    title="Supprimer le brouillon"
                                                >
                                                    <FaTrash className="w-4 h-4" />
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