// resources/js/Pages/User/Chiffrage/Show.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowLeft, FaCalculator, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
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
    if (!amount && amount !== 0) return '0 MAD';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  // 🔹 FONCTION POUR OBTENIR LE NOM DE LA VILLE EN TOUTE SÉCURITÉ
  const getVilleName = (site) => {
    if (!site || !site.ville) return 'Ville non spécifiée';
    
    if (typeof site.ville === 'object') {
      return site.ville.nom || 'Ville non spécifiée';
    }
    
    return site.ville;
  };

  // 🔹 FONCTION POUR COMPTER LE NOMBRE TOTAL DE POSTES DANS TOUS LES SITES
  const getTotalPostes = () => {
    if (!demande.sites) return 0;
    
    let total = 0;
    demande.sites.forEach(site => {
      total += site.postes ? site.postes.length : 0;
    });
    return total;
  };

  // 🔹 FONCTION POUR OBTENIR TOUS LES POSTES DE TOUS LES SITES
  const getAllPostes = () => {
    if (!demande.sites) return [];
    
    const tousLesPostes = [];
    demande.sites.forEach(site => {
      if (site.postes) {
        site.postes.forEach(poste => {
          tousLesPostes.push({
            ...poste,
            site_nom: site.nom_site,
            site_ville: getVilleName(site)
          });
        });
      }
    });
    return tousLesPostes;
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
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Sites d'Intervention</th>
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
              
              {/* COLONNE SITES - CORRIGÉE */}
              <td className="border border-gray-300 px-4 py-3 align-top">
                {demande.sites && demande.sites.length > 0 ? (
                  <div className="space-y-3">
                    {demande.sites.map((site, index) => (
                      <div key={site.id} className="border border-gray-200 rounded p-3 bg-gray-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaBuilding className="text-[#26658C] w-4 h-4" />
                          <span className="font-medium">Site {index + 1}: {site.nom_site}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FaMapMarkerAlt className="w-3 h-3" />
                          <span>{getVilleName(site)}</span>
                        </div>
                        {site.code_site && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Code:</span> {site.code_site}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {site.postes?.length || 0} poste(s)
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">Aucun site défini</div>
                )}
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
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                    {formatCurrency(coutDetails.detail.C4)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Coût fixe par affaire</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Logistique (C5)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                    {formatCurrency(coutDetails.detail.C5)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Coût fixe par dossier</td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Déplacement (C6)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                    {formatCurrency(coutDetails.detail.C6_total || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">
                    Frais de déplacement - {coutDetails.detail.sites_count || 0} site(s)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Détail des frais de déplacement par site */}
          {coutDetails.detail.C6_sites && coutDetails.detail.C6_sites.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Détail des Frais de Déplacement par Site</h3>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2 text-left">Site</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Ville</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Frais de Déplacement</th>
                  </tr>
                </thead>
                <tbody>
                  {coutDetails.detail.C6_sites.map((site, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-4 py-2">{site.nom_site}</td>
                      <td className="border border-gray-300 px-4 py-2">{site.ville}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                        {formatCurrency(site.frais_deplacement)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tableau Détail par Poste */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-md font-semibold text-gray-900 mb-3">
              Détail par Poste ({coutDetails.detail.detail_postes?.length || 0} poste(s))
            </h3>
            
            {coutDetails.detail.detail_postes && coutDetails.detail.detail_postes.length > 0 ? (
              <table className="w-full border-collapse text-sm min-w-max">
                <thead>
                  <tr className="bg-[#26658C] text-white">
                    <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Poste</th>
                    <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Site</th>
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
                    detailPoste.familles && detailPoste.familles.map((famille, familleIndex) => (
                      <tr key={`${posteIndex}-${familleIndex}`} className={familleIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {familleIndex === 0 && (
                          <>
                            <td 
                              className="border border-gray-300 px-4 py-2 font-medium align-top" 
                              rowSpan={detailPoste.familles.length}
                            >
                              {detailPoste.poste}
                            </td>
                            <td 
                              className="border border-gray-300 px-4 py-2 align-top" 
                              rowSpan={detailPoste.familles.length}
                            >
                              {detailPoste.site || 'Site inconnu'}
                            </td>
                            <td 
                              className="border border-gray-300 px-4 py-2 align-top" 
                              rowSpan={detailPoste.familles.length}
                            >
                              {detailPoste.produit || '-'}
                            </td>
                          </>
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
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(famille.C1 || 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(famille.C2 || 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(famille.C3 || 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                          {formatCurrency(famille.total_famille || 0)}
                        </td>
                        {familleIndex === 0 && (
                          <td 
                            className="border border-gray-300 px-4 py-2 text-right font-bold text-[#26658C] bg-blue-50 align-top" 
                            rowSpan={detailPoste.familles.length}
                          >
                            {formatCurrency(detailPoste.total_poste || 0)}
                          </td>
                        )}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucun détail de poste disponible
              </div>
            )}
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
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                    {formatCurrency(coutDetails.detail.C1_total || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">700 MAD par famille</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Préparation Total (C2)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                    {formatCurrency(coutDetails.detail.C2_total || 0)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-gray-600">Variable par famille</td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Analyse Total (C3)</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-[#26658C]">
                    {formatCurrency(coutDetails.detail.C3_total || 0)}
                  </td>
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
                  <td className="border border-gray-300 px-4 py-3 text-left font-bold text-lg">TOTAL AVEC DÉPLACEMENT</td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-bold text-2xl">
                    {formatCurrency(coutDetails.total_avec_deplacement)}
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 px-4 py-3 text-left font-bold text-lg text-blue-800">TOTAL SANS DÉPLACEMENT</td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-bold text-2xl text-blue-800">
                    {formatCurrency(coutDetails.total_sans_deplacement)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLEAU POSTES DE TRAVAIL - CORRIGÉ */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Postes de Travail ({getTotalPostes()} poste(s) sur {demande.sites?.length || 0} site(s))
        </h2>
        
        {getAllPostes().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-max">
              <thead>
                <tr className="bg-[#26658C] text-white">
                  <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">N°</th>
                  <th className="border border-gray-300 px-4 py-2 text-left whitespace-nowrap">Site</th>
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
                {getAllPostes().map((poste, index) => (
                  <tr key={poste.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-2 text-center font-medium">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div className="text-xs">
                        <div className="font-medium">{poste.site_nom}</div>
                        <div className="text-gray-500">{poste.site_ville}</div>
                      </div>
                    </td>
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaBuilding className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun poste de travail défini</p>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}