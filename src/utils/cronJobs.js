import { API_BASE_URL } from './api';

/**
 * Utilitaire pour exécuter la régénération quotidienne des habitudes
 * Cette fonction peut être appelée par un cron job côté serveur
 * ou être exécutée manuellement depuis l'application cliente.
 */
export const regenerateHabits = async () => {
    try {
        console.log("Début de la régénération des habitudes...");
        
        // Utiliser l'URL de base dynamique
        const response = await fetch(`${API_BASE_URL}/regenerate-habits`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Habitudes régénérées:', data);
        return data;
    } catch (error) {
        console.error('Erreur lors de la régénération des habitudes:', error);
        throw error;
    }
};

/**
 * Configure le processus de régénération automatique des habitudes
 * Cette fonction vérifie si c'est un nouveau jour et régénère les habitudes si nécessaire
 */
export const setupHabitRegenerationCheck = () => {
    let lastCheckedDate = new Date().toDateString();
    
    // Vérifier toutes les minutes si c'est un nouveau jour
    setInterval(() => {
        const currentDate = new Date().toDateString();
        
        // Si c'est un nouveau jour
        if (currentDate !== lastCheckedDate) {
            // Mettre à jour la date de dernière vérification
            lastCheckedDate = currentDate;
            
            // Régénérer les habitudes pour le nouveau jour
            regenerateHabits()
                .then(() => console.log('Habitudes régénérées pour le nouveau jour'))
                .catch(err => console.error('Erreur lors de la régénération:', err));
        }
    }, 60000); // Vérifier toutes les minutes
};
