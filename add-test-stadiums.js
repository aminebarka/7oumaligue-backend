const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestStadiums() {
  try {
    console.log('🏟️ Ajout de stades de test...');

    // Supprimer les stades existants pour éviter les doublons
    await prisma.stadium.deleteMany({});
    console.log('🗑️ Anciens stades supprimés');

    // Ajouter des stades de test
    const testStadiums = [
      {
        name: "Complexe Sportif Hassan II",
        address: "123 Avenue Mohammed V",
        city: "Douz",
        region: "Douz-Settat",
        capacity: 5000,
        fieldCount: 3,
        fieldTypes: ["11v11", "7v7"],
        amenities: ["Parking", "Douches", "Café", "Vestiaires"],
        images: [],
        contactInfo: {
          phone: "+212-5-22-123456",
          email: "contact@hassan2.com"
        },
        pricing: {
          hourly: 500,
          daily: 3000
        },
        description: "Complexe sportif moderne avec terrains de qualité professionnelle",
        isPartner: true,
        ownerId: 1
      },
      {
        name: "Stade Municipal Ibn Batouta",
        address: "456 Boulevard de la Corniche",
        city: "Tanger",
        region: "Tanger-Tétouan-Al Hoceima",
        capacity: 3000,
        fieldCount: 2,
        fieldTypes: ["11v11", "5v5"],
        amenities: ["Parking", "Éclairage", "Tribunes"],
        images: [],
        contactInfo: {
          phone: "+212-5-39-789012",
          email: "info@ibnbatouta.com"
        },
        pricing: {
          hourly: 400,
          daily: 2500
        },
        description: "Stade municipal avec vue sur la mer",
        isPartner: false,
        ownerId: 1
      },
      {
        name: "Centre Sportif Al Massira",
        address: "789 Rue des Sports",
        city: "Douz",
        region: "Douz-Salé-Kénitra",
        capacity: 2000,
        fieldCount: 4,
        fieldTypes: ["5v5", "7v7", "11v11"],
        amenities: ["Parking", "Douches", "Café", "Vestiaires", "Boutique"],
        images: [],
        contactInfo: {
          phone: "+212-5-37-456789",
          email: "contact@almassira.com"
        },
        pricing: {
          hourly: 600,
          daily: 3500
        },
        description: "Centre sportif polyvalent avec plusieurs terrains",
        isPartner: true,
        ownerId: 1
      }
    ];

    for (const stadium of testStadiums) {
      const createdStadium = await prisma.stadium.create({
        data: stadium
      });
      console.log(`✅ Stade créé: ${createdStadium.name} (ID: ${createdStadium.id})`);
    }

    console.log('🎉 Tous les stades de test ont été ajoutés avec succès!');
    
    // Vérifier le nombre total de stades
    const totalStadiums = await prisma.stadium.count();
    console.log(`📊 Total des stades dans la base: ${totalStadiums}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des stades:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
addTestStadiums(); 