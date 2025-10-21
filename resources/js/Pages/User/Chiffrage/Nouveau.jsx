// resources/js/Pages/User/Chiffrage/Nouveau.jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import Select from 'react-select';
import { useState, useEffect } from 'react';
import axios from "axios";

export default function Nouveau({ auth, matrice_id, matrice }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sites, setSites] = useState([{ 
    nom_site: '', 
    ville: '', 
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
        // Si aucun résultat, on ne change rien
        console.log("Entreprise non trouvée");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Données à soumettre:', data);
    
    // Validation
    if (!data.matrice_id || !data.ice || !data.nom || data.sites.length === 0 || data.postes.length === 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    post(route('demandes.store'), {
      onSuccess: () => {
        console.log('Soumission réussie!');
        reset();
      },
      onError: (errors) => {
        console.log('Erreurs de soumission:', errors);
        alert('Erreur lors de la soumission. Vérifiez les données.');
      }
    });
  };

  // Fonctions pour les sites
  const addSite = () => {
    const newSites = [...sites, { 
      nom_site: '', 
      ville: '', 
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

  // Composant pour les composants
  function PosteComposants({ poste, index, toggleComposant }) {
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
      axios.get('/api/composants', { params: { search } })
        .then(res => {
          const sorted = res.data.sort((a, b) => a.nom.localeCompare(b.nom));
          setOptions(sorted.map(c => ({ 
            value: c.id, 
            label: `${c.nom} ${c.cas_number ? `(${c.cas_number})` : ''}`
          })));
        })
        .catch(error => {
          console.error('Erreur chargement composants:', error);
          setOptions([]);
        });
    }, [search]);

    return (
      <Select
        options={options}
        isMulti
        onInputChange={value => setSearch(value)}
        onChange={selected => {
          const ids = selected.map(s => s.value);
          toggleComposant(index, ids); 
        }}
        value={options.filter(o => poste.composants.includes(o.value))}
        placeholder="Sélectionner les composants"
        noOptionsMessage={({ inputValue }) => 
          inputValue ? "Aucun composant trouvé" : "Tapez pour rechercher..."
        }
        className="react-select-container"
        classNamePrefix="react-select"
      />
    );
  }

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
              <p className="mt-2 text-gray-600">
                {matrice ? `Matrice: ${matrice.label}` : 'Créez une nouvelle demande d\'analyse environnementale'}
              </p>
            </div>
            
            {/* Indicateur d'étapes */}
            <div className="flex mb-8">
              <div className={`flex-1 text-center py-2 ${currentStep >= 1 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                <span className="font-medium text-sm">Informations entreprise</span>
              </div>
              <div className={`flex-1 text-center py-2 ${currentStep >= 2 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                <span className="font-medium text-sm">Site d'intervention</span>
              </div>
              <div className={`flex-1 text-center py-2 ${currentStep >= 3 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                <span className="font-medium text-sm">Postes de travail</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* ÉTAPE 1 - INFORMATIONS ENTREPRISE */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#26658C] text-center">Informations de l'entreprise</h3>
                  
                  {matrice && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Matrice sélectionnée:</strong> {matrice.label}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ICE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.ice}
                        onChange={handleIceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                        placeholder="Saisir nom entreprise"
                        required
                      />
                      {errors.nom && <div className="text-red-500 text-sm mt-1">{errors.nom}</div>}
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.adresse}
                        onChange={e => setData('adresse', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                        placeholder="Saisir adresse entreprise"
                        required
                      />
                      {errors.adresse && <div className="text-red-500 text-sm mt-1">{errors.adresse}</div>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Nom <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.contact_nom}
                        onChange={e => setData('contact_nom', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                        placeholder="Saisir prénom contact"
                        required
                      />
                      {errors.contact_prenom && <div className="text-red-500 text-sm mt-1">{errors.contact_prenom}</div>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fonction <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={data.contact_fonction}
                        onChange={e => setData('contact_fonction', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                        placeholder="Saisir téléphone"
                        required
                      />
                      {errors.telephone && <div className="text-red-500 text-sm mt-1">{errors.telephone}</div>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                        placeholder="Saisir email"
                        required
                      />
                      {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              
              {/* ÉTAPE 2 - SITES D'INTERVENTION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#26658C] text-center">Site d'intervention</h3>
                  
                  {sites.map((site, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Site {index + 1}</h4>
                        {sites.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSite(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du responsable de site <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={site.nom_site}
                            onChange={e => updateSite(index, 'nom_site', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                            placeholder="Saisir nom du responsable de site"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ville <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={site.ville}
                            onChange={e => updateSite(index, 'ville', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                            placeholder="Saisir ville"
                            required
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Code site</label>
                          <input
                            type="text"
                            value={site.code_site}
                            onChange={e => updateSite(index, 'code_site', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                            placeholder="Saisir code site (optionnel)"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-start pt-4">
                    <button
                      type="button"
                      onClick={addSite}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                    >
                      + Ajouter un autre site d'intervention
                    </button>
                  </div>
                  
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                    >
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              
              {/* ÉTAPE 3 - POSTES DE TRAVAIL + SOUMISSION */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#26658C] text-center">Postes de travail</h3>
                  
                  {postes.map((poste, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Poste {index + 1}</h4>
                        {postes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePoste(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                              value={poste.personnes_exposees}
                              onChange={e => updatePoste(index, 'personnes_exposees', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                              step="0.5"
                              value={poste.duree_shift}
                              onChange={e => updatePoste(index, 'duree_shift', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                              step="0.5"
                              value={poste.duree_exposition_quotidienne}
                              onChange={e => updatePoste(index, 'duree_exposition_quotidienne', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                              value={poste.nb_shifts}
                              onChange={e => updatePoste(index, 'nb_shifts', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                              placeholder="Nombre de shifts par jour"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
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
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
                    >
                      + Ajouter un poste
                    </button>
                  </div>
                  
                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
                    >
                      Précédent
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200 flex items-center space-x-2"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Soumission...</span>
                        </>
                      ) : (
                        <>
                          <span>✅ Soumettre la Demande</span>
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