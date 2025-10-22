<?php
// app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use App\Models\Demande;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->with(['user']) // Charger les informations de l'utilisateur
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'auth' => ['user' => auth()->user()]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'data' => 'required|array'
        ]);

        // Trouver tous les admins
        $admins = User::where('role', 'admin')->get();

        if ($admins->isEmpty()) {
            return response()->json(['error' => 'Aucun admin trouvé'], 404);
        }

        $notifications = [];
        foreach ($admins as $admin) {
            $notification = Notification::create([
                'user_id' => $admin->id,
                'type' => $request->type,
                'data' => $request->data,
                'is_read' => false,
                'is_accepted' => null
            ]);
            $notifications[] = $notification;
        }

        return response()->json([
            'message' => 'Notifications envoyées avec succès',
            'notifications' => $notifications
        ]);
    }

    public function update(Request $request, Notification $notification)
    {
        $request->validate([
            'is_accepted' => 'nullable|boolean',
            'is_read' => 'boolean'
        ]);

        // Vérifier que l'utilisateur peut modifier cette notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $notification->update($request->only(['is_accepted', 'is_read']));

        return response()->json([
            'message' => 'Notification mise à jour',
            'notification' => $notification
        ]);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Toutes les notifications marquées comme lues']);
    }

    public function getUnreadCount()
    {
        $count = Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    // Nouvelle méthode pour les notifications utilisateur
    public function getUserNotifications()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->whereIn('type', ['demande_acceptee', 'demande_refusee'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }
}