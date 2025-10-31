// resources/js/Pages/User/Chiffrage/Edit.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import ProduitComposants from './ProduitComposants';
import Swal from 'sweetalert2';
import { FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaPaperPlane, FaSave } from 'react-icons/fa';

export default function Edit({ auth, demande, matrices, villes }) {
    const [currentStep, setCurrentStep] = useState(1);
    
    // 🔹 Initialiser les données depuis la demande existante avec plusieurs sites et produits
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
                    produits: poste.produits ? poste.produits.map(produit => ({
                        id: produit.id,
                        nom: produit.nom,
                        description: produit.description,
                        composants: produit.composants ? produit.composants.map(c => c.id) : []
                    })) : [{
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
                    produits: poste.produits ? poste.produits.map(produit => ({
                        id: produit.id,
                        nom: produit.nom,
                        description: produit.description,
                        composants: produit.composants ? produit.composants.map(c => c.id) : []
                    })) : [{
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
        // Informations entreprise
        ice: demande.entreprise?.ice || '',
        nom: demande.entreprise?.nom || '',
        adresse: demande.entreprise?.adresse || '',
        contact_nom: demande.entreprise?.contact_nom || '',
        contact_prenom: demande.entreprise?.contact_prenom || '',
        contact_fonction: demande.entreprise?.contact_fonction || '',
        telephone: demande.entreprise?.telephone || '',
        email: demande.entreprise?.email || '',
        
        // Informations matrice
        matrice_id: demande.matrice_id || '',
        
        // Informations site
        sites: sites,
        
        // Informations demande
        contact_nom_demande: demande.contact_nom_demande || '',
        contact_email_demande: demande.contact_email_demande || '',
        contact_tel_demande: demande.contact_tel_demande || ''
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

        // Rechercher après 3 caractères ou plus
        if (value.length >= 3) {
            try {
                const response = await axios.get(`/entreprises/find/${value}`);
                const entreprise = response.data;

                // Remplir automatiquement les autres champs
                setData({
                    ...data,
                    ice: entreprise.ice,
                    nom: entreprise.nom,
                    adresse: entreprise.adresse,
                    contact_nom: entreprise.contact_nom,
                    contact_prenom: entreprise.contact_prenom || "",
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
        
        console.log('Données à mettre à jour:', data);
        
        // Validation
        if (!data.matrice_id || !data.ice || !data.nom || data.sites.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Champs manquants',
                text: 'Veuillez remplir tous les champs obligatoires',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        // Validation des postes pour chaque site
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

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const getMatriceLabel = () => {
        const selectedMatrice = matrices.find(m => m.id == data.matrice_id);
        return selectedMatrice ? selectedMatrice.label : 'Non spécifiée';
    };

    return (
        <AuthenticatedLayout user={auth.user} noWrapper>
            <Head title="Modifier la Demande d'Analyse" />
            
            <div className="min-vh-100 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#26658C]">Modifier la Demande d'Analyse</h1>
                            <p className="mt-2 text-gray-600">
                                Code affaire: <strong>{demande.code_affaire}</strong>
                            </p>
                            <div className="mt-2 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                                <p className="text-sm text-yellow-700">
                                    <strong>Statut actuel:</strong> {demande.statut}
                                </p>
                            </div>
                        </div>
                        
                        {/* Indicateur d'étapes */}
                        <div className="flex mb-8">
                            <div className={`flex-1 text-center py-3 ${currentStep >= 1 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                                <span className="font-medium text-sm">Informations entreprise</span>
                            </div>
                            <div className={`flex-1 text-center py-3 ${currentStep >= 2 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                                <span className="font-medium text-sm">Site d'intervention</span>
                            </div>
                            <div className={`flex-1 text-center py-3 ${currentStep >= 3 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                                <span className="font-medium text-sm">Postes de travail</span>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            {/* ÉTAPE 1 - INFORMATIONS ENTREPRISE */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-[#26658C] mb-2">Informations de l'entreprise</h3>
                                        <div className="w-20 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <p className="text-sm text-blue-700 font-medium">
                                            <span className="font-bold">Matrice sélectionnée:</span> {getMatriceLabel()}
                                        </p>
                                    </div>
                                    
                                    {/* Section Entreprise */}
                                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <h4 className="text-lg font-medium text-[#26658C] mb-4 flex items-center">
                                            <FaCheck className="mr-2" />
                                            Informations de l'entreprise
                                        </h4>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ICE <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.ice}
                                                    onChange={handleIceChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Saisir ICE entreprise"
                                                    required
                                                />
                                                {errors.ice && <div className="text-red-500 text-sm mt-1">{errors.ice}</div>}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nom entreprise <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.nom}
                                                    onChange={e => setData('nom', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Saisir nom entreprise"
                                                    required
                                                />
                                                {errors.nom && <div className="text-red-500 text-sm mt-1">{errors.nom}</div>}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Adresse <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.adresse}
                                                    onChange={e => setData('adresse', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Saisir adresse entreprise"
                                                    required
                                                />
                                                {errors.adresse && <div className="text-red-500 text-sm mt-1">{errors.adresse}</div>}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Contact Nom <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.contact_nom}
                                                        onChange={e => setData('contact_nom', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir nom contact"
                                                        required
                                                    />
                                                    {errors.contact_nom && <div className="text-red-500 text-sm mt-1">{errors.contact_nom}</div>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Contact Prénom <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.contact_prenom}
                                                        onChange={e => setData('contact_prenom', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir prénom contact"
                                                        required
                                                    />
                                                    {errors.contact_prenom && <div className="text-red-500 text-sm mt-1">{errors.contact_prenom}</div>}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Fonction <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.contact_fonction}
                                                        onChange={e => setData('contact_fonction', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir fonction contact"
                                                        required
                                                    />
                                                    {errors.contact_fonction && <div className="text-red-500 text-sm mt-1">{errors.contact_fonction}</div>}
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Téléphone <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={data.telephone}
                                                        onChange={e => setData('telephone', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir téléphone"
                                                        required
                                                    />
                                                    {errors.telephone && <div className="text-red-500 text-sm mt-1">{errors.telephone}</div>}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Saisir email"
                                                    required
                                                />
                                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                                            </div>

                                            {/* Sélection de la matrice */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Matrice d'analyse <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={data.matrice_id}
                                                    onChange={e => setData('matrice_id', e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    required
                                                >
                                                    <option value="">Sélectionner une matrice</option>
                                                    {matrices.map((matrice) => (
                                                        <option key={matrice.id} value={matrice.id}>
                                                            {matrice.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.matrice_id && <div className="text-red-500 text-sm mt-1">{errors.matrice_id}</div>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-6 py-3 bg-[#26658C] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2 font-medium"
                                        >
                                            <span>Suivant</span>
                                            <FaArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* ÉTAPE 2 - SITES D'INTERVENTION */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-[#26658C] mb-2">Site d'intervention</h3>
                                        <div className="w-20 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    {sites.map((site, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-lg font-medium text-[#26658C] flex items-center">
                                                    <FaCheck className="mr-2" />
                                                    Site {index + 1}
                                                </h4>
                                                {sites.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSite(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                                                    >
                                                        <span>Supprimer</span>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nom du responsable de site <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={site.nom_site}
                                                        onChange={e => updateSite(index, 'nom_site', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir nom du responsable de site"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Ville <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={site.ville_id || ''}
                                                        onChange={e => updateSite(index, 'ville_id', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
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
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Code site</label>
                                                    <input
                                                        type="text"
                                                        value={site.code_site}
                                                        onChange={e => {
                                                            const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                                                            updateSite(index, 'code_site', value);
                                                        }}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir le Code site"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="flex justify-start pt-4">
                                        <button
                                            type="button"
                                            onClick={addSite}
                                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 flex items-center space-x-2 font-medium"
                                        >
                                            <FaPlus className="w-4 h-4" />
                                            <span>Ajouter un autre site d'intervention</span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between pt-6">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium"
                                        >
                                            <FaArrowLeft className="w-4 h-4" />
                                            <span>Précédent</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            className="px-6 py-3 bg-[#26658C] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2 font-medium"
                                        >
                                            <span>Suivant</span>
                                            <FaArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* ÉTAPE 3 - POSTES DE TRAVAIL PAR SITE */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-[#26658C] mb-2">Postes de travail par site</h3>
                                        <div className="w-20 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    {sites.map((site, siteIndex) => (
                                        <div key={siteIndex} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-lg font-medium text-[#26658C] flex items-center">
                                                    <FaCheck className="mr-2" />
                                                    Site: {site.nom_site || `Site ${siteIndex + 1}`}
                                                </h4>
                                                <span className="text-sm text-gray-500">
                                                    {site.postes.length} poste(s)
                                                </span>
                                            </div>
                                            
                                            {/* Postes pour ce site */}
                                            {site.postes.map((poste, posteIndex) => (
                                                <div key={posteIndex} className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h5 className="font-medium text-[#26658C]">
                                                            Poste {posteIndex + 1}
                                                        </h5>
                                                        {site.postes.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePosteFromSite(siteIndex, posteIndex)}
                                                                className="text-red-500 hover:text-red-700 text-sm"
                                                            >
                                                                Supprimer ce poste
                                                            </button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Nom du poste <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={poste.nom_poste}
                                                                onChange={e => updatePosteInSite(siteIndex, posteIndex, 'nom_poste', e.target.value)}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                placeholder="Saisir nom du poste"
                                                                required
                                                            />
                                                        </div>
                                                        
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Zone d'activité <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={poste.zone_activite}
                                                                onChange={e => updatePosteInSite(siteIndex, posteIndex, 'zone_activite', e.target.value)}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                placeholder="Saisir zone d'activité"
                                                                required
                                                            />
                                                        </div>
                                                        
                                                        {/* Champs côte à côte */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Personnes exposées <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={poste.personnes_exposees}
                                                                    onChange={e => {
                                                                        const value = Math.max(1, parseInt(e.target.value) || 1);
                                                                        updatePosteInSite(siteIndex, posteIndex, 'personnes_exposees', value);
                                                                    }}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                    placeholder="Nombre de personnes"
                                                                    required
                                                                />
                                                            </div>
                                                            
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Durée du shift (heures) <span className="text-red-500">*</span>
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
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                    placeholder="Durée en heures"
                                                                    required
                                                                />
                                                            </div>
                                                            
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Durée exposition quotidienne (heures) <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    step="1"
                                                                    value={poste.duree_exposition_quotidienne}
                                                                    onChange={e => {
                                                                        const value = Math.max(1, parseInt(e.target.value) || 1);
                                                                        updatePosteInSite(siteIndex, posteIndex, 'duree_exposition_quotidienne', value);
                                                                    }}
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                    placeholder="Durée exposition en heures"
                                                                    required
                                                                />
                                                            </div>
                                                            
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                    Nombre de shifts <span className="text-red-500">*</span>
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
                                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                                    placeholder="Nombre de shifts par jour"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* PRODUITS à analyser */}
                                                    <div className="mt-6">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h6 className="text-lg font-medium text-[#26658C]">
                                                                Produits à analyser
                                                            </h6>
                                                            <span className="text-sm text-gray-500">
                                                                {poste.produits?.length || 0} produit(s)
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Liste des produits */}
                                                        {poste.produits?.map((produit, produitIndex) => (
                                                            <div key={produitIndex} className="mb-4 border border-gray-200 rounded-lg">
                                                                <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                                                                    <h6 className="font-medium text-gray-700">
                                                                        Produit {produitIndex + 1}
                                                                    </h6>
                                                                    {poste.produits.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeProduitFromPoste(siteIndex, posteIndex, produitIndex)}
                                                                            className="text-red-500 hover:text-red-700 text-sm"
                                                                        >
                                                                            Supprimer ce produit
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="p-4">
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
                                                        
                                                        {/* Bouton pour ajouter un produit */}
                                                        <div className="flex justify-start mt-4">
                                                            <button
                                                                type="button"
                                                                onClick={() => addProduitToPoste(siteIndex, posteIndex)}
                                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 flex items-center space-x-2 text-sm"
                                                            >
                                                                <FaPlus className="w-3 h-3" />
                                                                <span>Ajouter un produit</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Bouton pour ajouter un poste à ce site */}
                                            <div className="flex justify-start mt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => addPosteToSite(siteIndex)}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 flex items-center space-x-2 text-sm"
                                                >
                                                    <FaPlus className="w-3 h-3" />
                                                    <span>Ajouter un poste à ce site</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Boutons de navigation */}
                                    <div className="flex justify-between pt-8">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium"
                                        >
                                            <FaArrowLeft className="w-4 h-4" />
                                            <span>Précédent</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-8 py-3 bg-[#26658C] text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2 font-medium shadow-lg"
                                        >
                                            {processing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                    <span>Mise à jour...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="w-5 h-5" />
                                                    <span className="text-lg">Mettre à jour la Demande</span>
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