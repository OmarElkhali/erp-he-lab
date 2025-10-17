import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Nouveau({ auth }) {
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
  const composantsDisponibles = [
    { id: 1, nom: 'Amiante', cas_number: '1332-21-4', famille: 'Fibres', vlep: '0.1 f/ml', prix_analyse: 150 },
    { id: 2, nom: 'Plomb', cas_number: '7439-92-1', famille: 'Métaux', vlep: '0.15 mg/m³', prix_analyse: 120 },
    { id: 3, nom: 'Benzène', cas_number: '71-43-2', famille: 'Solvants', vlep: '1 ppm', prix_analyse: 100 },
    { id: 4, nom: 'Poussières', cas_number: 'N/A', famille: 'Aérosols', vlep: '10 mg/m³', prix_analyse: 80 },
    { id: 5, nom: 'Monoxyde de carbone', cas_number: '630-08-0', famille: 'Gaz', vlep: '25 ppm', prix_analyse: 90 },
  ];

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

  const toggleComposant = (posteIndex, composantId) => {
    const newPostes = [...postes];
    const composantIndex = newPostes[posteIndex].composants.indexOf(composantId);
    
    if (composantIndex === -1) {
      newPostes[posteIndex].composants.push(composantId);
    } else {
      newPostes[posteIndex].composants.splice(composantIndex, 1);
    }
    
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
    <AuthenticatedLayout user={auth.user}>
      <Head title="Nouvelle Demande d'Analyse" />
      <div className="container mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold text-[#26658C]">Nouvelle Demande d'Analyse</h1>
        <p className="mt-4 text-gray-600">Créez une nouvelle demande d'analyse environnementale</p>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Formulaire de Demande</h2>
          
          {/* Indicateur d'étapes */}
          <div className="flex mb-8">
            <div className={`flex-1 text-center py-2 ${currentStep >= 1 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
              <span className="font-medium">Informations entreprise</span>
            </div>
            <div className={`flex-1 text-center py-2 ${currentStep >= 2 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
              <span className="font-medium">Site d'intervention</span>
            </div>
            <div className={`flex-1 text-center py-2 ${currentStep >= 3 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
              <span className="font-medium">Postes de travail</span>
            </div>
            <div className={`flex-1 text-center py-2 ${currentStep >= 4 ? 'bg-[#26658C] text-white' : 'bg-gray-200'}`}>
              <span className="font-medium">Récapitulatif</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Étape 1: Informations entreprise */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-[#26658C]">Informations de l'entreprise</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ICE <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.ice}
                      onChange={e => setData('ice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#26658C]"
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
                      required
                    />
                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            
            {/* Étape 2: Site d'intervention */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-[#26658C]">Site d'intervention</h3>
                
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
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSite}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  + Ajouter un autre site d'intervention
                </button>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            
            {/* Étape 3: Postes de travail */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-[#26658C]">Postes de travail</h3>
                
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
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Composants à analyser</label>
                      <div className="grid grid-cols-1 gap-2">
                        {composantsDisponibles.map(composant => (
                          <div key={composant.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`poste-${index}-composant-${composant.id}`}
                              checked={poste.composants.includes(composant.id)}
                              onChange={() => toggleComposant(index, composant.id)}
                              className="h-4 w-4 text-[#26658C] focus:ring-[#26658C] border-gray-300 rounded"
                            />
                            <label htmlFor={`poste-${index}-composant-${composant.id}`} className="ml-2 text-sm text-gray-700">
                              {composant.nom} ({composant.prix_analyse}€)
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addPoste}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Ajouter un poste
                </button>
                
                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C]"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
            
            {/* Étape 4: Récapitulatif */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-[#26658C]">Récapitulatif de la demande</h3>
                
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
                      <p><strong>Composants à analyser:</strong> {poste.composants.map(id => {
                        const composant = composantsDisponibles.find(c => c.id === id);
                        return composant ? composant.nom : '';
                      }).join(', ')}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Précédent
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-6 py-2 bg-[#26658C] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#26658C] disabled:opacity-50"
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