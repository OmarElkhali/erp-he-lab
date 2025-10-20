<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\Devis;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PDF;

class DemandeController extends Controller
{
    public function create()
    {
        return Inertia::render('Demandes/Nouveau');
    }

    public function store(Request $request)
    {
        $request->validate([
            'ice' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'type_chiffrage' => 'required|string',
            // ... autres validations
        ]);

        // Générer le numéro d'affaire
        $numeroAffaire = Demande::generateNumeroAffaire($request->type_chiffrage);

        // Calculer le montant total
        $montantTotal = $this->calculerMontantTotal($request->postes, $request->type_chiffrage);

        $demande = Demande::create([
            'numero_affaire' => $numeroAffaire,
            'ice' => $request->ice,
            'nom_entreprise' => $request->nom,
            'adresse' => $request->adresse,
            'contact_nom' => $request->contact_nom,
            'contact_prenom' => $request->contact_prenom,
            'contact_fonction' => $request->contact_fonction,
            'telephone' => $request->telephone,
            'email' => $request->email,
            'type_chiffrage' => $request->type_chiffrage,
            'date_creation' => now(),
            'statut' => 'soumis',
            'sites' => $request->sites,
            'postes' => $request->postes,
            'montant_total' => $montantTotal,
            'devis_genere' => false,
            'user_id' => auth()->id(),
        ]);

        // Notifier les administrateurs
        $this->notifierAdministrateurs($demande);

        return redirect()->route('demandes.show', $demande->id)
            ->with('success', 'Demande créée avec succès!');
    }

    // Méthode pour l'admin pour approuver la demande
    public function approuverDemande(Request $request, Demande $demande)
    {
        $demande->update([
            'statut' => 'approuve',
            'admin_id' => auth()->id(),
            'date_validation' => now(),
            'devis_genere' => true
        ]);

        // Générer le devis PDF
        $devis = $this->genererDevis($demande);

        return response()->json([
            'success' => true,
            'devis_url' => route('devis.download', $devis->id)
        ]);
    }

    // Générer le PDF du devis
    public function genererDevisPdf(Demande $demande)
    {
        // $pdf = PDF::loadView('devis.template', [
        //     'demande' => $demande,
        //     'devis' => $demande->devis
        // ]);

        // return $pdf->download("devis-{$demande->numero_affaire}.pdf");
    }

    private function calculerMontantTotal($postes, $typeChiffrage)
    {
        // Logique de calcul basée sur le type de chiffrage
        $tarifs = config("tarifs.{$typeChiffrage}");
        
        $total = 0;
        // Implémenter la logique de calcul spécifique
        // ...

        return $total;
    }

    private function notifierAdministrateurs(Demande $demande)
    {
        $admins = User::where('role', 'admin')->get();
        
        // foreach ($admins as $admin) {
        //     // Envoyer notification (email, notification in-app, etc.)
        //     $admin->notify(new NouvelleDemandeNotification($demande));
        // }
    }
}