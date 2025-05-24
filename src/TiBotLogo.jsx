import React from 'react';

const TiBotLogo = ({ size = 200, className = "" }) => {
  import React from 'react';

// Composant Logo Ti'Bot autonome
const TiBotLogo = ({ size = 200, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Fond circulaire avec gradient tropical */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0891B2" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Cercle principal */}
      <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" opacity="0.1" />
      <circle cx="100" cy="100" r="85" fill="none" stroke="url(#bgGradient)" strokeWidth="2" />

      {/* Feuille de palmier gauche */}
      <path
        d="M 60 100 Q 40 80, 45 60 Q 50 75, 60 85 Q 55 70, 55 55 Q 60 70, 65 80 Q 62 65, 65 50 Q 68 65, 70 75"
        stroke="url(#leafGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Feuille de palmier droite */}
      <path
        d="M 140 100 Q 160 80, 155 60 Q 150 75, 140 85 Q 145 70, 145 55 Q 140 70, 135 80 Q 138 65, 135 50 Q 132 65, 130 75"
        stroke="url(#leafGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Corps du robot */}
      <rect
        x="70"
        y="80"
        width="60"
        height="70"
        rx="20"
        fill="#1F2937"
        stroke="url(#bgGradient)"
        strokeWidth="2"
      />

      {/* Écran du robot avec effet glow */}
      <rect
        x="80"
        y="90"
        width="40"
        height="30"
        rx="5"
        fill="#0891B2"
        filter="url(#glow)"
      />

      {/* Lignes de code sur l'écran */}
      <line x1="85" y1="98" x2="95" y2="98" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
      <line x1="85" y1="105" x2="105" y2="105" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
      <line x1="85" y1="112" x2="100" y2="112" stroke="#ffffff" strokeWidth="2" opacity="0.8" />

      {/* Yeux du robot */}
      <circle cx="85" cy="70" r="8" fill="#0891B2" filter="url(#glow)" />
      <circle cx="115" cy="70" r="8" fill="#0891B2" filter="url(#glow)" />
      <circle cx="85" cy="70" r="3" fill="#ffffff" />
      <circle cx="115" cy="70" r="3" fill="#ffffff" />

      {/* Antenne */}
      <line x1="100" y1="60" x2="100" y2="45" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="42" r="5" fill="#FB923C" filter="url(#glow)" />

      {/* Texte Ti'Bot */}
      <text
        x="100"
        y="175"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="#1F2937"
        textAnchor="middle"
      >
        Ti'Bot
      </text>

      {/* Petits détails tropicaux */}
      <circle cx="30" cy="170" r="3" fill="#FB923C" opacity="0.6" />
      <circle cx="170" cy="170" r="3" fill="#0891B2" opacity="0.6" />
      <circle cx="25" cy="30" r="2" fill="#059669" opacity="0.5" />
      <circle cx="175" cy="35" r="2" fill="#059669" opacity="0.5" />
    </svg>
  );
};

// Composant principal pour afficher le logo et ses variantes
const LogoShowcase = () => {
  const [selectedSize, setSelectedSize] = React.useState(200);
  const [showAnimation, setShowAnimation] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Logo Ti'Bot</h1>
        <p className="text-gray-600 mb-8">Logo officiel de Ti'Bot - IA Kréol La Rénion 🌴</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo principal interactif */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Aperçu</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAnimation(!showAnimation)}
                  className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition"
                >
                  {showAnimation ? 'Stop Animation' : 'Animer'}
                </button>
              </div>
            </div>
            <div className="flex justify-center items-center h-[300px] bg-gray-50 rounded">
              <TiBotLogo 
                size={selectedSize} 
                className={showAnimation ? "animate-pulse" : ""}
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille: {selectedSize}px
              </label>
              <input
                type="range"
                min="32"
                max="300"
                value={selectedSize}
                onChange={(e) => setSelectedSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Panneau d'informations */}
          <div className="space-y-4">
            {/* Variantes de taille */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Tailles prédéfinies</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded flex justify-center items-center h-20">
                    <TiBotLogo size={32} />
                  </div>
                  <p className="text-xs mt-2">32px</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded flex justify-center items-center h-20">
                    <TiBotLogo size={48} />
                  </div>
                  <p className="text-xs mt-2">48px</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 p-4 rounded flex justify-center items-center h-20">
                    <TiBotLogo size={64} />
                  </div>
                  <p className="text-xs mt-2">64px</p>
                </div>
              </div>
            </div>

            {/* Couleurs */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold mb-4">Palette de couleurs</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500 rounded"></div>
                  <span className="text-sm">#0891B2 - Bleu lagon</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-400 rounded"></div>
                  <span className="text-sm">#FB923C - Orange tropical</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded"></div>
                  <span className="text-sm">#059669 - Vert nature</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded"></div>
                  <span className="text-sm">#1F2937 - Gris foncé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions d'utilisation */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Comment utiliser le logo</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              <code>{`// 1. Copier le composant TiBotLogo dans un fichier
// src/TiBotLogo.jsx

// 2. L'importer dans ton composant
import TiBotLogo from './TiBotLogo';

// 3. L'utiliser
<TiBotLogo size={48} />
<TiBotLogo size={200} className="animate-spin" />`}</code>
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Export pour l'application</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Pour créer les icônes de l'application :
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Copier le code SVG du composant</li>
                <li>Utiliser un convertisseur SVG → PNG</li>
                <li>Créer les tailles : 16x16, 32x32, 256x256</li>
                <li>Convertir en .ico pour Windows</li>
              </ol>
              <div className="mt-4 p-3 bg-cyan-50 rounded">
                <p className="text-xs text-cyan-700">
                  💡 Le logo est optimisé pour rester lisible même en petite taille
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exemples d'utilisation */}
        <div className="mt-8 bg-gradient-to-r from-cyan-50 to-orange-50 rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-semibold mb-6">Exemples d'utilisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm font-medium mb-3">Dans le header</p>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                <TiBotLogo size={32} />
                <span className="text-white font-semibold">Ti'Bot</span>
              </div>
            </div>

            {/* Loading */}
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm font-medium mb-3">Animation de chargement</p>
              <div className="flex justify-center items-center h-20">
                <TiBotLogo size={48} className="animate-spin" />
              </div>
            </div>

            {/* Splash screen */}
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-sm font-medium mb-3">Écran de démarrage</p>
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 rounded flex flex-col items-center">
                <TiBotLogo size={64} />
                <p className="text-white text-xs mt-2">Chargement...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;
};

export default TiBotLogo;