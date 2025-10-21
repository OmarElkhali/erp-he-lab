// resources/js/Pages/Notifications/Index.jsx
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { FaCheck, FaTimes, FaEye, FaBuilding, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaCalendar } from 'react-icons/fa';

export default function NotificationsIndex({ notifications, auth }) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const handleAccept = async (notificationId, demandeId) => {
    try {
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

      alert('Demande acceptée avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async (notificationId, demandeId) => {
    try {
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

      alert('Demande refusée !');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du refus');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}`, {
        is_read: true
      });

      setLocalNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  // Marquer toutes comme lues
  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/mark-all-read');
      setLocalNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <AuthenticatedLayout user={auth.user} header="Notifications Administrateur">
      <Head title="Notifications" />

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#26658C]">Notifications</h1>
          <p className="text-gray-600">
            {localNotifications.filter(n => !n.is_read).length} notification(s) non lue(s)
          </p>
        </div>
        
        {localNotifications.filter(n => !n.is_read).length > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-4">
        {localNotifications.map(notification => (
          <div 
            key={notification.id} 
            className={`p-6 border rounded-lg transition-all duration-200 ${
              notification.is_read 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-white border-blue-300 shadow-md'
            }`}
            onMouseEnter={() => !notification.is_read && markAsRead(notification.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {!notification.is_read && (
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                  <h3 className="font-semibold text-lg text-[#26658C]">
                    📋 Nouvelle demande d'analyse
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    notification.is_accepted === true 
                      ? 'bg-green-100 text-green-800'
                      : notification.is_accepted === false
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {notification.is_accepted === true 
                      ? 'Acceptée' 
                      : notification.is_accepted === false
                      ? 'Refusée'
                      : 'En attente'
                    }
                  </span>
                </div>

                {/* Détails de la demande */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaBuilding className="text-gray-400" />
                      <div>
                        <span className="font-medium">Entreprise:</span>
                        <span className="ml-2">{notification.data.entreprise}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <div>
                        <span className="font-medium">Site:</span>
                        <span className="ml-2">{notification.data.site} - {notification.data.ville}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaUser className="text-gray-400" />
                      <div>
                        <span className="font-medium">Contact:</span>
                        <span className="ml-2">{notification.data.contact_nom}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaEnvelope className="text-gray-400" />
                      <div>
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{notification.data.contact_email}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaPhone className="text-gray-400" />
                      <div>
                        <span className="font-medium">Téléphone:</span>
                        <span className="ml-2">{notification.data.contact_tel}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaCalendar className="text-gray-400" />
                      <div>
                        <span className="font-medium">Date:</span>
                        <span className="ml-2">
                          {new Date(notification.data.date_creation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informations supplémentaires */}
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Code Affaire:</strong> {notification.data.code_affaire} • 
                    <strong> Matrice:</strong> {notification.data.matrice} • 
                    <strong> Postes:</strong> {notification.data.postes_count} poste(s)
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                {notification.is_accepted === null ? (
                  <>
                    <button
                      onClick={() => handleAccept(notification.id, notification.data.demande_id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
                    >
                      <FaCheck className="w-4 h-4" />
                      <span>Accepter</span>
                    </button>
                    <button
                      onClick={() => handleReject(notification.id, notification.data.demande_id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center space-x-2"
                    >
                      <FaTimes className="w-4 h-4" />
                      <span>Refuser</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    notification.is_accepted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {notification.is_accepted ? '✓ Acceptée' : '✗ Refusée'}
                  </span>
                )}
                
                <Link
                  href={route('demandes.show', notification.data.demande_id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2 text-center justify-center"
                >
                  <FaEye className="w-4 h-4" />
                  <span>Voir détails</span>
                </Link>
              </div>
            </div>

            <div className="text-xs text-gray-500 border-t pt-2 mt-2">
              Reçue le {new Date(notification.created_at).toLocaleString('fr-FR')}
            </div>
          </div>
        ))}

        {localNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <p className="text-gray-500 text-lg mb-2">Aucune notification pour le moment</p>
            <p className="text-gray-400">Les nouvelles demandes apparaîtront ici</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}