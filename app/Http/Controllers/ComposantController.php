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
        
        $composants = Composant::when($search, function ($query, $search) {
            return $query->where('nom', 'like', "%{$search}%")
                        ->orWhere('cas_number', 'like', "%{$search}%");
        })->get();

        return response()->json($composants);
    }
}