import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from "axios";
import ProduitComposants from './ProduitComposants';
import Swal from 'sweetalert2';
import { FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaPaperPlane } from 'react-icons/fa';

function PosteComposants({ poste, index, siteIndex, toggleComposant, updatePoste }) {
    const [composants, setComposants] = useState([]);
    const [searchNom, setSearchNom] = useState('');
    const [searchCas, setSearchCas] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedNom, setSelectedNom] = useState([]);
    const [selectedCas, setSelectedCas] = useState([]);
    const [produit, setProduit] = useState(poste.produit || '');

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
    }, []);

    const nomOptions = composants
        .filter(c => searchNom === '' || c.nom.toLowerCase().includes(searchNom.toLowerCase()))
        .map(c => ({
            value: c.id,
            label: c.nom,
            nom: c.nom,
            cas: c.cas_number
        }));

    const casOptions = composants
        .filter(c => c.cas_number && (searchCas === '' || c.cas_number.includes(searchCas)))
        .map(c => ({
            value: c.id,
            label: c.cas_number,
            nom: c.nom,
            cas: c.cas_number
        }));

    const handleNomChange = (selected) => {
        const selectedIds = selected ? selected.map(s => s.value) : [];
        setSelectedNom(selected || []);
        
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
        toggleComposant(siteIndex, index, selectedIds, produit);
    };

    const handleCasChange = (selected) => {
        const selectedIds = selected ? selected.map(s => s.value) : [];
        setSelectedCas(selected || []);
        
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
        toggleComposant(siteIndex, index, selectedIds, produit);
    };

    const handleProduitChange = (e) => {
        const newProduit = e.target.value;
        setProduit(newProduit);
        const selectedIds = selectedNom.map(item => item.value);
        toggleComposant(siteIndex, index, selectedIds, newProduit);
    };

    const handleDescriptionChange = (e) => {
        updatePoste(siteIndex, index, 'description', e.target.value);
    };

    useEffect(() => {
        if (composants.length > 0 && poste.composants && poste.composants.length > 0) {
            const initialSelected = composants
                .filter(composant => poste.composants.includes(composant.id))
                .map(composant => ({
                    value: composant.id,
                    label: composant.nom,
                    nom: composant.nom,
                    cas: composant.cas_number
                }));
            
            setSelectedNom(initialSelected);
            
            const initialCasSelected = composants
                .filter(composant => poste.composants.includes(composant.id) && composant.cas_number)
                .map(composant => ({
                    value: composant.id,
                    label: composant.cas_number,
                    nom: composant.nom,
                    cas: composant.cas_number
                }));
            
            setSelectedCas(initialCasSelected);
        }
        
        if (poste.produit) {
            setProduit(poste.produit);
        }
    }, [composants, poste.composants, poste.produit]);

    const formatOptionLabel = ({ nom, cas }, { context }) => {
        if (context === 'menu') {
            return (
                <div className="flex flex-col py-1">
                    <span className="font-medium text-sm">{nom}</span>
                    {cas && <span className="text-xs text-gray-500">CAS: {cas}</span>}
                </div>
            );
        }
        
        return (
            <div className="flex flex-col">
                <span className="font-medium text-sm">{nom}</span>
                {cas && <span className="text-xs text-gray-500">CAS: {cas}</span>}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-4">
                <label className="block text-sm font-medium text-gray-700 w-32">
                    Produit <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={produit}
                    onChange={handleProduitChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                    placeholder="Nom du produit à analyser"
                    required
                />
            </div>

            <div className="flex items-start space-x-4">
                <label className="block text-sm font-medium text-gray-700 w-32 mt-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={poste.description}
                    onChange={handleDescriptionChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                    rows="2"
                    placeholder="Décrire les opérations réalisées"
                    required
                />
            </div>

            <div className="flex items-start space-x-4">
                <label className="block text-sm font-medium text-gray-700 w-32 mt-2">
                    Composants à analyser
                </label>
                <div className="flex-1 space-y-2">
                    <Select
                        options={nomOptions}
                        isMulti
                        onInputChange={value => setSearchNom(value)}
                        onChange={handleNomChange}
                        value={selectedNom}
                        placeholder="Rechercher par nom..."
                        noOptionsMessage={({ inputValue }) => inputValue ? "Aucun composant trouvé" : "Tapez pour rechercher..."}
                        isLoading={loading}
                        loadingMessage={() => "Chargement..."}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        formatOptionLabel={formatOptionLabel}
                        closeMenuOnSelect={false}
                        blurInputOnSelect={false}
                    />
                    
                    <Select
                        options={casOptions}
                        isMulti
                        onInputChange={value => setSearchCas(value)}
                        onChange={handleCasChange}
                        value={selectedCas}
                        placeholder="Rechercher par CAS..."
                        noOptionsMessage={({ inputValue }) => inputValue ? "Aucun composant trouvé" : "Tapez pour rechercher..."}
                        isLoading={loading}
                        loadingMessage={() => "Chargement..."}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        formatOptionLabel={formatOptionLabel}
                        closeMenuOnSelect={false}
                        blurInputOnSelect={false}
                    />
                </div>
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
    }]);

    const addProduitToPoste = (siteIndex, posteIndex) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].produits.push({
            nom: '',
            description: '',
            composants: []
        });
        setSites(newSites);
    };
    
    const removeProduitFromPoste = (siteIndex, posteIndex, produitIndex) => {
        const newSites = [...sites];
        if (newSites[siteIndex].postes[posteIndex].produits.length > 1) {
            newSites[siteIndex].postes[posteIndex].produits.splice(produitIndex, 1);
            setSites(newSites);
        }
    };
    
    const updateProduitInPoste = (siteIndex, posteIndex, produitIndex, field, value) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].produits[produitIndex][field] = value;
        setSites(newSites);
    };
    
    const toggleComposantInProduit = (siteIndex, posteIndex, produitIndex, composantIds) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex].produits[produitIndex].composants = composantIds;
        setSites(newSites);
    };

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

    const removePosteFromSite = (siteIndex, posteIndex) => {
        const newSites = [...sites];
        if (newSites[siteIndex].postes.length > 1) {
            newSites[siteIndex].postes.splice(posteIndex, 1);
            setSites(newSites);
        }
    };

    const updatePosteInSite = (siteIndex, posteIndex, field, value) => {
        const newSites = [...sites];
        newSites[siteIndex].postes[posteIndex][field] = value;
        setSites(newSites);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        ice: '',
        nom: '',
        adresse: '',
        nom_prenom: '',
        contact_fonction: '',
        telephone: '',
        email: '',
        matrice_id: matrice_id || '',
        sites: sites,
        date_creation: new Date().toISOString().split('T')[0],
        statut: 'en_attente',
        contact_nom_demande: '',
        contact_email_demande: '',
        contact_tel_demande: ''
    });

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

    useEffect(() => {
        setData('sites', sites);
    }, [sites]);

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

    return (
        <AuthenticatedLayout user={auth.user} noWrapper>
            <Head title="Nouvelle Demande d'Analyse" />
            
            <div className="min-vh-100 bg-gray-50 pb-8">
                <div className="max-w-3xl mx-auto px-3 py-4">
                    <div className="bg-white rounded shadow p-4">
                        <div className="text-center mb-4">
                            <h1 className="text-xl font-bold text-[#26658C]">Nouvelle Demande d'Analyse</h1>
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
                                    
                                    {matrice && (
                                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                            <p className="text-sm text-blue-700 font-medium">
                                                <span className="font-bold">Matrice:</span> {matrice.label}
                                            </p>
                                        </div>
                                    )}
                                    
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
                                                        disabled={loadingVilles}
                                                    >
                                                        <option value="">{loadingVilles ? 'Chargement...' : 'Sélectionner une ville'}</option>
                                                        {villes.map(ville => (
                                                            <option key={ville.id} value={ville.id}>
                                                                {ville.nom} 
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {loadingVilles && (
                                                    <div className="text-xs text-gray-500 mt-1 ml-36">Chargement des villes...</div>
                                                )}
                                                
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
                                                    <span>Soumission...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="w-3 h-3" />
                                                    <span>Soumettre</span>
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