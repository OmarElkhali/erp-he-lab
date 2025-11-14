import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from "axios";
import ProduitComposants from './ProduitComposants';
import Swal from 'sweetalert2';
import { FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaPaperPlane, FaSave } from 'react-icons/fa';

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

    // 🔧 Fonction de sauvegarde améliorée avec gestion CSRF
    const handleSaveDraft = async () => {
        // Validation basique pour la sauvegarde
        if (!data.ice || !data.nom) {
            Swal.fire({
                icon: 'warning',
                title: 'Informations manquantes',
                text: 'Veuillez remplir au moins les informations de base de l\'entreprise pour sauvegarder',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        try {
            // 🔥 FIX: S'assurer que le token CSRF est rafraîchi
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.post('/sauvegardes', {
                matrice_id: data.matrice_id,
                data: {
                    ...data,
                    sites: sites // 🔥 FIX: Utiliser la dernière version de sites
                },
                current_step: currentStep,
                nom_sauvegarde: `Brouillon ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}`
            }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            // Nettoyer le localStorage après sauvegarde réussie
            localStorage.removeItem('demande_draft');
            localStorage.removeItem(`demande_draft_${matrice_id}`);

            await Swal.fire({
                icon: 'success',
                title: 'Brouillon sauvegardé!',
                text: 'Votre demande a été sauvegardée sur le serveur.',
                confirmButtonColor: '#26658C',
                timer: 1500,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Erreur sauvegarde serveur:', error);

            // 🔥 FIX: Sauvegarde locale de secours avec clé spécifique à la matrice
            const draftData = {
                ...data,
                sites: sites,
                statut: 'brouillon',
                saved_at: new Date().toISOString(),
                current_step: currentStep
            };

            localStorage.setItem(`demande_draft_${matrice_id}`, JSON.stringify(draftData));

            Swal.fire({
                icon: 'info',
                title: 'Sauvegardé localement',
                text: error.response?.status === 419
                    ? 'Session expirée. Brouillon sauvegardé localement. Rechargez la page.'
                    : 'Brouillon sauvegardé dans votre navigateur.',
                confirmButtonColor: '#26658C',
                timer: 3000
            });
        }
    };

    // 🔧 Fonction de chargement améliorée au démarrage
    useEffect(() => {
        const loadDraft = async () => {
            // Priorité 1: Charger depuis le serveur
            if (matrice_id) {
                try {
                    const response = await axios.get(`/api/sauvegardes/matrice/${matrice_id}`);
                    if (response.data && response.data.data) {
                        const savedData = response.data.data;

                        // 🔥 FIX: Reconstruire complètement les données
                        setData(prevData => ({
                            ...prevData,
                            ...savedData,
                            matrice_id: matrice_id
                        }));

                        // 🔥 FIX: S'assurer que sites a la bonne structure
                        if (savedData.sites && Array.isArray(savedData.sites)) {
                            setSites(savedData.sites);
                        }

                        setCurrentStep(response.data.current_step || 1);

                        Swal.fire({
                            icon: 'info',
                            title: 'Brouillon chargé',
                            html: `<p>Votre brouillon <b>"${response.data.nom_sauvegarde}"</b> a été restauré.</p>`,
                            confirmButtonColor: '#26658C',
                            timer: 2500,
                            showConfirmButton: false
                        });
                        return;
                    }
                } catch (error) {
                    console.log('Aucune sauvegarde serveur trouvée:', error.message);
                }
            }

            // Priorité 2: Charger depuis le localStorage (spécifique à la matrice)
            const savedDraftMatrice = localStorage.getItem(`demande_draft_${matrice_id}`);
            if (savedDraftMatrice) {
                try {
                    const draftData = JSON.parse(savedDraftMatrice);

                    setData(prevData => ({
                        ...prevData,
                        ...draftData,
                        matrice_id: matrice_id
                    }));

                    if (draftData.sites && Array.isArray(draftData.sites)) {
                        setSites(draftData.sites);
                    }

                    setCurrentStep(draftData.current_step || 1);

                    Swal.fire({
                        icon: 'info',
                        title: 'Brouillon local restauré',
                        text: `Sauvegardé le ${new Date(draftData.saved_at).toLocaleString('fr-FR')}`,
                        confirmButtonColor: '#26658C',
                        timer: 2500,
                        showConfirmButton: false
                    });
                    return;
                } catch (e) {
                    console.error('Erreur parsing brouillon local:', e);
                    localStorage.removeItem(`demande_draft_${matrice_id}`);
                }
            }

            // Priorité 3: Ancien format de localStorage (migration)
            const savedDraftOld = localStorage.getItem('demande_draft');
            if (savedDraftOld && matrice_id) {
                try {
                    const draftData = JSON.parse(savedDraftOld);
                    if (draftData.matrice_id === matrice_id) {
                        setData(prevData => ({ ...prevData, ...draftData }));
                        setSites(draftData.sites || sites);
                        setCurrentStep(draftData.current_step || 1);

                        // Migrer vers le nouveau format
                        localStorage.setItem(`demande_draft_${matrice_id}`, savedDraftOld);
                        localStorage.removeItem('demande_draft');

                        Swal.fire({
                            icon: 'info',
                            title: 'Brouillon restauré',
                            text: 'Ancien brouillon migré vers le nouveau système.',
                            confirmButtonColor: '#26658C',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                } catch (e) {
                    console.error('Erreur migration brouillon:', e);
                    localStorage.removeItem('demande_draft');
                }
            }
        };

        if (matrice_id) {
            // Attendre que le composant soit monté avant de charger
            const timer = setTimeout(() => {
                loadDraft();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [matrice_id]);

    // 🔧 Fonction de soumission finale améliorée avec validation complète
    const handleSubmit = (e) => {
        e.preventDefault();

        // 🔥 Validation 1: Informations de base
        if (!data.matrice_id || !data.ice || !data.nom || !data.email) {
            Swal.fire({
                icon: 'error',
                title: 'Champs manquants',
                text: 'Veuillez remplir tous les champs obligatoires de l\'entreprise',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        // 🔥 Validation 2: Sites
        if (!sites || sites.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Sites manquants',
                text: 'Veuillez ajouter au moins un site d\'intervention',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        // 🔥 Validation 3: Postes et Produits
        let hasPostes = false;
        let hasProduits = false;
        let validationErrors = [];

        sites.forEach((site, siteIndex) => {
            if (!site.nom_site || !site.ville_id) {
                validationErrors.push(`Site ${siteIndex + 1}: Nom responsable et ville requis`);
            }

            if (site.postes && site.postes.length > 0) {
                hasPostes = true;

                site.postes.forEach((poste, posteIndex) => {
                    if (!poste.nom_poste || !poste.zone_activite) {
                        validationErrors.push(`Site ${siteIndex + 1}, Poste ${posteIndex + 1}: Nom poste et zone requis`);
                    }

                    if (poste.produits && poste.produits.length > 0) {
                        hasProduits = true;

                        poste.produits.forEach((produit, produitIndex) => {
                            if (!produit.nom || !produit.description) {
                                validationErrors.push(`Site ${siteIndex + 1}, Poste ${posteIndex + 1}, Produit ${produitIndex + 1}: Nom et description requis`);
                            }

                            if (!produit.composants || produit.composants.length === 0) {
                                validationErrors.push(`Site ${siteIndex + 1}, Poste ${posteIndex + 1}, Produit ${produitIndex + 1}: Au moins un composant requis`);
                            }
                        });
                    }
                });
            }
        });

        if (!hasPostes) {
            Swal.fire({
                icon: 'error',
                title: 'Postes manquants',
                text: 'Veuillez ajouter au moins un poste de travail',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        if (!hasProduits) {
            Swal.fire({
                icon: 'error',
                title: 'Produits manquants',
                text: 'Veuillez ajouter au moins un produit à analyser',
                confirmButtonColor: '#26658C'
            });
            return;
        }

        if (validationErrors.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation échouée',
                html: `<div class="text-left"><ul style="list-style: disc; padding-left: 20px;">${validationErrors.map(err => `<li>${err}</li>`).join('')}</ul></div>`,
                confirmButtonColor: '#26658C',
                width: '600px'
            });
            return;
        }

        // 🔥 Confirmation avant soumission
        Swal.fire({
            icon: 'question',
            title: 'Confirmer la soumission',
            html: `
                <div class="text-left space-y-2">
                    <p><strong>Entreprise:</strong> ${data.nom}</p>
                    <p><strong>ICE:</strong> ${data.ice}</p>
                    <p><strong>Sites:</strong> ${sites.length}</p>
                    <p><strong>Postes:</strong> ${sites.reduce((sum, site) => sum + (site.postes?.length || 0), 0)}</p>
                    <p><strong>Produits:</strong> ${sites.reduce((sum, site) =>
                        sum + site.postes.reduce((pSum, poste) => pSum + (poste.produits?.length || 0), 0), 0)}</p>
                </div>
                <p class="mt-4 text-sm text-gray-600">Voulez-vous soumettre cette demande ?</p>
            `,
            showCancelButton: true,
            confirmButtonColor: '#26658C',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, soumettre',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                // 🔥 Préparer les données pour l'envoi
                const submissionData = {
                    ...data,
                    sites: sites,
                    contact_nom_demande: data.nom_prenom,
                    contact_email_demande: data.email,
                    contact_tel_demande: data.telephone
                };

                // 🔥 Soumettre avec Inertia
                post(route('demandes.store'), {
                    data: submissionData,
                    onSuccess: () => {
                        // Nettoyer tous les brouillons
                        localStorage.removeItem('demande_draft');
                        localStorage.removeItem(`demande_draft_${matrice_id}`);

                        Swal.fire({
                            icon: 'success',
                            title: 'Demande soumise!',
                            text: 'Votre demande a été enregistrée avec succès.',
                            confirmButtonColor: '#26658C',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            reset();
                        });
                    },
                    onError: (errors) => {
                        console.error('Erreurs de soumission:', errors);

                        // 🔥 Afficher les erreurs de manière détaillée
                        const errorMessages = Object.keys(errors).map(key => {
                            return `<li><strong>${key}:</strong> ${errors[key]}</li>`;
                        }).join('');

                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur de soumission',
                            html: errors.error || `<ul style="list-style: disc; text-align: left; padding-left: 20px;">${errorMessages}</ul>`,
                            confirmButtonColor: '#26658C',
                            width: '600px'
                        });

                        // Si erreur 419, sauvegarder localement
                        if (errors.message && errors.message.includes('419')) {
                            handleSaveDraft();
                        }
                    }
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

                                    <div className="flex justify-between pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSaveDraft}
                                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                        >
                                            <FaSave className="w-3 h-3" />
                                            <span>Sauvegarder</span>
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
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleSaveDraft}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                            >
                                                <FaSave className="w-3 h-3" />
                                                <span>Sauvegarder</span>
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
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleSaveDraft}
                                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500 transition duration-200 flex items-center space-x-2 font-medium text-sm"
                                            >
                                                <FaSave className="w-3 h-3" />
                                                <span>Sauvegarder</span>
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
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
