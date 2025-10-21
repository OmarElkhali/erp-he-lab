// import React, { useState } from "react";
// import { FaPen, FaDownload, FaBell } from "react-icons/fa";
// import axios from 'axios';

// export default function RecapitulatifTable({ data, onSubmit, onAddNew }) {
//   const [submissionStatus, setSubmissionStatus] = useState({});
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');

//   // 🔹 Générer un code d'affaire unique
//   const generateCodeAffaire = (index) => {
//     const date = new Date();
//     const dateStr = date.toISOString().split("T")[0].replace(/-/g, ""); // ex: 20251020
//     const idSuffix = String(index + 1).padStart(2, "0"); // 01, 02, ...
//     return `HT${dateStr}IDV${idSuffix}`;
//   };

//   // 🔹 Fonction pour soumettre une demande
//   const handleSubmit = async (poste, index) => {
//     try {
//       const codeAffaire = generateCodeAffaire(index);
      
//       const notificationData = {
//         code_affaire: codeAffaire,
//         entreprise: data.nom,
//         contact: `${data.contact_nom} ${data.contact_prenom}`,
//         poste: poste.nom_poste,
//         timestamp: new Date().toISOString(),
//         poste_data: poste,
//         entreprise_data: data
//       };

//       // Envoyer la notification à l'admin
//       const response = await axios.post('/notifications', {
//         type: 'chiffrage_soumission',
//         data: notificationData
//       });

//       // Mettre à jour le statut local
//       setSubmissionStatus(prev => ({
//         ...prev,
//         [index]: 'pending'
//       }));

//       // Afficher l'alerte
//       setAlertMessage('Votre demande a été soumise à l\'administrateur !');
//       setShowAlert(true);
      
//       // Cacher l'alerte après 5 secondes
//       setTimeout(() => {
//         setShowAlert(false);
//       }, 5000);

//     } catch (error) {
//       console.error('Erreur lors de la soumission:', error);
//       setAlertMessage('Erreur lors de la soumission de la demande');
//       setShowAlert(true);
//     }
//   };

//   // 🔹 Fonction pour simuler l'acceptation (à connecter avec l'admin plus tard)
//   const handleDownload = (index) => {
//     // Ici vous pouvez générer le PDF ou fichier à télécharger
//     alert(`Téléchargement du chiffrage ${generateCodeAffaire(index)}`);
    
//     // Réinitialiser le statut
//     setSubmissionStatus(prev => ({
//       ...prev,
//       [index]: null
//     }));
//   };

//   // 🔹 Fonction pour vérifier le statut (à implémenter avec WebSockets ou polling)
//   const getButtonState = (index) => {
//     return submissionStatus[index] || 'initial'; // 'initial', 'pending', 'accepted'
//   };

//   return (
//     <div className="h-screen flex flex-col bg-white">
//       {/* Alert Notification */}
//       {showAlert && (
//         <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
//           <FaBell className="text-white" />
//           <span>{alertMessage}</span>
//           <button 
//             onClick={() => setShowAlert(false)}
//             className="text-white hover:text-gray-200"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex justify-between items-center p-4 border-b shadow">
//         <h1 className="text-2xl font-bold text-[#26658C]">Récapitulatif</h1>
//         <button
//           onClick={onAddNew}
//           className="px-4 py-2 bg-[#26658C] text-white rounded hover:bg-blue-700"
//         >
//           + Ajouter une autre demande
//         </button>
//       </div>

//       {/* Tableau principal */}
//       <div className="flex-1 overflow-auto">
//         <table className="w-full border-collapse text-sm">
//           <thead className="bg-gray-100 sticky top-0 z-10">
//             <tr>
//               <th className="border p-2">Code d'Affaire</th>
//               <th className="border p-2">ICE</th>
//               <th className="border p-2">Nom Entreprise</th>
//               <th className="border p-2">Adresse</th>
//               <th className="border p-2">Contact</th>
//               <th className="border p-2">Fonction</th>
//               <th className="border p-2">Téléphone</th>
//               <th className="border p-2">Email</th>
//               <th className="border p-2">Nom Site</th>
//               <th className="border p-2">Ville</th>
//               <th className="border p-2">Nom Poste</th>
//               <th className="border p-2">Zone Activité</th>
//               <th className="border p-2">Description</th>
//               <th className="border p-2">Personnes exposées</th>
//               <th className="border p-2">Durée Shift</th>
//               <th className="border p-2">Exposition Quotidienne</th>
//               <th className="border p-2">Nb Shifts</th>
//               <th className="border p-2">Composants</th>
//               <th className="border p-2">Action</th>
//               <th className="border p-2">Statut</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.postes.map((poste, i) => {
//               const buttonState = getButtonState(i);
              
//               return (
//                 <tr
//                   key={i}
//                   className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition-colors"
//                 >
//                   <td className="border p-2 font-medium text-[#26658C]">
//                     {generateCodeAffaire(i)}
//                   </td>
//                   <td className="border p-2">{data.ice}</td>
//                   <td className="border p-2">{data.nom}</td>
//                   <td className="border p-2">{data.adresse}</td>
//                   <td className="border p-2">{`${data.contact_nom} ${data.contact_prenom}`}</td>
//                   <td className="border p-2">{data.contact_fonction}</td>
//                   <td className="border p-2">{data.telephone}</td>
//                   <td className="border p-2">{data.email}</td>
//                   <td className="border p-2">{data.sites[0]?.nom_site}</td>
//                   <td className="border p-2">{data.sites[0]?.ville}</td>
//                   <td className="border p-2">{poste.nom_poste}</td>
//                   <td className="border p-2">{poste.zone_activite}</td>
//                   <td className="border p-2">{poste.description}</td>
//                   <td className="border p-2">{poste.personnes_exposees}</td>
//                   <td className="border p-2">{poste.duree_shift}</td>
//                   <td className="border p-2">{poste.duree_exposition_quotidienne}</td>
//                   <td className="border p-2">{poste.nb_shifts}</td>
//                   <td className="border p-2">
//                     {poste.composants.length > 0 ? poste.composants.join(", ") : "-"}
//                   </td>

//                   {/* Action */}
//                   <td className="border p-2 text-center">
//                     <button
//                       type="button"
//                       onClick={() => alert(`Modifier le poste ${i + 1}`)}
//                       className="text-[#26658C] hover:text-blue-700"
//                       title="Modifier"
//                     >
//                       <FaPen size={18} />
//                     </button>
//                   </td>

//                   {/* Bouton Soumettre/Télécharger */}
//                   <td className="border p-2 text-center">
//                     {buttonState === 'initial' && (
//                       <button
//                         onClick={() => handleSubmit(poste, i)}
//                         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
//                       >
//                         Soumettre
//                       </button>
//                     )}
                    
//                     {buttonState === 'pending' && (
//                       <div className="flex flex-col items-center space-y-2">
//                         <div className="px-4 py-2 bg-yellow-500 text-white rounded">
//                           En attente...
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           En attente de validation admin
//                         </div>
//                       </div>
//                     )}
                    
//                     {buttonState === 'accepted' && (
//                       <button
//                         onClick={() => handleDownload(i)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
//                       >
//                         <FaDownload />
//                         <span>Télécharger</span>
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }