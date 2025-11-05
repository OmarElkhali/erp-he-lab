// resources/js/Pages/User/Chiffrage/Show.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowLeft, FaCalculator, FaBuilding, FaMapMarkerAlt, FaBox, FaList, FaFileAlt, FaGlobe } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Show({ auth, demande }) {
  const [coutDetails, setCoutDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('devis'); // 'devis', 'sites', ou 'produits'

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
      currency: 'MAD',
      minimumFractionDigits: 2
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

  // 🔹 FONCTION POUR COMPTER LE NOMBRE TOTAL DE PRODUITS
  const getTotalProduits = () => {
    if (!demande.sites) return 0;
    
    let total = 0;
    demande.sites.forEach(site => {
      if (site.postes) {
        site.postes.forEach(poste => {
          total += poste.produits ? poste.produits.length : 0;
        });
      }
    });
    return total;
  };

  // 🔹 FONCTION POUR OBTENIR TOUS LES PRODUITS DE TOUS LES POSTES
  const getAllProduits = () => {
    if (!demande.sites) return [];
    
    const tousLesProduits = [];
    demande.sites.forEach(site => {
      if (site.postes) {
        site.postes.forEach(poste => {
          if (poste.produits) {
            poste.produits.forEach(produit => {
              tousLesProduits.push({
                ...produit,
                poste_nom: poste.nom_poste,
                poste_zone: poste.zone_activite,
                site_nom: site.nom_site,
                site_ville: getVilleName(site),
                personnes_exposees: poste.personnes_exposees,
                duree_shift: poste.duree_shift,
                duree_exposition_quotidienne: poste.duree_exposition_quotidienne,
                nb_shifts: poste.nb_shifts
              });
            });
          }
        });
      }
    });
    return tousLesProduits;
  };

  // 🔹 COMPOSANT POUR L'ONGLET SITES
// 🔹 COMPOSANT POUR L'ONGLET SITES - CORRIGÉ
const SitesTab = () => {
  // 🔹 CORRECTION : Vérifier que detail_sites existe et a des données
  if (!coutDetails.detail?.detail_sites || coutDetails.detail.detail_sites.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-sm">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <FaGlobe className="text-[#26658C] w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Détail par Site</h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="text-gray-500 py-8">
            <FaBuilding className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun détail de site disponible</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-sm">
      {/* En-tête Sites */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <FaGlobe className="text-[#26658C] w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-900">Détail par Site</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Détail des coûts par site */}
        <div className="overflow-x-auto">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <FaBuilding className="w-4 h-4 mr-2 text-gray-500" />
            Coûts Fixes par Site
          </h3>
          <table className="w-full border-collapse text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Site</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Ville</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700">Rapport (C4)</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700">Logistique (C5)</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700">Déplacement (C6)</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700">Total Site</th>
                <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700">Postes</th>
              </tr>
            </thead>
            <tbody>
              {coutDetails.detail.detail_sites.map((site, index) => {
                // 🔹 CORRECTION : S'assurer que toutes les valeurs sont des nombres
                const c4 = Number(site.C4_rapport) || 0;
                const c5 = Number(site.C5_logistique) || 0;
                const c6 = Number(site.C6_deplacement) || 0;
                const totalSite = c4 + c5 + c6;
                
                return (
                  <tr key={index} className={index % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-gray-50 bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <FaBuilding className="text-gray-400 w-4 h-4" />
                        <span>{site.site || 'Site non spécifié'}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-gray-400 w-3 h-3" />
                        <span className="text-sm">{site.ville || 'Ville non spécifiée'}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-blue-600">
                      {formatCurrency(c4)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-blue-600">
                      {formatCurrency(c5)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-blue-600">
                      {formatCurrency(c6)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-bold text-[#26658C]">
                      {formatCurrency(totalSite)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                      {site.nombre_postes || 0}
                    </td>
                  </tr>
                );
              })}
              
              {/* Total des sites */}
              <tr className="bg-blue-50 hover:bg-blue-100">
                <td 
                  className="border border-gray-300 px-3 py-2 font-bold text-gray-900" 
                  colSpan="2"
                >
                  TOTAL SITES
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-blue-700">
                  {formatCurrency(coutDetails.detail.C4_rapport_total || 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-blue-700">
                  {formatCurrency(coutDetails.detail.C5_logistique_total || 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-blue-700">
                  {formatCurrency(coutDetails.detail.C6_deplacement_total || 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-[#26658C] text-lg">
                  {formatCurrency(
                    (coutDetails.detail.C4_rapport_total || 0) + 
                    (coutDetails.detail.C5_logistique_total || 0) + 
                    (coutDetails.detail.C6_deplacement_total || 0)
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                  {coutDetails.detail.nombre_postes_total || 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
  // 🔹 COMPOSANT POUR L'ONGLET DEVIS
  const DevisTab = () => (
    <div className="bg-white border border-gray-200 rounded-sm">
      {/* En-tête Devis */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <FaCalculator className="text-[#26658C] w-5 h-5" />
          <h2 className="text-lg font-semibold text-gray-900">Détail du Devis</h2>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Section Coûts Fixes */}
        <div className="overflow-x-auto">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <FaFileAlt className="w-4 h-4 mr-2 text-gray-500" />
            Coûts Fixes
          </h3>
          <table className="w-full border-collapse text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Type</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700">Montant</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">Rapport Total (C4)</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-[#26658C]">
                  {formatCurrency(coutDetails.detail.C4_rapport_total || 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600 text-sm">
                  {coutDetails.detail.nombre_sites || 0} site(s) × 200 MAD
                </td>
              </tr>
              <tr className="hover:bg-gray-50 bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">Logistique Total (C5)</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-[#26658C]">
                  {formatCurrency(coutDetails.detail.C5_logistique_total || 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600 text-sm">
                  {coutDetails.detail.nombre_sites || 0} site(s) × 300 MAD
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2 font-medium">Déplacement Total (C6)</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-[#26658C]">
                  {formatCurrency(coutDetails.detail.C6_deplacement_total || 0)}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600 text-sm">
                  Frais uniques par ville
                </td>
              </tr>
              <tr className="bg-blue-50 hover:bg-blue-100">
                <td className="border border-gray-300 px-3 py-2 font-bold">Total Coûts Fixes</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-[#26658C]">
                  {formatCurrency(
                    (coutDetails.detail.C4_rapport_total || 0) + 
                    (coutDetails.detail.C5_logistique_total || 0) + 
                    (coutDetails.detail.C6_deplacement_total || 0)
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600 text-sm font-medium">
                  C4 + C5 + C6
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Détail par Poste avec Produits */}
        <div className="overflow-x-auto">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <FaList className="w-4 h-4 mr-2 text-gray-500" />
            Détail par Poste et Produit ({coutDetails.detail.detail_postes?.length || 0} poste(s))
          </h3>
          
          {coutDetails.detail.detail_postes && coutDetails.detail.detail_postes.length > 0 ? (
            <table className="w-full border-collapse text-sm border border-gray-200 min-w-max">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Poste</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Zone</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Site</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Produit</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Famille</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Composants</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">Prélèvement</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">Préparation</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">Analyse</th>
                  <th className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-700 whitespace-nowrap">Total Produit</th>
                </tr>
              </thead>
              <tbody>
                {coutDetails.detail.detail_postes.map((detailPoste, posteIndex) => (
                  detailPoste.produits && detailPoste.produits.map((produit, produitIndex) => (
                    produit.familles && produit.familles.map((famille, familleIndex) => (
                      <tr 
                        key={`${posteIndex}-${produitIndex}-${familleIndex}`} 
                        className={familleIndex % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-gray-50 bg-gray-50'}
                      >
                        {familleIndex === 0 && produitIndex === 0 && (
                          <>
                            <td 
                              className="border border-gray-300 px-3 py-2 font-medium align-top" 
                              rowSpan={detailPoste.produits.reduce((acc, prod) => acc + (prod.familles ? prod.familles.length : 0), 0)}
                            >
                              <div className="font-semibold text-gray-900">{detailPoste.poste}</div>
                            </td>
                            <td 
                              className="border border-gray-300 px-3 py-2 align-top" 
                              rowSpan={detailPoste.produits.reduce((acc, prod) => acc + (prod.familles ? prod.familles.length : 0), 0)}
                            >
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {detailPoste.zone_activite || 'Non spécifiée'}
                              </span>
                            </td>
                            <td 
                              className="border border-gray-300 px-3 py-2 align-top" 
                              rowSpan={detailPoste.produits.reduce((acc, prod) => acc + (prod.familles ? prod.familles.length : 0), 0)}
                            >
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{detailPoste.site}</div>
                                <div className="text-gray-500 text-xs">{detailPoste.ville}</div>
                              </div>
                            </td>
                          </>
                        )}
                        {familleIndex === 0 && (
                          <td 
                            className="border border-gray-300 px-3 py-2 align-top" 
                            rowSpan={produit.familles ? produit.familles.length : 1}
                          >
                            <div>
                              <div className="font-medium text-gray-900">{produit.produit}</div>
                              {produit.description && (
                                <div className="text-gray-500 text-xs mt-1">{produit.description}</div>
                              )}
                            </div>
                          </td>
                        )}
                        <td className="border border-gray-300 px-3 py-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            {famille.famille}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {famille.composants && famille.composants.length > 0 ? (
                            <div className="space-y-1">
                              {famille.composants.map((composant, compIndex) => (
                                <div key={compIndex} className="text-xs">
                                  <div className="font-medium text-gray-700">{composant.nom}</div>
                                  {composant.cas_number && (
                                    <div className="text-gray-500">CAS: {composant.cas_number}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                          {formatCurrency(famille.C1 || 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                          {formatCurrency(famille.C2 || 0)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                          {formatCurrency(famille.C3 || 0)}
                        </td>
                        {familleIndex === 0 && (
                          <td 
                            className="border border-gray-300 px-3 py-2 text-right font-bold text-[#26658C] bg-blue-50 align-top" 
                            rowSpan={produit.familles ? produit.familles.length : 1}
                          >
                            {formatCurrency(produit.total_produit || 0)}
                          </td>
                        )}
                      </tr>
                    ))
                  ))
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-sm">
              <FaList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Aucun détail de poste disponible</p>
            </div>
          )}
        </div>

        

        {/* Total Général */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm border border-gray-200">
            <tbody>
              <tr className="bg-[#26658C] text-white">
                <td className="border border-gray-300 px-4 py-3 text-left font-bold text-lg">TOTAL AVEC DÉPLACEMENT</td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-2xl">
                  {formatCurrency(coutDetails.total_avec_deplacement)}
                </td>
              </tr>
              <tr className="bg-blue-50 hover:bg-blue-100">
                <td className="border border-gray-300 px-4 py-3 text-left font-bold text-lg text-blue-800">TOTAL SANS DÉPLACEMENT</td>
                <td className="border border-gray-300 px-4 py-3 text-right font-bold text-2xl text-blue-800">
                  {formatCurrency(coutDetails.total_sans_deplacement)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 🔹 COMPOSANT POUR L'ONGLET PRODUITS
  const ProduitsTab = () => {
    const tousLesProduits = getAllProduits();
    
    return (
      <div className="bg-white border border-gray-200 rounded-sm">
        {/* En-tête Produits */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaBox className="text-[#26658C] w-5 h-5" />
              <h2 className="text-lg font-semibold text-gray-900">
                Détail des Produits ({getTotalProduits()} produit(s))
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6">
          {tousLesProduits.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm border border-gray-200 min-w-max">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Produit</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Poste</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Zone</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Site</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Ville</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700 whitespace-nowrap">Personnes</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700 whitespace-nowrap">Shift</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700 whitespace-nowrap">Exposition</th>
                    <th className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-700 whitespace-nowrap">Shifts</th>
                    <th className="border border-gray-300 px-3 py-2 text-left font-medium text-gray-700 whitespace-nowrap">Composants</th>
                  </tr>
                </thead>
                <tbody>
                  {tousLesProduits.map((produit, index) => (
                    <tr key={produit.id} className={index % 2 === 0 ? 'hover:bg-gray-50' : 'hover:bg-gray-50 bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">
                        {produit.nom}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-gray-600 text-sm max-w-xs">
                        {produit.description || '-'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          {produit.poste_nom}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                        {produit.poste_zone}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <FaBuilding className="text-gray-400 w-3 h-3" />
                          <span className="text-sm text-gray-900">{produit.site_nom}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-gray-400 w-3 h-3" />
                          <span className="text-sm text-gray-900">{produit.site_ville}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-900">
                        {produit.personnes_exposees}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-gray-700">
                        {produit.duree_shift}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-gray-700">
                        {produit.duree_exposition_quotidienne}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center font-medium text-gray-900">
                        {produit.nb_shifts}
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {produit.composants && produit.composants.length > 0 ? (
                          <div className="space-y-1">
                            {produit.composants.map((composant, compIndex) => (
                              <div key={compIndex} className="text-xs">
                                <div className="font-medium text-gray-700">{composant.nom}</div>
                                {composant.cas_number && (
                                  <div className="text-gray-500">CAS: {composant.cas_number}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Aucun composant</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-gray-200 rounded-sm">
              <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg">Aucun produit défini pour cette demande</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={`Détails - ${demande.code_affaire}`} />
      
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Link
            href={route('historique.matrice', demande.matrice_id)}
            className="text-[#26658C] hover:text-blue-700 flex items-center space-x-2 transition-colors"
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

        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Détails de la demande</h1>
          <p className="text-gray-600 mt-1">Code: {demande.code_affaire}</p>
          <span className="text-gray-700">{demande.matrice.label}</span>
        </div>
      </div>

      {/* TABLEAU INFORMATIONS GÉNÉRALES */}
      <div className="bg-white border border-gray-200 rounded-sm mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Informations Entreprise</th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">Sites d'Intervention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-3 align-top">
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-gray-900">Nom entreprise:</span> <span className="text-gray-700">{demande.entreprise.nom}</span></div>
                  <div><span className="font-medium text-gray-900">ICE:</span> <span className="text-gray-700">{demande.entreprise.ice}</span></div>
                  <div><span className="font-medium text-gray-900">Adresse:</span> <span className="text-gray-700">{demande.entreprise.adresse}</span></div>
                  <div><span className="font-medium text-gray-900">Nom et Prénom:</span> <span className="text-gray-700">{demande.entreprise.nom_prenom}</span></div>
                  <div><span className="font-medium text-gray-900">Fonction:</span> <span className="text-gray-700">{demande.entreprise.contact_fonction}</span></div>
                  <div><span className="font-medium text-gray-900">Tél:</span> <span className="text-gray-700">{demande.entreprise.telephone}</span></div>
                  <div><span className="font-medium text-gray-900">Email:</span> <span className="text-gray-700">{demande.entreprise.email}</span></div>
                </div>
              </td>
              
              {/* COLONNE SITES */}
              <td className="border border-gray-300 px-4 py-3 align-top">
                {demande.sites && demande.sites.length > 0 ? (
                  <div className="space-y-3">
                    {demande.sites.map((site, index) => (
                      <div key={site.id} className="border border-gray-200 rounded-sm p-3 bg-gray-50">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaBuilding className="text-[#26658C] w-4 h-4" />
                          <span className="font-medium text-gray-900">Site {index + 1}: {site.nom_site}</span>
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
                          {site.postes?.length || 0} poste(s), {site.postes?.reduce((acc, poste) => acc + (poste.produits?.length || 0), 0) || 0} produit(s)
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 italic text-sm">Aucun site défini</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* NAVIGATION PAR ONGLETS */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('devis')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === 'devis'
                  ? 'border-[#26658C] text-[#26658C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaCalculator className="w-4 h-4" />
              <span>Détail du Devis</span>
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === 'sites'
                  ? 'border-[#26658C] text-[#26658C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaGlobe className="w-4 h-4" />
              <span>Détail par Site</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {demande.sites?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('produits')}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === 'produits'
                  ? 'border-[#26658C] text-[#26658C]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBox className="w-4 h-4" />
              <span>Détail des Produits</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {getTotalProduits()}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* CONTENU DES ONGLETS */}
      {!loading && coutDetails ? (
        activeTab === 'devis' ? <DevisTab /> : 
        activeTab === 'sites' ? <SitesTab /> : 
        <ProduitsTab />
      ) : (
        <div className="bg-white border border-gray-200 rounded-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26658C] mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des détails...</p>
        </div>
      )}
    </AuthenticatedLayout>
  );
}