import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Check } from 'lucide-react';

const UpdateNotification = ({ darkMode }) => {
    const [updateStatus, setUpdateStatus] = useState(null);
    const [progress, setProgress] = useState(0);
    const [version, setVersion] = useState(null);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        // Vérifier si nous sommes dans un environnement Electron
        if (!window.electron) return;

        // Écouter les événements de mise à jour
        window.electron.on('update-status', (event, message) => {
            setUpdateStatus(message);
            setShowNotification(true);
        });

        window.electron.on('update-available', (event, info) => {
            setVersion(info.version);
            setShowNotification(true);
            setUpdateStatus('nouvo vèrsion');
        });

        window.electron.on('update-not-available', () => {
            setShowNotification(false);
            setUpdateStatus(null);
        });

        window.electron.on('update-error', (event, error) => {
            setUpdateStatus('erreur');
            setShowNotification(true);
        });

        window.electron.on('update-progress', (event, progressObj) => {
            setProgress(progressObj.percent);
            setUpdateStatus('téléchargement');
        });

        window.electron.on('update-downloaded', () => {
            setUpdateStatus('prêt');
            setShowNotification(true);
        });

        // Nettoyage des listeners
        return () => {
            if (window.electron) {
                window.electron.removeAllListeners('update-status');
                window.electron.removeAllListeners('update-available');
                window.electron.removeAllListeners('update-not-available');
                window.electron.removeAllListeners('update-error');
                window.electron.removeAllListeners('update-progress');
                window.electron.removeAllListeners('update-downloaded');
            }
        };
    }, []);

    const handleStartUpdate = () => {
        if (window.electron) {
            window.electron.invoke('start-update');
        }
    };

    const handleInstallUpdate = () => {
        if (window.electron) {
            window.electron.invoke('install-update');
        }
    };

    const handleCheckForUpdates = () => {
        if (window.electron) {
            window.electron.invoke('check-for-updates');
        }
    };

    if (!showNotification) return null;

    return (
        <div className={`fixed bottom-4 right-4 max-w-sm w-full shadow-lg rounded-xl overflow-hidden transition-all transform ${
            darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        {updateStatus === 'nouvo vèrsion' && (
                            <Download className={`w-5 h-5 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                        )}
                        {updateStatus === 'téléchargement' && (
                            <RefreshCw className={`w-5 h-5 animate-spin ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                        )}
                        {updateStatus === 'prêt' && (
                            <Check className={`w-5 h-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                        )}
                        <h3 className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            Miz a zour Ti'Bot
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowNotification(false)}
                        className={`p-1 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                    >
                        <X className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                </div>

                {updateStatus === 'nouvo vèrsion' && (
                    <>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Nouvo vèrsion {version} lé disponib! Ou vé télécharz astèr?
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleStartUpdate}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg text-sm font-medium hover:from-cyan-600 hover:to-cyan-700"
                            >
                                Télécharz
                            </button>
                            <button
                                onClick={() => setShowNotification(false)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                Plus tar
                            </button>
                        </div>
                    </>
                )}

                {updateStatus === 'téléchargement' && (
                    <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Télécharzman: {progress.toFixed(1)}%
                        </p>
                    </div>
                )}

                {updateStatus === 'prêt' && (
                    <>
                        <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Miz a zour lé paré! Rédémar Ti'Bot pou fini l'instalasion.
                        </p>
                        <button
                            onClick={handleInstallUpdate}
                            className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700"
                        >
                            Rédémar astèr
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default UpdateNotification; 