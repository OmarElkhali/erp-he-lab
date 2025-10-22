// resources/js/Pages/User/Notifications/Index.jsx
import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { FaCheck, FaTimes, FaEye, FaDownload, FaBell, FaFilePdf } from 'react-icons/fa';

export default function UserNotificationsIndex({ auth, notifications }) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

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

  const handleDownloadDevis = (demandeId) => {
    // Logique de téléchargement du devis
    console.log('Télécharger devis pour demande:', demandeId);
    // Implémentez la génération de PDF ici
  };

  // Filtrer les notifications utilisateur (acceptation/refus)
  const userNotifications = localNotifications.filter(
    n => n.type === 'demande_acceptee' || n.type === 'demande_refusee'
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'demande_acceptee':
        return <FaCheck className="w-5 h-5 text-green-500" />;
      case 'demande_refusee':
        return <FaTimes className="w-5 h-5 text-red-500" />;
      default:
        return <FaBell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'demande_acceptee':
        return 'Demande Acceptée ✅';
      case 'demande_refusee':
        return 'Demande Refusée ❌';
      default:
        return 'Notification';
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'demande_acceptee':
        return `Votre demande ${notification.data.code_affaire} a été acceptée. Vous pouvez maintenant télécharger le devis.`;
      case 'demande_refusee':
        return `Votre demande ${notification.data.code_affaire} a été refusée. Vous pouvez modifier votre demande.`;
      default:
        return notification.data.message || 'Nouvelle notification';
    }
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Mes Notifications" />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#26658C]">Mes Notifications</h1>
          <p className="text-gray-600">
            {userNotifications.filter(n => !n.is_read).length} notification(s) non lue(s)
          </p>
        </div>
        
        {userNotifications.filter(n => !n.is_read).length > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition duration-200"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-4">
        {userNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <p className="text-gray-500 text-lg mb-2">Aucune notification</p>
            <p className="text-gray-400">Les mises à jour de vos demandes apparaîtront ici</p>
          </div>
        ) : (
          userNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`bg-white rounded-lg shadow border-l-4 ${
                notification.type === 'demande_acceptee' 
                  ? 'border-l-green-500' 
                  : 'border-l-red-500'
              } ${!notification.is_read ? 'ring-2 ring-blue-100' : ''} transition duration-200`}
              onMouseEnter={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {getNotificationTitle(notification.type)}
                        </h3>
                        {!notification.is_read && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Nouveau
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {getNotificationMessage(notification)}
                      </p>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>
                          <strong>Entreprise:</strong> {notification.data.entreprise}
                        </p>
                        <p>
                          <strong>Matrice:</strong> {notification.data.matrice}
                        </p>
                        <p>
                          <strong>Code Affaire:</strong> {notification.data.code_affaire}
                        </p>
                        {notification.data.admin_name && (
                          <p>
                            <strong>Traîté par:</strong> {notification.data.admin_name}
                          </p>
                        )}
                        <p>
                          <strong>Date:</strong> {new Date(notification.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {/* Bouton Voir la demande */}
                    <Link
                      href={route('demandes.show', notification.data.demande_id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-sm"
                    >
                      <FaEye className="w-3 h-3" />
                      <span>Voir la demande</span>
                    </Link>

                    {/* Bouton Télécharger devis - seulement si acceptée */}
                    {notification.type === 'demande_acceptee' && (
                      <button
                        onClick={() => handleDownloadDevis(notification.data.demande_id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 text-sm"
                      >
                        <FaDownload className="w-3 h-3" />
                        <span>Télécharger devis</span>
                      </button>
                    )}

                    {/* Bouton Modifier - seulement si refusée */}
                    {notification.type === 'demande_refusee' && (
                      <Link
                        href={route('demandes.edit', notification.data.demande_id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition duration-200 text-sm"
                      >
                        <FaFilePdf className="w-3 h-3" />
                        <span>Modifier la demande</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </AuthenticatedLayout>
  );
}