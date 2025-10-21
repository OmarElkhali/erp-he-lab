<?php
// database/seeders/EntrepriseSeeder.php
namespace Database\Seeders;

use App\Models\Entreprise;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EntrepriseSeeder extends Seeder
{
    public function run()
    {
        $entreprises = [
            [
                'ice' => '001234567890123',
                'nom' => 'OCP SA',
                'adresse' => 'Angle Route d’El Jadida et BD de la Grande Ceinture, Casablanca',
                'contact_nom' => 'ALAOUI',
                'contact_prenom' => 'Mohamed',
                'contact_fonction' => 'Responsable HSE',
                'telephone' => '0522443344',
                'email' => 'hse@ocp.ma',
            ],
            [
                'ice' => '001122334455667',
                'nom' => 'Maroc Telecom',
                'adresse' => 'Avenue Annakhil, Hay Riad, Rabat',
                'contact_nom' => 'BENNANI',
                'contact_prenom' => 'Fatima',
                'contact_fonction' => 'Chef de Service Environnement',
                'telephone' => '0537778899',
                'email' => 'environnement@iam.ma',
            ],
            [
                'ice' => '002233445566778',
                'nom' => 'LafargeHolcim Maroc',
                'adresse' => 'Tour Atlas, Angle routes des Zaers et Moulay Youssef, Rabat',
                'contact_nom' => 'IDRISSI',
                'contact_prenom' => 'Karim',
                'contact_fonction' => 'Ingénieur QHSE',
                'telephone' => '0537665544',
                'email' => 'qhse@lafargeholcim.ma',
            ],
            [
                'ice' => '003344556677889',
                'nom' => 'ONEE',
                'adresse' => '65, Rue Othman Ben Affan, Rabat',
                'contact_nom' => 'CHRAIBI',
                'contact_prenom' => 'Hassan',
                'contact_fonction' => 'Responsable Qualité',
                'telephone' => '0537889900',
                'email' => 'qualite@onee.ma',
            ],
            [
                'ice' => '004455667788990',
                'nom' => 'Sonasid',
                'adresse' => 'Zone Industrielle, Nador',
                'contact_nom' => 'EL FASSI',
                'contact_prenom' => 'Amina',
                'contact_fonction' => 'Chef de Laboratoire',
                'telephone' => '0536554433',
                'email' => 'laboratoire@sonasid.ma',
            ],
            [
                'ice' => '005566778899001',
                'nom' => 'Cosumar',
                'adresse' => '165, Boulevard d\'Anfa, Casablanca',
                'contact_nom' => 'TAZI',
                'contact_prenom' => 'Rachid',
                'contact_fonction' => 'Responsable Environnement',
                'telephone' => '0522998877',
                'email' => 'environnement@cosumar.co.ma',
            ],
            [
                'ice' => '006677889900112',
                'nom' => 'Managem',
                'adresse' => 'Angle Rue Abderrahmane El Ghafiki et Rue Annakhil, Hay Riad, Rabat',
                'contact_nom' => 'BELKHAYAT',
                'contact_prenom' => 'Samira',
                'contact_fonction' => 'Ingénieur Process',
                'telephone' => '0537445566',
                'email' => 'process@managemgroup.com',
            ],
            [
                'ice' => '007788990011223',
                'nom' => 'Sothema',
                'adresse' => 'Lot. 22, ZI Sidi Bernoussi, Casablanca',
                'contact_nom' => 'MOUNA',
                'contact_prenom' => 'Leila',
                'contact_fonction' => 'Responsable Contrôle Qualité',
                'telephone' => '0522334455',
                'email' => 'qualite@sothema.ma',
            ],
            [
                'ice' => '008899001122334',
                'nom' => 'Label\'Vie',
                'adresse' => '143, Route des Ouled Ziane, Casablanca',
                'contact_nom' => 'BERADA',
                'contact_prenom' => 'Youssef',
                'contact_fonction' => 'Responsable Hygiène',
                'telephone' => '0522778899',
                'email' => 'hygiene@labelvie.ma',
            ],
            [
                'ice' => '009900112233445',
                'nom' => 'S2M',
                'adresse' => 'Parc d\'Activités Economiques, Tanger',
                'contact_nom' => 'AMRANI',
                'contact_prenom' => 'Khalid',
                'contact_fonction' => 'Chef de Projet',
                'telephone' => '0539887766',
                'email' => 'projets@s2m.ma',
            ],
            [
                'ice' => '010011223344556',
                'nom' => 'Yazaki Morocco',
                'adresse' => 'Zone Industrielle, Kénitra',
                'contact_nom' => 'LAMRANI',
                'contact_prenom' => 'Said',
                'contact_fonction' => 'Responsable Production',
                'telephone' => '0537554433',
                'email' => 'production@yazaki.ma',
            ],
            [
                'ice' => '011122334455667',
                'nom' => 'Delphi Packard',
                'adresse' => 'Ain Sebaâ, Casablanca',
                'contact_nom' => 'HAFIDI',
                'contact_prenom' => 'Nadia',
                'contact_fonction' => 'Ingénieur HSE',
                'telephone' => '0522667788',
                'email' => 'hse@delphi.com',
            ],
            [
                'ice' => '012233445566778',
                'nom' => 'SNEP',
                'adresse' => 'Rue Patrice Lumumba, Rabat',
                'contact_nom' => 'JAIDI',
                'contact_prenom' => 'Abdelaziz',
                'contact_fonction' => 'Directeur Technique',
                'telephone' => '0537998877',
                'email' => 'technique@snep.ma',
            ],
            [
                'ice' => '013344556677889',
                'nom' => 'Ciments du Maroc',
                'adresse' => '174, Avenue Hassan II, Casablanca',
                'contact_nom' => 'BENJELLOUN',
                'contact_prenom' => 'Omar',
                'contact_fonction' => 'Responsable Laboratoire',
                'telephone' => '0522889977',
                'email' => 'labo@cimar.ma',
            ],
            [
                'ice' => '014455667788990',
                'nom' => 'Sahara Wind',
                'adresse' => '45, Avenue Hassan II, Casablanca',
                'contact_nom' => 'ESSAKALLI',
                'contact_prenom' => 'Hicham',
                'contact_fonction' => 'Coordinateur Projet',
                'telephone' => '0522776655',
                'email' => 'projet@saharawind.com',
            ]
        ];

        foreach ($entreprises as $entreprise) {
            Entreprise::create($entreprise);
        }
    }
}