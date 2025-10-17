<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ChiffrageController extends Controller
{
    public function nouveau(Request $request)
    {
        $typeAnalyse = $request->query('type');
        
        return Inertia::render('User/Chiffrage/Nouveau', [
            'typeAnalyse' => $typeAnalyse
        ]);
    }
    //  public function nouveau()
    // {
    //     return Inertia::render('User/Chiffrage/nouveau');
    // }
}
