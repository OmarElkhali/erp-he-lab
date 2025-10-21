<?php
// app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
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

        // Trouver l'admin
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            return response()->json(['error' => 'Aucun admin trouvé'], 404);
        }

        $notification = Notification::create([
            'user_id' => $admin->id,
            'type' => $request->type,
            'data' => $request->data,
            'is_read' => false,
            'is_accepted' => false
        ]);

        return response()->json([
            'message' => 'Notification envoyée avec succès',
            'notification' => $notification
        ]);
    }

    public function update(Request $request, Notification $notification)
    {
        $request->validate([
            'is_accepted' => 'boolean',
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
}