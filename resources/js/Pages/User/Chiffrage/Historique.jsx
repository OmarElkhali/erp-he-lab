// resources/js/Pages/User/Chiffrage/Historique.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaEdit, FaTrash, FaEye, FaDownload, FaFilePdf, FaUpload, FaFileAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

export default function Historique({ auth, demandes, matrice }) {
  const getStatusBadge = (statut) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'acceptee': { color: 'bg-green-100 text-green-800', label: 'Acceptée' },
      'refusee': { color: 'bg-red-100 text-red-800', label: 'Refusée' },
      'en_cours': { color: 'bg-blue-100 text-blue-800', label: 'En cours' },
      'terminee': { color: 'bg-gray-100 text-gray-800', label: 'Terminée' }
    };
    
    const config = statusConfig[statut] || statusConfig.en_attente;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  // 🔹 FONCTION POUR OBTENIR LE NOM DE LA VILLE EN TOUTE SÉCURITÉ
  const getVilleName = (site) => {
    if (!site || !site.ville) return 'Ville non spécifiée';
    
    if (typeof site.ville === 'object') {
      return site.ville.nom || 'Ville non spécifiée';
    }
    
    return site.ville;
  };

  // 🔹 FONCTION POUR FORMATTER LES MONTANTS EN TOUTE SÉCURITÉ
  const formatMontant = (montant) => {
    if (!montant && montant !== 0) return '0';
    return typeof montant === 'number' ? montant.toLocaleString('fr-FR') : '0';
  };

  // 🔹 FONCTION POUR COMPTER LE NOMBRE TOTAL DE POSTES DANS TOUS LES SITES
  const getTotalPostes = (demande) => {
    if (!demande.sites) return 0;
    
    let total = 0;
    demande.sites.forEach(site => {
      total += site.postes ? site.postes.length : 0;
    });
    return total;
  };

  // 🔹 FONCTION POUR OBTENIR LA LISTE DES NOMS DE TOUS LES POSTES
  const getNomsPostes = (demande) => {
    if (!demande.sites) return [];
    
    const nomsPostes = [];
    demande.sites.forEach(site => {
      if (site.postes) {
        site.postes.forEach(poste => {
          if (poste.nom_poste) {
            nomsPostes.push(poste.nom_poste);
          }
        });
      }
    });
    return nomsPostes;
  };

  const handleDelete = async (demandeId, codeAffaire) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Voulez-vous vraiment supprimer la demande "${codeAffaire}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler',
      background: '#fff',
      color: '#333'
    });

    if (result.isConfirmed) {
      router.delete(route('demandes.destroy', demandeId), {
        onSuccess: () => {
          Swal.fire({
            title: 'Supprimé!',
            text: 'La demande a été supprimée avec succès.',
            icon: 'success',
            confirmButtonColor: '#26658C',
            background: '#fff',
            color: '#333'
          });
        },
        onError: () => {
          Swal.fire({
            title: 'Erreur!',
            text: 'Une erreur est survenue lors de la suppression.',
            icon: 'error',
            confirmButtonColor: '#d33',
            background: '#fff',
            color: '#333'
          });
        }
      });
    }
  };

  const handleDownloadDevis = (demande) => {
    Swal.fire({
      title: 'Téléchargement du devis',
      text: `Préparation du devis pour "${demande.code_affaire}"...`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#26658C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Télécharger',
      cancelButtonText: 'Annuler',
      background: '#fff',
      color: '#333'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Télécharger le devis pour:', demande.code_affaire);
        
        Swal.fire({
          title: 'Téléchargement réussi!',
          text: 'Le devis a été généré avec succès.',
          icon: 'success',
          confirmButtonColor: '#26658C',
          background: '#fff',
          color: '#333'
        });
      }
    });
  };

  const handleUploadDevis = (demande) => {
    Swal.fire({
      title: 'Uploader le devis',
      html: `
        <div class="text-left">
          <p class="mb-4">Uploader le devis pour <strong>${demande.code_affaire}</strong></p>
          <input type="file" id="devisFile" class="swal2-file" accept=".pdf,.doc,.docx" />
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#26658C',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Uploader',
      cancelButtonText: 'Annuler',
      background: '#fff',
      color: '#333',
      preConfirm: () => {
        const fileInput = Swal.getPopup().querySelector('#devisFile');
        if (!fileInput.files[0]) {
          Swal.showValidationMessage('Veuillez sélectionner un fichier');
          return false;
        }
        return fileInput.files[0];
      }
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Uploader le devis pour:', demande.code_affaire, 'Fichier:', result.value);
        
        Swal.fire({
          title: 'Upload réussi!',
          text: 'Le devis a été uploadé avec succès.',
          icon: 'success',
          confirmButtonColor: '#26658C',
          background: '#fff',
          color: '#333'
        });
      }
    });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Historique - ${matrice?.label}`} />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#26658C]">Historique des demandes</h1>
          <p className="text-gray-600">Matrice: {matrice?.label}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {demandes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FaFileAlt className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-lg mb-2">Aucune demande trouvée pour cette matrice.</p>
            <Link
              href={route('demandes.create', { matrice_id: matrice?.id })}
              className="text-[#26658C] hover:underline font-medium transition duration-200"
            >
              Créer votre première demande
            </Link>
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
                    Sites
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Postes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coût Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coût sans Déplacement
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
                {demandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{demande.code_affaire}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{demande.entreprise.nom}</div>
                      <div className="text-sm text-gray-500">ICE: {demande.entreprise.ice}</div>
                    </td>
                    
                    {/* NOUVELLE COLONNE SITES */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {demande.sites?.length || 0} site(s)
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {demande.sites?.map(s => s.nom_site).join(', ') || 'Aucun site'}
                      </div>
                      {demande.sites && demande.sites.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {demande.sites[0]?.ville?.nom || getVilleName(demande.sites[0])}
                          {demande.sites.length > 1 && ` +${demande.sites.length - 1} autre(s)`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{demande.contact_nom_demande}</div>
                      <div className="text-sm text-gray-500">{demande.contact_email_demande}</div>
                      <div className="text-sm text-gray-500">{demande.contact_tel_demande}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTotalPostes(demande)} poste(s)
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {getNomsPostes(demande).join(', ') || 'Aucun poste'}
                      </div>
                    </td>
                    
                    {/* Colonne Coût Total AVEC déplacement */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatMontant(demande.cout_total_avec_deplacement)} MAD
                      </div>
                      <div className="text-xs text-gray-500">
                        Avec déplacement
                      </div>
                    </td>
                    
                    {/* Colonne Coût Total SANS déplacement */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-blue-600">
                        {formatMontant(demande.cout_total_sans_deplacement)} MAD
                      </div>
                      <div className="text-xs text-gray-500">
                        Sans déplacement
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(demande.statut)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={route('demandes.show', demande.id)}
                          className="text-[#26658C] hover:text-blue-800 transition duration-150 transform hover:scale-110"
                          title="Voir les détails"
                        >
                          <FaEye className="w-5 h-5" />
                        </Link>

                        {(demande.statut === 'en_attente' || demande.statut === 'refusee') && (
                          <Link
                            href={route('demandes.edit', demande.id)}
                            className="text-[#26658C] hover:text-green-700 transition duration-150 transform hover:scale-110"
                            title="Modifier"
                          >
                            <FaEdit className="w-5 h-5" />
                          </Link>
                        )}

                        {demande.statut === 'acceptee' && (
                          <button
                            onClick={() => handleDownloadDevis(demande)}
                            className="text-[#26658C] hover:text-purple-700 transition duration-150 transform hover:scale-110"
                            title="Télécharger le devis"
                          >
                            <FaDownload className="w-5 h-5" />
                          </button>
                        )}

                        {demande.statut === 'acceptee' && (
                          <button
                            onClick={() => {
                              console.log('Générer PDF pour:', demande.code_affaire);
                              Swal.fire({
                                title: 'PDF Généré!',
                                text: 'Le PDF a été généré avec succès.',
                                icon: 'success',
                                confirmButtonColor: '#26658C'
                              });
                            }}
                            className="text-[#26658C] hover:text-red-700 transition duration-150 transform hover:scale-110"
                            title="Générer le PDF"
                          >
                            <FaFilePdf className="w-5 h-5" />
                          </button>
                        )}

                        {auth.user.role === 'admin' && demande.statut === 'acceptee' && (
                          <button
                            onClick={() => handleUploadDevis(demande)}
                            className="text-[#26658C] hover:text-orange-700 transition duration-150 transform hover:scale-110"
                            title="Uploader le devis"
                          >
                            <FaUpload className="w-5 h-5" />
                          </button>
                        )}

                        {demande.statut === 'en_attente' && (
                          <button
                            onClick={() => handleDelete(demande.id, demande.code_affaire)}
                            className="text-[#26658C] hover:text-red-700 transition duration-150 transform hover:scale-110"
                            title="Supprimer"
                          >
                            <FaTrash className="w-5 h-5" />
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