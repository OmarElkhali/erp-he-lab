<?php
// app/Http/Controllers/ComposantController.php
namespace App\Http\Controllers;

use App\Models\Composant;
use Illuminate\Http\Request;

class ComposantController extends Controller
{
   public function index(Request $request)
{
    $search = $request->query('search');
    $searchType = $request->query('search_type', 'nom'); // Par défaut recherche par nom
    
    $query = Composant::with('famille');
    
    if ($search) {
        if ($searchType === 'cas') {
            // Recherche par numéro CAS
            $query->where('cas_number', 'like', "%{$search}%");
        } else {
            // Recherche par nom (par défaut)
            $query->where('nom', 'like', "%{$search}%");
        }
    }
    
    $composants = $query->orderBy('nom')->get();
    
    return response()->json($composants);
}
}