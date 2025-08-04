"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedAdvancedData() {
    console.log('🌱 Insertion des données de test pour les fonctionnalités avancées...');
    try {
        console.log('📱 Création des posts sociaux...');
        await prisma.socialPost.createMany({
            data: [
                {
                    content: 'Incroyable match aujourd\'hui ! Notre équipe a gagné 3-1 ! ⚽🔥',
                    media: [],
                    hashtags: ['GoalOfTheDay', '7oumaLigue', 'Victory'],
                    likes: 24,
                    comments: 8,
                    shares: 3,
                    playerId: '1',
                    teamId: '1'
                },
                {
                    content: 'But magnifique de notre capitaine ! 🎯 #BeautifulGoal',
                    media: ['https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=But+Magnifique'],
                    hashtags: ['BeautifulGoal', 'Captain', '7oumaLigue'],
                    likes: 45,
                    comments: 12,
                    shares: 7,
                    playerId: '2'
                },
                {
                    content: 'Préparation pour le match de demain ! 💪 #Preparation #7oumaLigue',
                    media: [
                        'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Entrainement',
                        'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Equipe'
                    ],
                    hashtags: ['Preparation', '7oumaLigue', 'Training'],
                    likes: 18,
                    comments: 5,
                    shares: 2,
                    teamId: '2'
                }
            ]
        });
        console.log('💳 Création des transactions de paiement...');
        await prisma.paymentTransaction.createMany({
            data: [
                {
                    transactionId: 'TXN001',
                    tournamentId: '1',
                    teamId: '1',
                    amount: 50,
                    commission: 2.5,
                    netAmount: 47.5,
                    paymentMethod: 'Flouci',
                    playerCount: 8,
                    organizerId: 1,
                    status: 'completed'
                },
                {
                    transactionId: 'TXN002',
                    tournamentId: '2',
                    teamId: '2',
                    amount: 75,
                    commission: 3.75,
                    netAmount: 71.25,
                    paymentMethod: 'D17',
                    playerCount: 10,
                    organizerId: 1,
                    status: 'pending'
                },
                {
                    transactionId: 'TXN003',
                    tournamentId: '3',
                    teamId: '3',
                    amount: 30,
                    commission: 1.5,
                    netAmount: 28.5,
                    paymentMethod: 'Carte Bancaire',
                    playerCount: 6,
                    organizerId: 1,
                    status: 'failed'
                }
            ]
        });
        console.log('📊 Création des statistiques de joueur...');
        await prisma.playerStats.createMany({
            data: [
                {
                    playerId: '1',
                    tournamentId: '1',
                    goals: 5,
                    assists: 3,
                    matchesPlayed: 4,
                    rating: 4.2
                },
                {
                    playerId: '2',
                    tournamentId: '1',
                    goals: 3,
                    assists: 5,
                    matchesPlayed: 4,
                    rating: 4.5
                },
                {
                    playerId: '3',
                    tournamentId: '1',
                    goals: 2,
                    assists: 1,
                    matchesPlayed: 3,
                    rating: 3.8
                }
            ]
        });
        console.log('🏆 Création des badges de joueur...');
        await prisma.playerBadge.createMany({
            data: [
                {
                    playerId: '1',
                    badgeName: 'Joueur du Match',
                    description: 'Meilleur joueur du match',
                    icon: '🏆',
                    tournamentId: '1'
                },
                {
                    playerId: '2',
                    badgeName: 'Meilleur Buteur',
                    description: 'Plus de buts marqués',
                    icon: '⚽',
                    tournamentId: '1'
                },
                {
                    playerId: '3',
                    badgeName: 'Fair Play',
                    description: 'Esprit sportif exemplaire',
                    icon: '🤝',
                    tournamentId: '1'
                }
            ]
        });
        console.log('🏟️ Création des stades...');
        await prisma.stadium.createMany({
            data: [
                {
                    name: 'Stade Municipal de Tunis',
                    address: '123 Avenue Habib Bourguiba',
                    city: 'Tunis',
                    region: 'Tunis',
                    capacity: 10000,
                    fieldCount: 2,
                    fieldTypes: ['11v11', '7v7'],
                    amenities: ['parking', 'shower', 'cafe'],
                    images: [],
                    contactInfo: { phone: '+216 71 123 456', email: 'contact@stade-tunis.tn', website: 'https://stade-tunis.tn' },
                    pricing: { hourly: 100, daily: 800 },
                    description: 'Stade principal de la ville de Tunis avec des installations modernes',
                    isPartner: true,
                    ownerId: 1
                },
                {
                    name: 'Complexe Sportif Sfax',
                    address: '456 Rue de la République',
                    city: 'Sfax',
                    region: 'Sfax',
                    capacity: 5000,
                    fieldCount: 3,
                    fieldTypes: ['5v5', '7v7'],
                    amenities: ['parking', 'cafe'],
                    images: [],
                    contactInfo: { phone: '+216 74 789 012', email: 'info@complexe-sfax.tn', website: 'https://complexe-sfax.tn' },
                    pricing: { hourly: 80, daily: 600 },
                    description: 'Complexe sportif moderne avec plusieurs terrains',
                    isPartner: true,
                    ownerId: 1
                },
                {
                    name: 'Terrain de Proximité Sousse',
                    address: '789 Boulevard de la Corniche',
                    city: 'Sousse',
                    region: 'Sousse',
                    capacity: 2000,
                    fieldCount: 1,
                    fieldTypes: ['5v5'],
                    amenities: ['parking'],
                    images: [],
                    contactInfo: { phone: '+216 73 345 678', email: 'contact@terrain-sousse.tn' },
                    pricing: { hourly: 50, daily: 400 },
                    description: 'Petit terrain de football pour matchs amicaux',
                    isPartner: false,
                    ownerId: 1
                }
            ]
        });
        console.log('✅ Données de test insérées avec succès !');
        console.log('📊 Résumé des données créées :');
        console.log('   - 3 posts sociaux');
        console.log('   - 3 transactions de paiement');
        console.log('   - 3 statistiques de joueur');
        console.log('   - 3 badges de joueur');
        console.log('   - 3 stades');
    }
    catch (error) {
        console.error('❌ Erreur lors de l\'insertion des données:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
seedAdvancedData();
//# sourceMappingURL=seed-advanced-data.js.map