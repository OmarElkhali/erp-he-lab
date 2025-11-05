// resources/js/Pages/User/Chiffrage/Edit.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from "axios";
import ProduitComposants from './ProduitComposants';
import Swal from 'sweetalert2';
import { FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaPaperPlane, FaSave } from 'react-icons/fa';

export default function Edit({ auth, demande, matrices, villes }) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // 🔹 Initialiser les données depuis la demande existante
   const [sites, setSites] = useState(
    demande.sites && demande.sites.length > 0 
        ? demande.sites.map(site => ({
            id: site.id,
            nom_site: site.nom_site, 
            ville_id: site.ville_id,
            code_site: site.code_site,
            postes: site.postes ? site.postes.map(poste => ({
                id: poste.id,
                nom_poste: poste.nom_poste,
                zone_activite: poste.zone_activite,
                personnes_exposees: poste.personnes_exposees,
                duree_shift: poste.duree_shift,
                duree_exposition_quotidienne: poste.duree_exposition_quotidienne,
                nb_shifts: poste.nb_shifts,
                produits: poste.produits && poste.produits.length > 0 
                    ? poste.produits.map(produit => ({
                        nom: produit.nom || '',
                        description: produit.description || '',
                        composants: produit.composants ? produit.composants.map(c => c.id) : []
                    }))
                    : [{
                        nom: '',
                        description: '',
                        composants: []
                    }]
            })) : [{
                nom_poste: '', 
                zone_activite: '', 
                personnes_exposees: '', 
                duree_shift: '',
                duree_exposition_quotidienne: '',
                nb_shifts: '',
                produits: [{
                    nom: '',
                    description: '',
                    composants: []
                }]
            }]
        }))
        : [{
            nom_site: demande.site?.nom_site || '', 
            ville_id: demande.site?.ville_id || '',
            code_site: demande.site?.code_site || '',
            postes: demande.postes ? demande.postes.map(poste => ({
                id: poste.id,
                nom_poste: poste.nom_poste,
                zone_activite: poste.zone_activite,
                personnes_exposees: poste.personnes_exposees,
                duree_shift: poste.duree_shift,
                duree_exposition_quotidienne: poste.duree_exposition_quotidienne,
                nb_shifts: poste.nb_shifts,
                produits: poste.produits && poste.produits.length > 0 
                    ? poste.produits.map(produit => ({
                        nom: produit.nom || '',
                        description: produit.description || '',
                        composants: produit.composants ? produit.composants.map(c => c.id) : []
                    }))
                    : [{
                        nom: '',
                        description: '',
                        composants: []
                    }]
            })) : [{
                nom_poste: '', 
                zone_activite: '', 
                personnes_exposees: '', 
                duree_shift: '',
                duree_exposition_quotidienne: '',
                nb_shifts: '',
                produits: [{
                    nom: '',
                    description: '',
                    composants: []
                }]
            }]
        }]
);
const { data, setData, put, processing, errors, reset } = useForm({
    ice: demande.entreprise?.ice || '',
    nom: demande.entreprise?.nom || '',
    adresse: demande.entreprise?.adresse || '',
    nom_prenom: demande.entreprise?.nom_prenom || '',
    contact_fonction: demande.entreprise?.contact_fonction || '',
    telephone: demande.entreprise?.telephone || '',
    email: demande.entreprise?.email || '',
    
    // Informations matrice
    matrice_id: demande.matrice_id || '',
    
    // Informations site
    sites: sites,
    
    // CORRECTION : Informations de contact spécifiques à la demande
    contact_nom_demande: demande.contact_nom_demande || demande.entreprise?.nom_prenom || '',
    contact_email_demande: demande.contact_email_demande || demande.entreprise?.email || '',
    contact_tel_demande: demande.contact_tel_demande || demande.entreprise?.telephone || ''
});

    // Mettre à jour les données quand sites changent
    useEffect(() => {
        setData('sites', sites);
    }, [sites]);

    // Fonction pour ajouter un poste à un site spécifique
    const addPosteToSite = (siteIndex) => {
        const newSites = [...sites];
        newSites[siteIndex].postes.push({
            nom_poste: '', 
            zone_activite: '', 
            personnes_exposees: '', 
            duree_shift: '',
            duree_exposition_quotidienne: '',
            nb_shifts: '',
            produits: [{
                nom: '',
                description: '',
                composants: []
            }]
        });
        setSites(newSites);
    };

    // Fonction pour supprimer un poste d'un site spécifique
    const removePosteFromSite = (siteIndex, posteIndex) => {
        const newSites = [...sites];
        if (newSites[siteIndex].postes.length > 1) {
            newSites[siteIndex].postes.splice(posteIndex, 1);
            setSites(newSites);
        }
    };

    // Fonction pour mettre à jour un poste dans un site spécifique
    const updatePosteInSite = (siteIndex, posteIndex, field, value) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex][field] = value;
        setSites(newSites);
    };

    // Fonction pour ajouter un produit à un poste spécifique
    const addProduitToPoste = (siteIndex, posteIndex) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].produits.push({
            nom: '',
            description: '',
            composants: []
        });
        setSites(newSites);
    };

    // Fonction pour supprimer un produit d'un poste spécifique
    const removeProduitFromPoste = (siteIndex, posteIndex, produitIndex) => {
        const newSites = [...sites];
        if (newSites[siteIndex].postes[posteIndex].produits.length > 1) {
            newSites[siteIndex].postes[posteIndex].produits.splice(produitIndex, 1);
            setSites(newSites);
        }
    };

    // Fonction pour mettre à jour un produit dans un poste
    const updateProduitInPoste = (siteIndex, posteIndex, produitIndex, field, value) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].produits[produitIndex][field] = value;
        setSites(newSites);
    };

    // Fonction pour gérer les composants d'un produit
    const toggleComposantInProduit = (siteIndex, posteIndex, produitIndex, composantIds) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].produits[produitIndex].composants = composantIds;
        setSites(newSites);
    };

    const handleIceChange = async (e) => {
        const value = e.target.value;
        setData("ice", value);

        if (value.length >= 3) {
            try {
                const response = await axios.get(`/entreprises/find/${value}`);
                const entreprise = response.data;

                setData({
                    ...data,
                    ice: entreprise.ice,
                    nom: entreprise.nom,
                    adresse: entreprise.adresse,
                    nom_prenom: entreprise.nom_prenom || "",
                    contact_fonction: entreprise.contact_fonction || "",
                    telephone: entreprise.telephone,
                    email: entreprise.email,
                });
            } catch (error) {
                console.log("Entreprise non trouvée");
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.matrice_id || !data.ice || !data.nom || data.sites.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Champs manquants',
                text: 'Veuillez remplir tous les champs obligatoires',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        let hasPostes = false;
        for (const site of data.sites) {
            if (site.postes && site.postes.length > 0) {
                hasPostes = true;
                break;
            }
        }

        if (!hasPostes) {
            Swal.fire({
                icon: 'error',
                title: 'Postes manquants',
                text: 'Veuillez ajouter au moins un poste dans un site',
                confirmButtonColor: '#26658C'
            });
            return;
        }
        
        put(route('demandes.update', demande.id), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Votre demande a été modifiée avec succès!',
                    confirmButtonColor: '#26658C',
                    timer: 3000
                });
            },
            onError: (errors) => {
                console.log('Erreurs de mise à jour:', errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur lors de la modification. Vérifiez les données.',
                    confirmButtonColor: '#26658C'
                });
            }
        });
    };

    // Fonctions pour les sites
    const addSite = () => {
        const newSites = [...sites, { 
            nom_site: '', 
            ville_id: '',
            code_site: '',
            postes: [{
                nom_poste: '', 
                zone_activite: '', 
                personnes_exposees: '', 
                duree_shift: '',
                duree_exposition_quotidienne: '',
                nb_shifts: '',
                produits: [{
                    nom: '',
                    description: '',
                    composants: []
                }]
            }]
        }];
        setSites(newSites);
    };

    const removeSite = (index) => {
        if (sites.length > 1) {
            const newSites = sites.filter((_, i) => i !== index);
            setSites(newSites);
        }
    };

    const updateSite = (index, field, value) => {
        const newSites = [...sites];
        newSites[index][field] = value;
        setSites(newSites);
    };

    const nextStep = () => setCurrentStep(currentStep + 1);
    const prevStep = () => setCurrentStep(currentStep - 1);

    const getMatriceLabel = () => {
        const selectedMatrice = matrices.find(m => m.id == data.matrice_id);
        return selectedMatrice ? selectedMatrice.label : 'Non spécifiée';
    };

    return (
        <AuthenticatedLayout user={auth.user} noWrapper>
            <Head title="Modifier la Demande d'Analyse" />
            
            <div className="min-vh-100 bg-gray-50 pb-8">
                <div className="max-w-3xl mx-auto px-3 py-4">
                    <div className="bg-white rounded shadow p-4">
                        <div className="text-center mb-4">
                            <h1 className="text-xl font-bold text-[#26658C]">Modifier la Demande d'Analyse</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Code affaire: <strong>{demande.code_affaire}</strong>
                            </p>
                            <div className="mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                                <p className="text-xs text-yellow-700">
                                    <strong>Statut actuel:</strong> {demande.statut}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex mb-4">
                            <div className={`flex-1 text-center py-2 ${currentStep >= 1 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                                <span className="font-medium text-xs">Informations entreprise</span>
                            </div>
                            <div className={`flex-1 text-center py-2 ${currentStep >= 2 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                                <span className="font-medium text-xs">Site d'intervention</span>
                            </div>
                            <div className={`flex-1 text-center py-2 ${currentStep >= 3 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                                <span className="font-medium text-xs">Postes de travail</span>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-[#26658C] mb-1">Informations de l'entreprise</h3>
                                        <div className="w-16 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                        <p className="text-sm text-blue-700 font-medium">
                                            <span className="font-bold">Matrice:</span> {getMatriceLabel()}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded p-4 border border-gray-200">
                                        <h4 className="text-md font-medium text-[#26658C] mb-3 flex items-center">
                                            <FaCheck className="mr-2 w-3 h-3" />
                                            Informations de l'entreprise
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    ICE <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ice}
                                                    onChange={handleIceChange}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="ICE entreprise"
                                                    required
                                                />
                                            </div>
                                            {errors.ice && <div className="text-red-500 text-xs mt-1 ml-36">{errors.ice}</div>}
                                            
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Raison sociale <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nom}
                                                    onChange={e => setData('nom', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Raison sociale"
                                                    required
                                                />
                                            </div>
                                            {errors.nom && <div className="text-red-500 text-xs mt-1 ml-36">{errors.nom}</div>}
                                            
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Adresse <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.adresse}
                                                    onChange={e => setData('adresse', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Adresse entreprise"
                                                    required
                                                />
                                            </div>
                                            {errors.adresse && <div className="text-red-500 text-xs mt-1 ml-36">{errors.adresse}</div>}
                                            
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Nom et prénom <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nom_prenom}
                                                    onChange={e => setData('nom_prenom', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Nom et prénom du contact"
                                                    required
                                                />
                                            </div>
                                            {errors.nom_prenom && <div className="text-red-500 text-xs mt-1 ml-36">{errors.nom_prenom}</div>}
                                            
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Fonction <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.contact_fonction}
                                                    onChange={e => setData('contact_fonction', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Fonction"
                                                    required
                                                />
                                            </div>
                                            {errors.contact_fonction && <div className="text-red-500 text-xs mt-1 ml-36">{errors.contact_fonction}</div>}
                                            
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Téléphone <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.telephone}
                                                    onChange={e => setData('telephone', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Téléphone"
                                                    required
                                                />
                                            </div>
                                            {errors.telephone && <div className="text-red-500 text-xs mt-1 ml-36">{errors.telephone}</div>}
                                            
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Email"
                                                    required
                                                />
                                            </div>
                                            {errors.email && <div className="text-red-500 text-xs mt-1 ml-36">{errors.email}</div>}

                                            {/* Sélection de la matrice */}
                                            <div className="flex items-center space-x-3">
                                                <label className="block text-sm font-medium text-gray-700 w-32">
                                                    Matrice d'analyse <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.matrice_id}
                                                    onChange={e => setData('matrice_id', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    required
                                                >
                                                    <option value="">Sélectionner une matrice</option>
                                                    {matrices.map((matrice) => (
                                                        <option key={matrice.id} value={matrice.id}>
                                                            {matrice.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.matrice_id && <div className="text-red-500 text-xs mt-1 ml-36">{errors.matrice_id}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-4 py-2 bg-[#26658C] text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                        >
                                            <span>Suivant</span>
                                            <FaArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-[#26658C] mb-1">Site d'intervention</h3>
                                        <div className="w-16 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    {sites.map((site, index) => (
                                        <div key={index} className="bg-gray-50 rounded p-4 border border-gray-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-md font-medium text-[#26658C] flex items-center">
                                                    <FaCheck className="mr-2 w-3 h-3" />
                                                    Site {index + 1}
                                                </h4>
                                                {sites.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSite(index)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center space-x-1"
                                                    >
                                                        <span>Supprimer</span>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center space-x-3">
                                                    <label className="block text-sm font-medium text-gray-700 w-32">
                                                        Responsable site <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={site.nom_site}
                                                        onChange={e => updateSite(index, 'nom_site', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Nom du responsable"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    <label className="block text-sm font-medium text-gray-700 w-32">
                                                        Ville <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={site.ville_id || ''}
                                                        onChange={e => updateSite(index, 'ville_id', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        required
                                                    >
                                                        <option value="">Sélectionner une ville</option>
                                                        {villes.map(ville => (
                                                            <option key={ville.id} value={ville.id}>
                                                                {ville.nom} 
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    <label className="block text-sm font-medium text-gray-700 w-32">
                                                       Nom de site
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={site.code_site}
                                                        onChange={e => {
                                                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                                            updateSite(index, 'code_site', value);
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Nom de site"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="flex justify-start pt-2">
                                        <button
                                            type="button"
                                            onClick={addSite}
                                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                        >
                                            <FaPlus className="w-3 h-3" />
                                            <span>Ajouter un site</span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between pt-4">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                        >
                                            <FaArrowLeft className="w-3 h-3" />
                                            <span>Précédent</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-4 py-2 bg-[#26658C] text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                        >
                                            <span>Suivant</span>
                                            <FaArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-[#26658C] mb-1">Postes de travail par site</h3>
                                        <div className="w-16 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    {sites.map((site, siteIndex) => (
                                        <div key={siteIndex} className="bg-gray-50 rounded p-4 border border-gray-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-md font-medium text-[#26658C] flex items-center">
                                                    <FaCheck className="mr-2 w-3 h-3" />
                                                    Site: {site.code_site || `Site ${siteIndex + 1}`}
                                                </h4>
                                                <span className="text-xs text-gray-500">
                                                    {site.postes.length} poste(s)
                                                </span>
                                            </div>
                                            
                                            {site.postes.map((poste, posteIndex) => (
                                                <div key={posteIndex} className="bg-white rounded p-3 border border-gray-200 mb-3">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h5 className="font-medium text-[#26658C] text-sm">
                                                            Poste {posteIndex + 1}
                                                        </h5>
                                                        {site.postes.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePosteFromSite(siteIndex, posteIndex)}
                                                                className="text-red-500 hover:text-red-700 text-xs"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <div className="flex items-center space-x-3">
                                                            <label className="block text-sm font-medium text-gray-700 w-32">
                                                                Poste de travail <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={poste.nom_poste}
                                                                onChange={e => updatePosteInSite(siteIndex, posteIndex, 'nom_poste', e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                placeholder="Poste de travail"
                                                                required
                                                            />
                                                        </div>
                                                        
                                                        <div className="flex items-center space-x-3">
                                                            <label className="block text-sm font-medium text-gray-700 w-32">
                                                                Zone/atelier <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={poste.zone_activite}
                                                                onChange={e => updatePosteInSite(siteIndex, posteIndex, 'zone_activite', e.target.value)}
                                                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                placeholder="Zone/atelier"
                                                                required
                                                            />
                                                        </div>
                                                        
                                                        <div className="border border-gray-300 rounded p-3 bg-gray-50">
                                                            <h6 className="text-xs font-medium text-gray-700 mb-2">Informations complémentaires (optionnelles)</h6>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div className="flex items-center space-x-3">
                                                                    <label className="block text-xs font-medium text-gray-700 w-28">
                                                                        Personnes exposées
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        value={poste.personnes_exposees}
                                                                        onChange={e => {
                                                                            const value = Math.max(1, parseInt(e.target.value) || 1);
                                                                            updatePosteInSite(siteIndex, posteIndex, 'personnes_exposees', value);
                                                                        }}
                                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                        placeholder="Nombre"
                                                                    />
                                                                </div>
                                                                
                                                                <div className="flex items-center space-x-3">
                                                                    <label className="block text-xs font-medium text-gray-700 w-28">
                                                                        Durée du shift
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        step="1"
                                                                        value={poste.duree_shift}
                                                                        onChange={e => {
                                                                            const value = Math.max(1, parseInt(e.target.value) || 1);
                                                                            updatePosteInSite(siteIndex, posteIndex, 'duree_shift', value);
                                                                        }}
                                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                        placeholder="Heures"
                                                                    />
                                                                </div>
                                                                
                                                                <div className="flex items-center space-x-3">
                                                                    <label className="block text-xs font-medium text-gray-700 w-28">
                                                                        Durée exposition
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0.25"
                                                                        max="24"
                                                                        step="0.25"
                                                                        value={poste.duree_exposition_quotidienne || ''}
                                                                        onChange={e => {
                                                                            const value = Math.max(0.25, Math.min(24, parseFloat(e.target.value) || 0.25));
                                                                            updatePosteInSite(siteIndex, posteIndex, 'duree_exposition_quotidienne', value);
                                                                        }}
                                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                        placeholder="Heures"
                                                                        title="Utilisez des décimales: 0.25=15min, 0.5=30min, 0.75=45min"
                                                                    />
                                                                </div>
                                                                
                                                                <div className="flex items-center space-x-3">
                                                                    <label className="block text-xs font-medium text-gray-700 w-28">
                                                                        Nombre de shifts
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        step="1"
                                                                        value={poste.nb_shifts}
                                                                        onChange={e => {
                                                                            const value = Math.max(1, parseInt(e.target.value) || 1);
                                                                            updatePosteInSite(siteIndex, posteIndex, 'nb_shifts', value);
                                                                        }}
                                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                        placeholder="Nombre"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h6 className="text-sm font-medium text-[#26658C]">
                                                                Produits à analyser
                                                            </h6>
                                                            <span className="text-xs text-gray-500">
                                                                {poste.produits?.length || 0} produit(s)
                                                            </span>
                                                        </div>
                                                        
                                                        {poste.produits?.map((produit, produitIndex) => (
                                                            <div key={produitIndex} className="mb-2 border border-gray-200 rounded">
                                                                <div className="flex justify-between items-center bg-gray-100 px-2 py-1">
                                                                    <h6 className="font-medium text-gray-700 text-sm">
                                                                        Produit {produitIndex + 1}
                                                                    </h6>
                                                                    {poste.produits.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeProduitFromPoste(siteIndex, posteIndex, produitIndex)}
                                                                            className="text-red-500 hover:text-red-700 text-xs"
                                                                        >
                                                                            Supprimer
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="p-2">
                                                                    <ProduitComposants 
                                                                        produit={produit}
                                                                        index={produitIndex}
                                                                        posteIndex={posteIndex}
                                                                        siteIndex={siteIndex}
                                                                        toggleComposant={toggleComposantInProduit}
                                                                        updateProduit={updateProduitInPoste}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        <div className="flex justify-start mt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => addProduitToPoste(siteIndex, posteIndex)}
                                                                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 transition duration-200 flex items-center space-x-2 text-xs"
                                                            >
                                                                <FaPlus className="w-3 h-3" />
                                                                <span>Ajouter un produit</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <div className="flex justify-start mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => addPosteToSite(siteIndex)}
                                                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500 transition duration-200 flex items-center space-x-2 text-xs"
                                                >
                                                    <FaPlus className="w-3 h-3" />
                                                    <span>Ajouter un poste</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="flex justify-between pt-4">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                        >
                                            <FaArrowLeft className="w-3 h-3" />
                                            <span>Précédent</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-[#26658C] text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2 font-medium text-sm shadow"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                    <span>Mise à jour...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="w-3 h-3" />
                                                    <span>Mettre à jour</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}