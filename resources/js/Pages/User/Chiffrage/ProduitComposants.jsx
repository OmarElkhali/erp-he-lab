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
    };

    const handleNomProduitChange = (e) => {
        updateProduit(siteIndex, posteIndex, index, 'nom', e.target.value);
    };

    const handleDescriptionChange = (e) => {
        updateProduit(siteIndex, posteIndex, index, 'description', e.target.value);
    };

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

    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
               
            </div>

            {/* Champ Nom du produit */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={produit.nom}
                    onChange={handleNomProduitChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                    placeholder="Saisir le nom du produit à analyser"
                    required
                />
            </div>

            {/* Champ Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={produit.description}
                    onChange={handleDescriptionChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#26658C] focus:border-transparent transition duration-200"
                    rows="3"
                    placeholder="Décrire le produit et ses utilisations"
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
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                />
            </div>
        </div>
    );
}

export default ProduitComposants;