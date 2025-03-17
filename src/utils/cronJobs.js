/**
 * Utilitaire pour exécuter la régénération quotidienne des habitudes
 * Cette fonction peut être appelée par un cron job côté serveur
 * ou être exécutée manuellement depuis l'application cliente.
 */
export const regenerateHabits = async () => {
    try {
        console.log("Début de la régénération des habitudes...");
        
        // Vérifier d'abord combien d'habitudes existent
        const checkResponse = await fetch('http://192.168.50.241:4000/tasks');
        const tasks = await checkResponse.json();
        const habitCount = tasks.filter(task => task.taskType === 'habit').length;
        console.log(`Nombre d'habitudes trouvées: ${habitCount}`);
        
        const response = await fetch('http://192.168.50.241:4000/regenerate-habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur serveur lors de la régénération:', errorText);
            throw new Error('Erreur lors de la régénération des habitudes');
        }
        
        const data = await response.json();
        console.log('Régénération des habitudes:', data);
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
