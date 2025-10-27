// resources/js/Pages/User/Chiffrage/Show.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FaBuilding, FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope, FaIndustry, FaUsers, FaClock, FaFileAlt, FaArrowLeft, FaCalculator, FaMoneyBillWave, FaListAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Show({ auth, demande }) {
  const [coutDetails, setCoutDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoutDetails = async () => {
      try {
        const response = await axios.get(`/api/demandes/${demande.id}/cout`);
        setCoutDetails(response.data);
      } catch (error) {
        console.error('Erreur chargement détails coût:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoutDetails();
  }, [demande.id]);

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      'acceptee': { color: 'bg-green-100 text-green-800', label: 'Acceptée' },
      'refusee': { color: 'bg-red-100 text-red-800', label: 'Refusée' },
      'en_cours': { color: 'bg-blue-100 text-blue-800', label: 'En cours' },
      'terminee': { color: 'bg-gray-100 text-gray-800', label: 'Terminée' }
    };
    
    const config = statusConfig[statut] || statusConfig.en_attente;
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>{config.label}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Détails - ${demande.code_affaire}`} />
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Link
              href={route('historique.matrice', demande.matrice_id)}
              className="text-[#26658C] hover:text-blue-700 flex items-center space-x-2"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Retour à l'historique</span>
            </Link>
          </div>

          {/* Statut à droite */}
          <div className="text-right">
            {getStatusBadge(demande.statut)}
            <p className="text-sm text-gray-500 mt-1">
              Créée le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Titre centré */}
        <div className="mt-4 text-center">
          <h1 className="text-2xl font-bold text-[#26658C]">
            Détails de la demande
          </h1>
          <p className="text-gray-600">
            Code: {demande.code_affaire}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Informations Entreprise */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaBuilding className="text-[#26658C] w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Informations Entreprise</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <p className="mt-1 text-sm text-gray-900">{demande.entreprise.nom}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ICE</label>
              <p className="mt-1 text-sm text-gray-900">{demande.entreprise.ice}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <p className="mt-1 text-sm text-gray-900">{demande.entreprise.adresse}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact</label>
                <p className="mt-1 text-sm text-gray-900">
                  {demande.entreprise.contact_nom} {demande.entreprise.contact_prenom}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fonction</label>
                <p className="mt-1 text-sm text-gray-900">{demande.entreprise.contact_fonction}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="mt-1 text-sm text-gray-900">{demande.entreprise.telephone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{demande.entreprise.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations Site et Demande */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaMapMarkerAlt className="text-[#26658C] w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Site d'Intervention</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Responsable site</label>
              <p className="mt-1 text-sm text-gray-900">{demande.site.nom_site}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ville</label>
              <p className="mt-1 text-sm text-gray-900">{demande.site.ville.nom}</p>
            </div>
            {demande.site.code_site && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Code site</label>
                <p className="mt-1 text-sm text-gray-900">{demande.site.code_site}</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-6 mb-4">
            <FaUser className="text-[#26658C] w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Contact Demande</h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <p className="mt-1 text-sm text-gray-900">{demande.contact_nom_demande}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{demande.contact_email_demande}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <p className="mt-1 text-sm text-gray-900">{demande.contact_tel_demande}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DÉTAILS DU DEVIS */}
      {!loading && coutDetails && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <FaCalculator className="text-[#26658C] w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Détail du Devis</h2>
            <div className="ml-auto bg-[#26658C] text-white px-4 py-2 rounded-lg">
              <span className="text-lg font-bold">{formatCurrency(coutDetails.total)}</span>
            </div>
          </div>
          

          {/* Coûts fixes */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <FaMoneyBillWave className="text-[#26658C] w-4 h-4 mr-2" />
              Coûts Fixes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Rapport (C4)</span>
                  <span className="text-sm font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C4)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coût fixe par affaire</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Logistique (C5)</span>
                  <span className="text-sm font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C5)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Coût fixe par dossier</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Déplacement (C6)</span>
                  <span className="text-sm font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C6)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Frais de déplacement</p>
              </div>
            </div>
          </div>


{/* Détail par poste */}
<div className="mb-6">
  <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
    <FaListAlt className="text-[#26658C] w-4 h-4 mr-2" />
    Détail par Poste ({coutDetails.detail.detail_postes.length} poste(s))
  </h3>
  
  <div className="space-y-4">
    {coutDetails.detail.detail_postes.map((detailPoste, posteIndex) => (
      <div key={posteIndex} className="border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              {detailPoste.poste} - {formatCurrency(detailPoste.total_poste)}
            </h4>
            {/* 🔹 AFFICHER LE PRODUIT */}
            {detailPoste.produit && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Produit analysé:</span> {detailPoste.produit}
              </p>
            )}
          </div>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            {detailPoste.familles.length} famille(s)
          </span>
        </div>

        {/* Détail par famille */}
        <div className="space-y-3">
          {detailPoste.familles.map((famille, familleIndex) => (
            <div key={familleIndex} className="bg-gray-50 rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-gray-900">{famille.famille}</span>
                <span className="text-sm font-semibold text-[#26658C]">
                  {formatCurrency(famille.total_famille)}
                </span>
              </div>
              
              {/* 🔹 AFFICHER LES COMPOSANTS */}
              {famille.composants && famille.composants.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-gray-700">Composants analysés:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {famille.composants.map((composant, compIndex) => (
                      <span
                        key={compIndex}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                      >
                        {composant.nom}
                        {composant.cas_number && (
                          <span className="ml-1 text-green-600">({composant.cas_number})</span>
                        )}
                        <span className="ml-1 font-medium">{formatCurrency(composant.cout_analyse)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <span className="font-medium">Prélèvement</span>
                  <p className="text-gray-600">{formatCurrency(famille.C1)}</p>
                </div>
                <div className="text-center">
                  <span className="font-medium">Préparation</span>
                  <p className="text-gray-600">{formatCurrency(famille.C2)}</p>
                </div>
                <div className="text-center">
                  <span className="font-medium">Analyse</span>
                  <p className="text-gray-600">{formatCurrency(famille.C3)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>

          {/* Récapitulatif des coûts variables */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Récapitulatif des Coûts Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-700">Prélèvement Total (C1)</span>
                <span className="text-lg font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C1_total)}</span>
                <p className="text-xs text-gray-500">700 MAD par famille</p>
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-700">Préparation Total (C2)</span>
                <span className="text-lg font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C2_total)}</span>
                <p className="text-xs text-gray-500">Variable par famille</p>
              </div>
              <div className="text-center">
                <span className="block text-sm font-medium text-gray-700">Analyse Total (C3)</span>
                <span className="text-lg font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C3_total)}</span>
                <p className="text-xs text-gray-500">Somme des composants</p>
              </div>
            </div>
          </div>

          {/* Total général */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Général</span>
              <span className="text-2xl font-bold text-[#26658C]">{formatCurrency(coutDetails.total)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-right">
              Tous les montants sont en MAD
            </p>
          </div>
        </div>
      )}

      {/* Postes de Travail */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-2 mb-6">
          <FaIndustry className="text-[#26658C] w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-900">Postes de Travail</h2>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
            {demande.postes.length} poste(s)
          </span>
        </div>

        <div className="space-y-6">
          {demande.postes.map((poste, index) => (
            <div key={poste.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-md font-semibold text-gray-900">
                        Poste {index + 1}: {poste.nom_poste}
                      </h3>
                      {/* 🔹 AFFICHER LE PRODUIT */}
                      {poste.produit && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Produit:</span> {poste.produit}
                        </p>
                      )}
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {poste.zone_activite}
                    </span>
                  </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-gray-400 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{poste.personnes_exposees}</p>
                    <p className="text-xs text-gray-500">Personnes exposées</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gray-400 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{poste.duree_shift}h</p>
                    <p className="text-xs text-gray-500">Durée shift</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-gray-400 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{poste.duree_exposition_quotidienne}h</p>
                    <p className="text-xs text-gray-500">Exposition quotidienne</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FaIndustry className="text-gray-400 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{poste.nb_shifts}</p>
                    <p className="text-xs text-gray-500">Nombre de shifts</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{poste.description}</p>
              </div>

              {poste.composants && poste.composants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Composants à analyser ({poste.composants.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {poste.composants.map((composant) => (
                      <span
                        key={composant.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {composant.nom}
                        {composant.cas_number && (
                          <span className="ml-1 text-green-600">({composant.cas_number})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Informations Matrice */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <FaFileAlt className="text-[#26658C] w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-900">Informations Matrice</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Matrice</label>
            <p className="mt-1 text-sm text-gray-900">{demande.matrice.label}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Valeur</label>
            <p className="mt-1 text-sm text-gray-900">{demande.matrice.value}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Abréviation</label>
            <p className="mt-1 text-sm text-gray-900">{demande.matrice.abreviation}</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}