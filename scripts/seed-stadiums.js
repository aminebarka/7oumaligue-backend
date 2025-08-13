const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedStadiums() {
  try {
    console.log('🌱 Début du seeding des stades et terrains...');

    // Supprimer les données existantes
    await prisma.reservation.deleteMany();
    await prisma.field.deleteMany();
    await prisma.stadium.deleteMany();

    // Créer les stades
    const stadiums = [
      {
        name: "Stade Municipal Douz",
        address: "Route de Gabès, Douz",
        city: "Douz",
        region: "Kébili",
        neighborhood: "Centre-ville",
        capacity: 5000,
        fieldCount: 3,
        fieldTypes: ["synthétique", "gazon naturel"],
        amenities: ["vestiaires", "parking", "éclairage", "bar"],
        images: ["https://example.com/stade-douz-1.jpg"],
        contactInfo: {
          phone: "+216 75 123 456",
          email: "contact@stade-douz.com",
          website: "www.stade-douz.com"
        },
        pricing: {
          hourly: 50,
          daily: 400,
          special_events: 800
        },
        description: "Stade municipal principal de Douz avec 3 terrains de qualité",
        isPartner: true,
        isActive: true,
        ownerId: 1,
        openingHours: {
          monday: { open: "08:00", close: "22:00" },
          tuesday: { open: "08:00", close: "22:00" },
          wednesday: { open: "08:00", close: "22:00" },
          thursday: { open: "08:00", close: "22:00" },
          friday: { open: "08:00", close: "22:00" },
          saturday: { open: "08:00", close: "22:00" },
          sunday: { open: "08:00", close: "22:00" }
        }
      },
      {
        name: "Complexe Sportif El Faouar",
        address: "Zone Sportive, El Faouar",
        city: "El Faouar",
        region: "Kébili",
        neighborhood: "Zone Sportive",
        capacity: 3000,
        fieldCount: 2,
        fieldTypes: ["synthétique"],
        amenities: ["vestiaires", "parking", "éclairage"],
        images: ["https://example.com/complexe-faouar-1.jpg"],
        contactInfo: {
          phone: "+216 75 234 567",
          email: "contact@complexe-faouar.com",
          website: "www.complexe-faouar.com"
        },
        pricing: {
          hourly: 40,
          daily: 300,
          special_events: 600
        },
        description: "Complexe sportif moderne avec 2 terrains synthétiques",
        isPartner: true,
        isActive: true,
        ownerId: 1,
        openingHours: {
          monday: { open: "07:00", close: "23:00" },
          tuesday: { open: "07:00", close: "23:00" },
          wednesday: { open: "07:00", close: "23:00" },
          thursday: { open: "07:00", close: "23:00" },
          friday: { open: "07:00", close: "23:00" },
          saturday: { open: "07:00", close: "23:00" },
          sunday: { open: "07:00", close: "23:00" }
        }
      },
      {
        name: "Terrain de Quartier Souk Lahad",
        address: "Rue Principale, Souk Lahad",
        city: "Souk Lahad",
        region: "Kébili",
        neighborhood: "Centre",
        capacity: 1000,
        fieldCount: 1,
        fieldTypes: ["gazon naturel"],
        amenities: ["vestiaires", "parking"],
        images: ["https://example.com/terrain-souk-lahad-1.jpg"],
        contactInfo: {
          phone: "+216 75 345 678",
          email: "contact@terrain-souk-lahad.com"
        },
        pricing: {
          hourly: 30,
          daily: 200,
          special_events: 400
        },
        description: "Terrain de quartier pour les matchs locaux",
        isPartner: false,
        isActive: true,
        ownerId: 1,
        openingHours: {
          monday: { open: "09:00", close: "21:00" },
          tuesday: { open: "09:00", close: "21:00" },
          wednesday: { open: "09:00", close: "21:00" },
          thursday: { open: "09:00", close: "21:00" },
          friday: { open: "09:00", close: "21:00" },
          saturday: { open: "09:00", close: "21:00" },
          sunday: { open: "09:00", close: "21:00" }
        }
      },
      {
        name: "Stade Couvert de Kébili",
        address: "Zone Industrielle, Kébili",
        city: "Kébili",
        region: "Kébili",
        neighborhood: "Zone Industrielle",
        capacity: 2000,
        fieldCount: 2,
        fieldTypes: ["couvert", "synthétique"],
        amenities: ["vestiaires", "parking", "éclairage", "climatisation", "bar"],
        images: ["https://example.com/stade-couvert-kebili-1.jpg"],
        contactInfo: {
          phone: "+216 75 456 789",
          email: "contact@stade-couvert-kebili.com",
          website: "www.stade-couvert-kebili.com"
        },
        pricing: {
          hourly: 60,
          daily: 500,
          special_events: 1000
        },
        description: "Stade couvert climatisé pour jouer toute l'année",
        isPartner: true,
        isActive: true,
        ownerId: 1,
        openingHours: {
          monday: { open: "06:00", close: "00:00" },
          tuesday: { open: "06:00", close: "00:00" },
          wednesday: { open: "06:00", close: "00:00" },
          thursday: { open: "06:00", close: "00:00" },
          friday: { open: "06:00", close: "00:00" },
          saturday: { open: "06:00", close: "00:00" },
          sunday: { open: "06:00", close: "00:00" }
        }
      }
    ];

    // Créer les stades
    for (const stadiumData of stadiums) {
      const stadium = await prisma.stadium.create({
        data: stadiumData
      });

      console.log(`✅ Stade créé: ${stadium.name}`);

      // Créer les terrains pour chaque stade
      const fields = [];
      
      if (stadium.fieldCount >= 1) {
        fields.push({
          name: "Terrain Principal",
          number: 1,
          type: stadium.fieldTypes[0],
          size: "11v11",
          isActive: true,
          stadiumId: stadium.id
        });
      }

      if (stadium.fieldCount >= 2) {
        fields.push({
          name: "Terrain Secondaire",
          number: 2,
          type: stadium.fieldTypes[stadium.fieldTypes.length - 1],
          size: "7v7",
          isActive: true,
          stadiumId: stadium.id
        });
      }

      if (stadium.fieldCount >= 3) {
        fields.push({
          name: "Terrain d'Entraînement",
          number: 3,
          type: "synthétique",
          size: "5v5",
          isActive: true,
          stadiumId: stadium.id
        });
      }

      for (const fieldData of fields) {
        const field = await prisma.field.create({
          data: fieldData
        });
        console.log(`  ✅ Terrain créé: ${field.name} (${field.type})`);
      }
    }

    // Créer quelques réservations de test
    const testReservations = [
      {
        fieldId: 1, // Premier terrain du premier stade
        userId: 1,
        title: "Match amical - Équipe A vs Équipe B",
        description: "Match amical entre deux équipes locales",
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Demain + 2h
        purpose: "match",
        status: "confirmed",
        price: 100
      },
      {
        fieldId: 2, // Deuxième terrain du premier stade
        userId: 1,
        title: "Entraînement - Équipe C",
        description: "Session d'entraînement hebdomadaire",
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // Dans 2 jours + 1.5h
        purpose: "entraînement",
        status: "pending",
        price: 75
      },
      {
        fieldId: 3, // Troisième terrain du premier stade
        userId: 1,
        title: "Tournoi de Quartier",
        description: "Tournoi annuel du quartier",
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans une semaine
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // Dans une semaine + 6h
        purpose: "tournoi",
        status: "confirmed",
        price: 300
      }
    ];

    for (const reservationData of testReservations) {
      const reservation = await prisma.reservation.create({
        data: reservationData
      });
      console.log(`✅ Réservation créée: ${reservation.title}`);
    }

    console.log('🎉 Seeding terminé avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - ${stadiums.length} stades créés`);
    console.log(`   - ${stadiums.reduce((acc, s) => acc + s.fieldCount, 0)} terrains créés`);
    console.log(`   - ${testReservations.length} réservations de test créées`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
seedStadiums();
