import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Select from 'react-select';
import { useState,useEffect } from 'react';
import axios from "axios";

export default function Nouveau({ auth }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sites, setSites] = useState([{ 
    nom_site: '', 
    ville: '', 
    code_site: '' 
  }]);
  
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

  const { data, setData, post, processing, errors } = useForm({
    // Informations entreprise
    ice: '',
    nom: '',
    adresse: '',
    contact_nom: '',
    contact_prenom: '',
    contact_fonction: '',
    telephone: '',
    email: '',
    
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

  // Composants disponibles pour l'analyse

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('demandes.store'));
  };

  // Fonctions pour les sites
  const addSite = () => {
    const newSites = [...sites, { 
      nom_site: '', 
      ville: '', 
      code_site: '' 
    }];
    setSites(newSites);
    setData('sites', newSites);
  };

  const removeSite = (index) => {
    if (sites.length > 1) {
      const newSites = [...sites];
      newSites.splice(index, 1);
      setSites(newSites);
      setData('sites', newSites);
    }
  };

  const updateSite = (index, field, value) => {
    const newSites = [...sites];
    newSites[index][field] = value;
    setSites(newSites);
    setData('sites', newSites);
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
    setData('postes', newPostes);
  };

  const removePoste = (index) => {
    if (postes.length > 1) {
      const newPostes = [...postes];
      newPostes.splice(index, 1);
      setPostes(newPostes);
      setData('postes', newPostes);
    }
  };

  const updatePoste = (index, field, value) => {
    const newPostes = [...postes];
    newPostes[index][field] = value;
    setPostes(newPostes);
    setData('postes', newPostes);
  };

  function PosteComposants({ poste, index, toggleComposant }) {
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
      axios.get('/api/composants', { params: { search } })
        .then(res => {
          // Tri alphabétique côté frontend 
          const sorted = res.data.sort((a, b) => a.nom.localeCompare(b.nom));
          setOptions(sorted.map(c => ({ value: c.id, label: `${c.nom} ` })));
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
      />
    );
  }

  const toggleComposant = (posteIndex, composantIds) => {
    const newPostes = [...postes];
    newPostes[posteIndex].composants = composantIds; 
    setPostes(newPostes);
    setData('postes', newPostes);
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
      
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#26658C]">Nouvelle Demande d'Analyse</h1>
          <p className="mt-2 text-gray-600">Créez une nouvelle demande d'analyse environnementale</p>
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
              <div className={`flex-1 text-center py-2 ${currentStep >= 4 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
                <span className="font-medium text-sm">Récapitulatif</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Étape 1: Informations entreprise */}
             {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#26658C] text-center">Informations de l'entreprise</h3>
                  
                  <div className="space-y-4">
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
                    
                    <div>
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
              
              {/* Étape 2: Site d'intervention */}
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
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du site <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={site.nom_site}
                            onChange={e => updateSite(index, 'nom_site', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                            placeholder="Saisir nom du site"
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
                        
                        <div>
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
              
              {/* Étape 3: Postes de travail */}
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
                      +  Ajouter un poste
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
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] transition duration-200"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
              
              {/* Étape 4: Récapitulatif */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[#26658C] text-center">Récapitulatif de la demande</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Informations entreprise</h4>
                    <p><strong>ICE:</strong> {data.ice}</p>
                    <p><strong>Nom:</strong> {data.nom}</p>
                    <p><strong>Adresse:</strong> {data.adresse}</p>
                    <p><strong>Contact:</strong> {data.contact_prenom} {data.contact_nom}</p>
                    <p><strong>Fonction:</strong> {data.contact_fonction}</p>
                    <p><strong>Téléphone:</strong> {data.telephone}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    
                    <h4 className="font-medium mt-4 mb-2">Sites d'intervention</h4>
                    {sites.map((site, index) => (
                      <div key={index} className="mb-3">
                        <p><strong>Site {index + 1}:</strong> {site.nom_site}</p>
                        <p><strong>Ville:</strong> {site.ville}</p>
                        <p><strong>Code site:</strong> {site.code_site}</p>
                      </div>
                    ))}
                    
                    <h4 className="font-medium mt-4 mb-2">Postes de travail</h4>
                    {postes.map((poste, index) => (
                      <div key={index} className="mb-3">
                        <p><strong>Poste {index + 1}:</strong> {poste.nom_poste}</p>
                        <p><strong>Zone d'activité:</strong> {poste.zone_activite}</p>
                        <p><strong>Personnes exposées:</strong> {poste.personnes_exposees}</p>
                        <p><strong>Composants à analyser:</strong> {poste.composants.join(', ')}</p>
                      </div>
                    ))}
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
                      type="submit"
                      disabled={processing}
                      className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] disabled:opacity-50 transition duration-200"
                    >
                      {processing ? 'Envoi en cours...' : 'Soumettre la demande'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
     
    </AuthenticatedLayout>
  );
}