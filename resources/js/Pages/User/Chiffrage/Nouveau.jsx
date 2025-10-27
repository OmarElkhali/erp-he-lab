import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect, useCallback } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import { FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaPaperPlane } from 'react-icons/fa';

// 🔹 Composant dédié pour les composants avec debounce
function PosteComposants({ poste, index, toggleComposant }) {
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // 🔹 Debounce pour éviter les appels API trop fréquents
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search.length >= 2 || search.length === 0) {
                setLoading(true);
                axios.get('/api/composants', { params: { search } })
                    .then(res => {
                        const sorted = res.data.sort((a, b) => a.nom.localeCompare(b.nom));
                        setOptions(sorted.map(c => ({ 
                            value: c.id, 
                            label: `${c.nom} ${c.cas_number ? `(${c.cas_number})` : ''}`
                        })));
                        setLoading(false);
                    })
                    .catch(error => {
                        console.error('Erreur chargement composants:', error);
                        setOptions([]);
                        setLoading(false);
                    });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    return (
        <Select
            options={options}
            isMulti
            onInputChange={value => setSearch(value)}
            onChange={selected => {
                const ids = selected ? selected.map(s => s.value) : [];
                toggleComposant(index, ids); 
            }}
            value={options.filter(o => poste.composants.includes(o.value))}
            placeholder="Sélectionner les composants"
            noOptionsMessage={({ inputValue }) => 
                inputValue ? "Aucun composant trouvé" : "Tapez pour rechercher..."
            }
            isLoading={loading}
            loadingMessage={() => "Chargement..."}
            className="react-select-container"
            classNamePrefix="react-select"
        />
    );
}

export default function Nouveau({ auth, matrice_id, matrice }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [villes, setVilles] = useState([]);
    const [loadingVilles, setLoadingVilles] = useState(true);
    const [sites, setSites] = useState([{ 
        nom_site: '', 
        ville_id: '',
        code_site: '' 
    }]);
    
    const [postes, setPostes] = useState([{ 
        nom_poste: '', 
        zone_activite: '', 
        description: '', 
        personnes_exposees: '', 
        duree_shift: '',
        duree_exposition_quotidienne: '',
        nb_shifts: '',
        composants: []
    }]);

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
        contact_tel_demande: '',
        
        // Postes
        postes: postes
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

    // Mettre à jour les données quand sites ou postes changent
    useEffect(() => {
        setData('sites', sites);
    }, [sites]);

    useEffect(() => {
        setData('postes', postes);
    }, [postes]);

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
        if (!data.matrice_id || !data.ice || !data.nom || data.sites.length === 0 || data.postes.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Champs manquants',
                text: 'Veuillez remplir tous les champs obligatoires',
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
            code_site: '' 
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

    // Fonctions pour les postes
    const addPoste = () => {
        const newPostes = [...postes, { 
            nom_poste: '', 
            zone_activite: '', 
            description: '', 
            personnes_exposees: '', 
            duree_shift: '',
            duree_exposition_quotidienne: '',
            nb_shifts: '',
            composants: []
        }];
        setPostes(newPostes);
    };

    const removePoste = (index) => {
        if (postes.length > 1) {
            const newPostes = postes.filter((_, i) => i !== index);
            setPostes(newPostes);
        }
    };

    const updatePoste = (index, field, value) => {
        const newPostes = [...postes];
        newPostes[index][field] = value;
        setPostes(newPostes);
    };

    const toggleComposant = (posteIndex, composantIds) => {
        const newPostes = [...postes];
        newPostes[posteIndex].composants = composantIds; 
        setPostes(newPostes);
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
                            
                            {/* ÉTAPE 3 - POSTES DE TRAVAIL + SOUMISSION */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="text-xl font-semibold text-[#26658C] mb-2">Postes de travail</h3>
                                        <div className="w-20 h-1 bg-[#26658C] mx-auto rounded"></div>
                                    </div>
                                    
                                    {postes.map((poste, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                            <div className="flex justify-between items-center mb-6">
                                                <h4 className="text-lg font-medium text-[#26658C] flex items-center">
                                                    <FaCheck className="mr-2" />
                                                    Poste {index + 1}
                                                </h4>
                                                {postes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removePoste(index)}
                                                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Supprimer
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
                                                        onChange={e => updatePoste(index, 'nom_poste', e.target.value)}
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
                                                        onChange={e => updatePoste(index, 'zone_activite', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        placeholder="Saisir zone d'activité"
                                                        required
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Description <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={poste.description}
                                                        onChange={e => updatePoste(index, 'description', e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                        rows="3"
                                                        placeholder="Décrire les opérations réalisées"
                                                        required
                                                    />
                                                </div>
                                                
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
                                                                updatePoste(index, 'personnes_exposees', value);
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
                                                                updatePoste(index, 'duree_shift', value);
                                                            }}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                            placeholder="Durée en heures "
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
                                                                updatePoste(index, 'duree_exposition_quotidienne', value);
                                                            }}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                            placeholder="Durée exposition en heures "
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
                                                        updatePoste(index, 'nb_shifts', value);
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                                                    placeholder="Nombre de shifts par jour "
                                                    required
                                                />                                                   </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Composants à analyser</label>
                                                <PosteComposants 
                                                    poste={poste} 
                                                    index={index} 
                                                    toggleComposant={toggleComposant} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="flex justify-start pt-4">
                                        <button
                                            type="button"
                                            onClick={addPoste}
                                            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 flex items-center space-x-2 font-medium"
                                        >
                                            <FaPlus className="w-4 h-4" />
                                            <span>Ajouter un poste</span>
                                        </button>
                                    </div>
                                    
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