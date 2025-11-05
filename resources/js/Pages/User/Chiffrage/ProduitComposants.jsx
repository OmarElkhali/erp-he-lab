import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from "axios";

function ProduitComposants({ produit, index, posteIndex, siteIndex, toggleComposant, updateProduit }) {
    const [composants, setComposants] = useState([]);
    const [searchNom, setSearchNom] = useState('');
    const [searchCas, setSearchCas] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [selectedNom, setSelectedNom] = useState([]);
    const [selectedCas, setSelectedCas] = useState([]);
    const [errors, setErrors] = useState({});

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

    const validateField = (field, value) => {
        const newErrors = { ...errors };
        
        switch (field) {
            case 'nom':
                if (!value.trim()) {
                    newErrors.nom = 'Le nom du produit est obligatoire';
                } else {
                    delete newErrors.nom;
                }
                break;
            case 'description':
                if (!value.trim()) {
                    newErrors.description = 'La description est obligatoire';
                } else {
                    delete newErrors.description;
                }
                break;
            case 'composants':
                if (!value || value.length === 0) {
                    newErrors.composants = 'Au moins un composant doit être sélectionné';
                } else {
                    delete newErrors.composants;
                }
                break;
            default:
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNomProduitChange = (e) => {
        const value = e.target.value;
        updateProduit(siteIndex, posteIndex, index, 'nom', value);
        validateField('nom', value);
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        updateProduit(siteIndex, posteIndex, index, 'description', value);
        validateField('description', value);
    };

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
        
        toggleComposant(siteIndex, posteIndex, index, selectedIds);
        validateField('composants', selectedIds);
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
        
        toggleComposant(siteIndex, posteIndex, index, selectedIds);
        validateField('composants', selectedIds);
    };

    // Validation initiale au chargement
    useEffect(() => {
        if (produit.nom) validateField('nom', produit.nom);
        if (produit.description) validateField('description', produit.description);
        if (produit.composants && produit.composants.length > 0) validateField('composants', produit.composants);
    }, []);

    // Initialiser les selects avec les valeurs existantes
    useEffect(() => {
        if (composants.length > 0 && produit.composants && produit.composants.length > 0) {
            const initialSelected = composants
                .filter(composant => produit.composants.includes(composant.id))
                .map(composant => ({
                    value: composant.id,
                    label: composant.nom,
                    nom: composant.nom,
                    cas: composant.cas_number
                }));
            
            setSelectedNom(initialSelected);
            
            const initialCasSelected = composants
                .filter(composant => 
                    produit.composants.includes(composant.id) && composant.cas_number
                )
                .map(composant => ({
                    value: composant.id,
                    label: composant.cas_number,
                    nom: composant.nom,
                    cas: composant.cas_number
                }));
            
            setSelectedCas(initialCasSelected);
        }
    }, [composants, produit.composants]);

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
        
        return (
            <div className="flex flex-col">
                <span className="font-medium text-sm">{nom}</span>
                {cas && (
                    <span className="text-xs text-gray-500">CAS: {cas}</span>
                )}
            </div>
        );
    };

    // Fonction pour obtenir le style des champs en fonction des erreurs
    const getFieldClass = (fieldName) => {
        const baseClass = "flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-[#26658C] focus:border-transparent transition duration-200";
        return errors[fieldName] 
            ? `${baseClass} border-red-500 bg-red-50` 
            : `${baseClass} border-gray-300`;
    };

    const getSelectClass = (fieldName) => {
        const baseClass = "react-select-container";
        return errors[fieldName] 
            ? `${baseClass} border-red-500 rounded border` 
            : baseClass;
    };

    return (
        <div className="space-y-3">
            {/* Champ Nom du produit */}
            <div className="flex items-center space-x-3">
                <label className="block text-sm font-medium text-gray-700 w-32">
                    Nom du produit <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                    <input
                        type="text"
                        value={produit.nom}
                        onChange={handleNomProduitChange}
                        className={getFieldClass('nom')}
                        placeholder="Nom du produit à analyser"
                        required
                    />
                    {errors.nom && (
                        <div className="text-red-500 text-xs mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.nom}
                        </div>
                    )}
                </div>
            </div>

            {/* Champ Description */}
            <div className="flex items-start space-x-3">
                <label className="block text-sm font-medium text-gray-700 w-32 mt-2">
                    Description <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
                    <textarea
                        value={produit.description}
                        onChange={handleDescriptionChange}
                        className={getFieldClass('description')}
                        rows="2"
                        placeholder="Description détaillée du produit"
                        required
                    />
                    {errors.description && (
                        <div className="text-red-500 text-xs mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.description}
                        </div>
                    )}
                </div>
            </div>

            {/* Select par nom */}
            <div className="flex items-start space-x-3">
                <label className="block text-sm font-medium text-gray-700 w-32 mt-2">
                    Composants par nom <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
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
                        className={getSelectClass('composants')}
                        classNamePrefix="react-select"
                        formatOptionLabel={formatOptionLabel}
                        closeMenuOnSelect={false}
                        blurInputOnSelect={false}
                    />
                </div>
            </div>

            {/* Select par CAS */}
            <div className="flex items-start space-x-3">
                <label className="block text-sm font-medium text-gray-700 w-32 mt-2">
                    Composants par CAS <span className="text-red-500">*</span>
                </label>
                <div className="flex-1">
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
                        className={getSelectClass('composants')}
                        classNamePrefix="react-select"
                        formatOptionLabel={formatOptionLabel}
                        closeMenuOnSelect={false}
                        blurInputOnSelect={false}
                    />
                </div>
            </div>

            {/* Message d'erreur pour les composants */}
            {errors.composants && (
                <div className="flex items-center space-x-3">
                    <div className="w-32"></div>
                    <div className="flex-1 text-red-500 text-xs flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.composants}
                    </div>
                </div>
            )}

            {/* Indicateur de statut de validation */}
            <div className="flex items-center space-x-3">
                <div className="w-32"></div>
                <div className="flex-1">
                    {Object.keys(errors).length === 0 && produit.nom && produit.description && selectedNom.length > 0 && (
                        <div className="text-green-600 text-xs flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Tous les champs requis sont remplis
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProduitComposants;