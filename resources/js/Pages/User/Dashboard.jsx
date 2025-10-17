import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { FaFileInvoice, FaChartLine, FaFileAlt } from 'react-icons/fa';

export default function UserDashboard({ auth }) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Tableau de bord - ERP Laboratoire" />

      <div className="container mx-auto mt-16 px-4 text-center">
        {/* Contenu principal sans grand cadre */}
        <div className="relative overflow-hidden">
          {/* Titre principal */}
          <h1 className="text-3xl font-extrabold text-[#26658C] mb-2 relative z-10">
            Laboratoire d'Analyse et de Contrôle
          </h1>
          <p className="text-gray-600 text-sm relative z-10">
            Espace interne réservé au personnel du laboratoire
          </p>

          {/* Ligne décorative */}
          <div className="flex justify-center my-6">
            <div className="w-32 h-1 bg-[#26658C] rounded-full"></div>
          </div>

          {/* Bloc des fonctionnalités ERP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10"
          >
            <FeatureCard
              icon={<FaFileInvoice className="w-12 h-12" />}
              title="Créer un devis"
              description="Remplissez les données d'analyse pour générer un devis complet."
              link="/chiffrage/nouveau"
              color="from-blue-100 to-blue-50"
            />
            <FeatureCard
              icon={<FaChartLine className="w-12 h-12" />}
              title="Suivre les devis"
              description="Consultez, modifiez ou validez les devis en attente."
              link="/chiffrage/modifier"
              color="from-green-100 to-green-50"
            />
            <FeatureCard
              icon={<FaFileAlt className="w-12 h-12" />}
              title="Résultats & Rapports"
              description="Accédez aux résultats d'analyses et rapports techniques."
              link="/resultats"
              color="from-yellow-100 to-yellow-50"
            />
          </motion.div>

          {/* Citation motivationnelle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-10 italic text-gray-500 text-sm relative z-10"
          >
            "Un contrôle précis, une confiance durable." ⚗️
          </motion.div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

/* 🔹 Composant carte fonctionnelle avec React Icons */
function FeatureCard({ icon, title, description, link, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl cursor-pointer transform duration-300`}
    >
      <Link href={link} className="block h-full">
        <div className="flex justify-center mb-3 text-[#26658C]">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-[#26658C] mb-2">{title}</h3>
        <p className="text-gray-700 text-sm leading-snug">{description}</p>
      </Link>
    </motion.div>
  );
}