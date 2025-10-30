import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import { FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaPaperPlane } from 'react-icons/fa';

function PosteComposants({ poste, index, siteIndex, toggleComposant, updatePoste }) {
    const [composants, setComposants] = useState([]);
    const [searchNom, setSearchNom] = useState('');
    const [searchCas, setSearchCas] = useState('');
    const [loading, setLoading] = useState(false);
    
    // États séparés pour les selects
    const [selectedNom, setSelectedNom] = useState([]);
    const [selectedCas, setSelectedCas] = useState([]);
    
    // 🔹 État pour le produit
    const [produit, setProduit] = useState(poste.produit || '');

    // 🔹 CORRECTION : Charger TOUS les composants au départ
    useEffect(() => {
        setLoading(true);
        axios.get('/api/composants')
            .then(res => {
                setComposants(res.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erreur chargement composants:', error);
                setComposants([]);
                setLoading(false);
            });
    }, []); // 🔹 Charger une seule fois au montage

    // 🔹 CORRECTION : Filtrer les options en fonction de la recherche
    const nomOptions = composants
        .filter(c => 
            searchNom === '' || 
            c.nom.toLowerCase().includes(searchNom.toLowerCase())
        )
        .map(c => ({
            value: c.id,
            label: c.nom,
            nom: c.nom,
            cas: c.cas_number
        }));

    const casOptions = composants
        .filter(c => 
            c.cas_number && (
                searchCas === '' || 
                c.cas_number.includes(searchCas)
            )
        )
        .map(c => ({
            value: c.id,
            label: c.cas_number,
            nom: c.nom,
            cas: c.cas_number
        }));

    // 🔹 Gérer la sélection par nom
    const handleNomChange = (selected) => {
        const selectedIds = selected ? selected.map(s => s.value) : [];
        setSelectedNom(selected || []);
        
        // 🔹 CORRECTION : Synchroniser avec les options CAS
        const correspondingCas = selected ? selected.map(s => {
            const composant = composants.find(c => c.id === s.value);
            return composant && composant.cas_number ? {
                value: composant.id,
                label: composant.cas_number,
                nom: composant.nom,
                cas: composant.cas_number
            } : null;
        }).filter(Boolean) : [];
        
        setSelectedCas(correspondingCas);
        
        // Mettre à jour les composants du poste
        toggleComposant(siteIndex, index, selectedIds, produit);
    };

    // 🔹 Gérer la sélection par CAS
    const handleCasChange = (selected) => {
        const selectedIds = selected ? selected.map(s => s.value) : [];
        setSelectedCas(selected || []);
        
        // 🔹 CORRECTION : Synchroniser avec les options NOM
        const correspondingNoms = selected ? selected.map(s => {
            const composant = composants.find(c => c.id === s.value);
            return composant ? {
                value: composant.id,
                label: composant.nom,
                nom: composant.nom,
                cas: composant.cas_number
            } : null;
        }).filter(Boolean) : [];
        
        setSelectedNom(correspondingNoms);
        
        // Mettre à jour les composants du poste
        toggleComposant(siteIndex, index, selectedIds, produit);
    };

    // 🔹 Gérer le changement de produit
    const handleProduitChange = (e) => {
        const newProduit = e.target.value;
        setProduit(newProduit);
        
        // Récupérer les IDs actuellement sélectionnés
        const selectedIds = selectedNom.map(item => item.value);
        
        // Mettre à jour les composants avec le nouveau produit
        toggleComposant(siteIndex, index, selectedIds, newProduit);
    };

    // 🔹 Gérer le changement de description
    const handleDescriptionChange = (e) => {
        updatePoste(siteIndex, index, 'description', e.target.value);
    };

    // 🔹 CORRECTION : Initialiser les selects avec les valeurs existantes
    useEffect(() => {
        if (composants.length > 0 && poste.composants && poste.composants.length > 0) {
            // Récupérer les composants sélectionnés depuis la base de données
            const initialSelected = composants
                .filter(composant => poste.composants.includes(composant.id))
                .map(composant => ({
                    value: composant.id,
                    label: composant.nom,
                    nom: composant.nom,
                    cas: composant.cas_number
                }));
            
            setSelectedNom(initialSelected);
            
            // Récupérer les options CAS correspondantes
            const initialCasSelected = composants
                .filter(composant => 
                    poste.composants.includes(composant.id) && composant.cas_number
                )
                .map(composant => ({
                    value: composant.id,
                    label: composant.cas_number,
                    nom: composant.nom,
                    cas: composant.cas_number
                }));
            
            setSelectedCas(initialCasSelected);
        }
        
        // Initialiser le produit
        if (poste.produit) {
            setProduit(poste.produit);
        }
    }, [composants, poste.composants, poste.produit]);

    // 🔹 CORRECTION : Fonction pour formater les options
    const formatOptionLabel = ({ nom, cas }, { context }) => {
        if (context === 'menu') {
            return (
                <div className="flex flex-col py-1">
                    <span className="font-medium text-sm">{nom}</span>
                    {cas && (
                        <span className="text-xs text-gray-500">CAS: {cas}</span>
                    )}
                </div>
            );
        }
        
        // Format pour les valeurs sélectionnées
        return (
            <div className="flex flex-col">
                <span className="font-medium text-sm">{nom}</span>
                {cas && (
                    <span className="text-xs text-gray-500">CAS: {cas}</span>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* 🔹 Champ Produit */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produit <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={produit}
                    onChange={handleProduitChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                    placeholder="Saisir le nom du produit à analyser"
                    required
                />
            </div>

            {/* 🔹 DESCRIPTION */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={poste.description}
                    onChange={handleDescriptionChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                    rows="3"
                    placeholder="Décrire les opérations réalisées"
                    required
                />
            </div>

            {/* Select par nom */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du composant à analyser
                </label>
                <Select
                    options={nomOptions}
                    isMulti
                    onInputChange={value => setSearchNom(value)}
                    onChange={handleNomChange}
                    value={selectedNom}
                    placeholder="Rechercher par nom..."
                    noOptionsMessage={({ inputValue }) => 
                        inputValue ? "Aucun composant trouvé" : "Tapez pour rechercher..."
                    }
                    isLoading={loading}
                    loadingMessage={() => "Chargement..."}
                    className="react-select-container mb-3"
                    classNamePrefix="react-select"
                    formatOptionLabel={formatOptionLabel}
                    // 🔹 CORRECTION : Garder les options ouvertes pendant la recherche
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                />
            </div>

            {/* Select par CAS */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro CAS du composant à analyser
                </label>
                <Select
                    options={casOptions}
                    isMulti
                    onInputChange={value => setSearchCas(value)}
                    onChange={handleCasChange}
                    value={selectedCas}
                    placeholder="Rechercher par CAS..."
                    noOptionsMessage={({ inputValue }) => 
                        inputValue ? "Aucun composant trouvé" : "Tapez pour rechercher..."
                    }
                    isLoading={loading}
                    loadingMessage={() => "Chargement..."}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    formatOptionLabel={formatOptionLabel}
                    // 🔹 CORRECTION : Garder les options ouvertes pendant la recherche
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                />
            </div>

          
        </div>
    );
}

export default function Nouveau({ auth, matrice_id, matrice }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [villes, setVilles] = useState([]);
    const [loadingVilles, setLoadingVilles] = useState(true);
    const [sites, setSites] = useState([{ 
        nom_site: '', 
        ville_id: '',
        code_site: '',
        postes: [{  // Chaque site a ses propres postes
            nom_poste: '', 
            zone_activite: '', 
            description: '', 
            personnes_exposees: '', 
            duree_shift: '',
            duree_exposition_quotidienne: '',
            nb_shifts: '',
            produit: '',
            composants: []
        }]
    }]);

    // Fonction pour ajouter un poste à un site spécifique
    const addPosteToSite = (siteIndex) => {
        const newSites = [...sites];
        newSites[siteIndex].postes.push({
            nom_poste: '', 
            zone_activite: '', 
            description: '', 
            personnes_exposees: '', 
            duree_shift: '',
            duree_exposition_quotidienne: '',
            nb_shifts: '',
            produit: '',
            composants: []
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

    // Fonction pour gérer les composants d'un poste dans un site
    const toggleComposantInSite = (siteIndex, posteIndex, composantIds, produit = '') => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].composants = composantIds;
        if (produit !== '') {
            newSites[siteIndex].postes[posteIndex].produit = produit;
        }
        setSites(newSites);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        // Informations entreprise
        ice: '',
        nom: '',
        adresse: '',
        contact_nom: '',
        contact_prenom: '',
        contact_fonction: '',
        telephone: '',
        email: '',
        
        // Informations matrice
        matrice_id: matrice_id || '',
        
        // Informations site
        sites: sites,
        
        // Informations demande
        date_creation: new Date().toISOString().split('T')[0],
        statut: 'en_attente',
        contact_nom_demande: '',
        contact_email_demande: '',
        contact_tel_demande: ''
    });

    // 🔹 Charger les villes au montage du composant
    useEffect(() => {
        setLoadingVilles(true);
        axios.get('/api/villes')
            .then(res => {
                setVilles(res.data);
                setLoadingVilles(false);
            })
            .catch(err => {
                console.error('Erreur chargement villes:', err);
                setLoadingVilles(false);
            });
    }, []);

    // Mettre à jour les données quand sites changent
    useEffect(() => {
        setData('sites', sites);
    }, [sites]);

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
        
        console.log('Données à soumettre:', data);
        
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
        
        post(route('demandes.store'), {
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Votre demande a été soumise avec succès!',
                    confirmButtonColor: '#26658C',
                    timer: 3000
                });
                reset();
            },
            onError: (errors) => {
                console.log('Erreurs de soumission:', errors);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur lors de la soumission. Vérifiez les données.',
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
            postes: [{  // Nouveau site avec un poste vide
                nom_poste: '', 
                zone_activite: '', 
                description: '', 
                personnes_exposees: '', 
                duree_shift: '',
                duree_exposition_quotidienne: '',
                nb_shifts: '',
                produit: '',
                composants: []
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

    return (
        <AuthenticatedLayout user={auth.user} noWrapper>
            <Head title="Nouvelle Demande d'Analyse" />
            
            <div className="min-vh-100 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#26658C]">Nouvelle Demande d'Analyse</h1>
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
                                    
                                    {matrice && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                            <p className="text-sm text-blue-700 font-medium">
                                                <span className="font-bold">Matrice sélectionnée:</span> {matrice.label}
                                            </p>
                                        </div>
                                    )}
                                    
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
                                                        disabled={loadingVilles}
                                                    >
                                                        <option value="">{loadingVilles ? 'Chargement des villes...' : 'Sélectionner une ville'}</option>
                                                        {villes.map(ville => (
                                                            <option key={ville.id} value={ville.id}>
                                                                {ville.nom} 
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {loadingVilles && (
                                                        <div className="text-sm text-gray-500 mt-1">Chargement des villes...</div>
                                                    )}
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
                                                    
                                                    {/* Composants à analyser */}
                                                    <div className="mt-4">
                                                        <PosteComposants 
                                                            poste={poste} 
                                                            index={posteIndex}
                                                            siteIndex={siteIndex}
                                                            toggleComposant={toggleComposantInSite}
                                                            updatePoste={updatePosteInSite}
                                                        />
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
                                                    <span>Soumission...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="w-5 h-5" />
                                                    <span className="text-lg">Soumettre la Demande</span>
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