// resources/js/Pages/User/Chiffrage/Show.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowLeft, FaCalculator } from 'react-icons/fa';
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
      
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link
            href={route('historique.matrice', demande.matrice_id)}
            className="text-[#26658C] hover:text-blue-700 flex items-center space-x-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Retour à l'historique</span>
          </Link>

          <div className="text-right">
            {getStatusBadge(demande.statut)}
            <p className="text-sm text-gray-500 mt-1">
              Créée le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-2xl font-bold text-[#26658C]">Détails de la demande</h1>
          <p className="text-gray-600">Code: {demande.code_affaire}</p>
        </div>
      </div>

      {/* TABLEAU INFORMATIONS GÉNÉRALES */}
      <div className="bg-white rounded-lg shadow mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#26658C] text-white">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Informations Entreprise</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Site d'Intervention</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Contact Demande</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Informations Matrice</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white">
              <td className="border border-gray-300 px-4 py-3 align-top">
                <div className="space-y-2">
                  <div><span className="font-medium">Nom:</span> {demande.entreprise.nom}</div>
                  <div><span className="font-medium">ICE:</span> {demande.entreprise.ice}</div>
                  <div><span className="font-medium">Adresse:</span> {demande.entreprise.adresse}</div>
                  <div><span className="font-medium">Contact:</span> {demande.entreprise.contact_nom} {demande.entreprise.contact_prenom}</div>
                  <div><span className="font-medium">Fonction:</span> {demande.entreprise.contact_fonction}</div>
                  <div><span className="font-medium">Tél:</span> {demande.entreprise.telephone}</div>
                  <div><span className="font-medium">Email:</span> {demande.entreprise.email}</div>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <div className="space-y-2">
                  <div><span className="font-medium">Responsable site:</span> {demande.site.nom_site}</div>
                  <div><span className="font-medium">Ville:</span> {demande.site.ville.nom}</div>
                  {demande.site.code_site && (
                    <div><span className="font-medium">Code site:</span> {demande.site.code_site}</div>
                  )}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <div className="space-y-2">
                  <div><span className="font-medium">Nom:</span> {demande.contact_nom_demande}</div>
                  <div><span className="font-medium">Email:</span> {demande.contact_email_demande}</div>
                  <div><span className="font-medium">Téléphone:</span> {demande.contact_tel_demande}</div>
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <div className="space-y-2">
                  <div><span className="font-medium">Matrice:</span> {demande.matrice.label}</div>
                  <div><span className="font-medium">Valeur:</span> {demande.matrice.value}</div>
                  <div><span className="font-medium">Abréviation:</span> {demande.matrice.abreviation}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DÉTAILS DU DEVIS */}
      {!loading && coutDetails && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FaCalculator className="text-[#26658C] w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-900">Détail du Devis</h2>
            </div>
            
          </div>

          {/* Tableau Coûts Fixes */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Coûts Fixes</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#26658C] text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Montant</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Rapport (C4)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C4)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Coût fixe par affaire</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Logistique (C5)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C5)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Coût fixe par dossier</td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Déplacement (C6)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C6)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Frais de déplacement</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tableau Détail par Poste */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-md font-semibold text-gray-900 mb-3">
              Détail par Poste ({coutDetails.detail.detail_postes.length} poste(s))
            </h3>
            <table className="w-full border-collapse text-sm min-w-max">
              <thead>
                <tr className="bg-[#26658C] text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Poste</th>
                  <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Produit</th>
                  <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Famille</th>
                  <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Composants</th>
                  <th className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">C1 (Prélèvement)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">C2 (Préparation)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">C3 (Analyse)</th>
                  <th className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap">Total Famille</th>
                  <th className="border border-gray-300 px-4 py-2 text-right whitespace-nowrap bg-[#1e4d6b]">Total Poste</th>
                </tr>
              </thead>
              <tbody>
                {coutDetails.detail.detail_postes.map((detailPoste, posteIndex) => (
                  detailPoste.familles.map((famille, familleIndex) => (
                    <tr key={`${posteIndex}-${familleIndex}`} className={familleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {familleIndex === 0 && (
                        <td 
                          className="border border-gray-300 px-4 py-2 font-medium align-top" 
                          rowSpan={detailPoste.familles.length}
                        >
                          {detailPoste.poste}
                        </td>
                      )}
                      {familleIndex === 0 && (
                        <td 
                          className="border border-gray-300 px-4 py-2 align-top" 
                          rowSpan={detailPoste.familles.length}
                        >
                          {detailPoste.produit || '-'}
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-2">{famille.famille}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {famille.composants && famille.composants.length > 0 ? (
                          <div className="space-y-1">
                            {famille.composants.map((composant, compIndex) => (
                              <div key={compIndex} className="text-xs">
                                <span className="font-medium">{composant.nom}</span>
                                {composant.cas_number && (
                                  <span className="text-gray-500"> ({composant.cas_number})</span>
                                )}
                                <span className="text-[#26658C] ml-2">{formatCurrency(composant.cout_analyse)}</span>
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(famille.C1)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(famille.C2)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(famille.C3)}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                        {formatCurrency(famille.total_famille)}
                      </td>
                      {familleIndex === 0 && (
                        <td 
                          className="border border-gray-300 px-4 py-2 text-right font-bold text-[#26658C] bg-blue-50 align-top" 
                          rowSpan={detailPoste.familles.length}
                        >
                          {formatCurrency(detailPoste.total_poste)}
                        </td>
                      )}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>

          {/* Tableau Récapitulatif */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Récapitulatif des Coûts Variables</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#26658C] text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Prélèvement Total (C1)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C1_total)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">700 MAD par famille</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Préparation Total (C2)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C2_total)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Variable par famille</td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Analyse Total (C3)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">{formatCurrency(coutDetails.detail.C3_total)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Somme des composants</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Général */}
          <div className="border-t-2 border-[#26658C] pt-4">
            <table className="w-full border-collapse text-sm">
              <tbody>
                <tr className="bg-[#26658C] text-white">
                  <td className="border border-gray-300 px-4 py-3 text-left font-bold text-lg">TOTAL GÉNÉRAL</td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-bold text-2xl">{formatCurrency(coutDetails.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLEAU POSTES DE TRAVAIL */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Postes de Travail ({demande.postes.length} poste(s))
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-max">
            <thead>
              <tr className="bg-[#26658C] text-white">
                <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">N°</th>
                <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Nom Poste</th>
                <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Produit</th>
                <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Zone Activité</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Personnes Exposées</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Durée Shift (h)</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Exposition Quot. (h)</th>
                <th className="border border-gray-300 px-4 py-2 text-center whitespace-nowrap">Nb Shifts</th>
                <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Composants à Analyser</th>
              </tr>
            </thead>
            <tbody>
              {demande.postes.map((poste, index) => (
                <tr key={poste.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2 text-center font-medium">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{poste.nom_poste}</td>
                  <td className="border border-gray-300 px-4 py-2">{poste.produit || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {poste.zone_activite}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{poste.personnes_exposees}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{poste.duree_shift}h</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{poste.duree_exposition_quotidienne}h</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{poste.nb_shifts}</td>
                  <td className="border border-gray-300 px-4 py-2 max-w-xs">
                    <div className="text-xs">{poste.description}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {poste.composants && poste.composants.length > 0 ? (
                      <div className="space-y-1">
                        {poste.composants.map((composant) => (
                          <div key={composant.id} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block mr-1 mb-1">
                            {composant.nom}
                            {composant.cas_number && (
                              <span className="text-green-600"> ({composant.cas_number})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
