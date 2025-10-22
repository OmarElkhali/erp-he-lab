// resources/js/Pages/Notifications/AdminIndex.jsx
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { FaCheck, FaTimes, FaEye, FaDownload, FaFilePdf, FaBell } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function NotificationsIndex({ auth, notifications }) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleAccept = async (notificationId, demandeId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous allez accepter cette demande!",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Oui, accepter!',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      // Mettre à jour la notification
      await axios.put(`/notifications/${notificationId}`, {
        is_accepted: true,
        is_read: true
      });

      // Mettre à jour le statut de la demande
      await axios.post(`/admin/demandes/${demandeId}/accepter`);

      // Mettre à jour localement
      setLocalNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_accepted: true, is_read: true }
            : notif
        )
      );

      await Swal.fire({
        title: 'Acceptée!',
        text: 'La demande a été acceptée avec succès. Une notification a été envoyée à l\'utilisateur.',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 3000
      });
    } catch (error) {
      console.error('Erreur:', error);
      await Swal.fire({
        title: 'Erreur!',
        text: 'Une erreur est survenue lors de l\'acceptation.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleReject = async (notificationId, demandeId) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous allez refuser cette demande!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Oui, refuser!',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      // Mettre à jour la notification
      await axios.put(`/notifications/${notificationId}`, {
        is_accepted: false,
        is_read: true
      });

      // Mettre à jour le statut de la demande
      await axios.post(`/admin/demandes/${demandeId}/refuser`);

      // Mettre à jour localement
      setLocalNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_accepted: false, is_read: true }
            : notif
        )
      );

      await Swal.fire({
        title: 'Refusée!',
        text: 'La demande a été refusée. Une notification a été envoyée à l\'utilisateur.',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 3000
      });
    } catch (error) {
      console.error('Erreur:', error);
      await Swal.fire({
        title: 'Erreur!',
        text: 'Une erreur est survenue lors du refus.',
        icon: 'error',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  // Filtrer les notifications (uniquement les nouvelles demandes pour l'admin)
  const newDemandNotifications = localNotifications.filter(
    n => n.type === 'nouvelle_demande'
  );

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Notifications Administrateur" />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#26658C]">Notifications des Demandes</h1>
        <p className="text-gray-600">
          {newDemandNotifications.filter(n => !n.is_read).length} nouvelle(s) demande(s) en attente
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {newDemandNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <p className="text-gray-500 text-lg mb-2">Aucune nouvelle demande en attente</p>
            <p className="text-gray-400">Les nouvelles demandes apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code Affaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Demande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Postes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {newDemandNotifications.map((notification) => (
                  <tr 
                    key={notification.id} 
                    className={`hover:bg-gray-50 transition duration-150 ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-semibold text-gray-900">
                          {notification.data.code_affaire}
                        </div>
                        {!notification.is_read && (
                          <FaBell className="w-3 h-3 text-[#26658C] animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {notification.data.entreprise}
                      </div>
                      <div className="text-sm text-gray-500">
                        ICE: {notification.data.ice}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {notification.data.site}
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.data.ville}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(notification.data.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {notification.data.postes_count} poste(s)
                      </div>
                      <div className="text-xs text-gray-500">
                        Matrice: {notification.data.matrice}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        notification.is_accepted === true 
                          ? 'bg-green-100 text-green-800'
                          : notification.is_accepted === false
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.is_accepted === true 
                          ? '✓ Acceptée' 
                          : notification.is_accepted === false
                          ? '✗ Refusée'
                          : '⏳ En attente'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        {/* Icône Voir - Toujours visible */}
                        <Link
                          href={route('demandes.show', notification.data.demande_id)}
                          className="text-[#26658C] hover:text-blue-800 transition duration-150 transform hover:scale-110"
                          title="Voir les détails de la demande"
                        >
                          <FaEye className="w-5 h-5" />
                        </Link>

                        {/* Actions d'acceptation/refus - seulement si en attente */}
                        {notification.is_accepted === null && (
                          <>
                            <button
                              onClick={() => handleAccept(notification.id, notification.data.demande_id)}
                              className="text-[#26658C] hover:text-green-700 transition duration-150 transform hover:scale-110"
                              title="Accepter la demande"
                            >
                              <FaCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(notification.id, notification.data.demande_id)}
                              className="text-[#26658C] hover:text-red-700 transition duration-150 transform hover:scale-110"
                              title="Refuser la demande"
                            >
                              <FaTimes className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Icône Télécharger - seulement si acceptée */}
                        {notification.is_accepted === true && (
                          <button
                            onClick={() => {
                              // Logique de téléchargement du devis
                              console.log('Télécharger devis pour:', notification.data.code_affaire);
                            }}
                            className="text-[#26658C] hover:text-purple-700 transition duration-150 transform hover:scale-110"
                            title="Télécharger le devis"
                          >
                            <FaDownload className="w-5 h-5" />
                          </button>
                        )}

                        {/* Icône PDF - seulement si acceptée */}
                        {notification.is_accepted === true && (
                          <button
                            onClick={() => {
                              // Logique de génération PDF
                              console.log('Générer PDF pour:', notification.data.code_affaire);
                            }}
                            className="text-[#26658C] hover:text-red-700 transition duration-150 transform hover:scale-110"
                            title="Générer le PDF"
                          >
                            <FaFilePdf className="w-5 h-5" />
                          </button>
                        )}
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