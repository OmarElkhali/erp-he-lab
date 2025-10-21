<?php
// app/Http/Controllers/EntrepriseController.php
namespace App\Http\Controllers;

use App\Models\Entreprise;
use Illuminate\Http\Request;

class EntrepriseController extends Controller
{
    public function findByIce($ice)
    {
        $entreprise = Entreprise::where('ice', $ice)->first();
        
        if (!$entreprise) {
            return response()->json(['error' => 'Entreprise non trouvée'], 404);
        }

        return response()->json($entreprise);
    }
}