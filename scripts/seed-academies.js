const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAcademies() {
  try {
    console.log('🌱 Début du seeding des académies...');

    // Supprimer les données existantes
    console.log('🗑️ Suppression des données existantes...');
    await prisma.academyPayment.deleteMany();
    await prisma.academyDocument.deleteMany();
    await prisma.academyEventParticipant.deleteMany();
    await prisma.academyEvent.deleteMany();
    await prisma.academyAnnouncement.deleteMany();
    await prisma.academyPlayerStats.deleteMany();
    await prisma.academyPlayer.deleteMany();
    await prisma.academyMatch.deleteMany();
    await prisma.academyTeam.deleteMany();
    await prisma.academySponsor.deleteMany();
    await prisma.academy.deleteMany();

    // Créer des académies de test
    console.log('🏫 Création des académies...');
    
    const academies = await Promise.all([
      prisma.academy.create({
        data: {
          name: "Académie de Football Excellence",
          description: "Une académie de football de haut niveau dédiée à la formation des jeunes talents",
          address: "123 Avenue des Champions",
          city: "Casablanca",
          region: "Casablanca-Settat",
          phone: "0522000001",
          email: "contact@academie-excellence.ma",
          website: "https://academie-excellence.ma",
          socialMedia: {
            facebook: "https://facebook.com/academieexcellence",
            instagram: "https://instagram.com/academieexcellence",
            twitter: "https://twitter.com/academieexcellence"
          },
          history: "Fondée en 2010, l'Académie de Football Excellence s'est imposée comme une référence dans la formation des jeunes footballeurs au Maroc.",
          values: "Excellence, Discipline, Respect, Passion, Développement personnel",
          isActive: true,
          isVerified: true,
          ownerId: 1 // Assurez-vous que l'utilisateur ID 1 existe
        }
      }),
      
      prisma.academy.create({
        data: {
          name: "Centre de Formation Atlas",
          description: "Centre de formation spécialisé dans le développement des compétences techniques",
          address: "456 Rue des Étoiles",
          city: "Rabat",
          region: "Rabat-Salé-Kénitra",
          phone: "0537000002",
          email: "info@atlas-formation.ma",
          website: "https://atlas-formation.ma",
          socialMedia: {
            facebook: "https://facebook.com/atlasformation",
            instagram: "https://instagram.com/atlasformation"
          },
          history: "Le Centre de Formation Atlas a été créé en 2015 avec pour mission de former la prochaine génération de footballeurs marocains.",
          values: "Innovation, Qualité, Équipe, Progression, Ambition",
          isActive: true,
          isVerified: true,
          ownerId: 1
        }
      }),
      
      prisma.academy.create({
        data: {
          name: "École de Football Future",
          description: "École moderne utilisant les dernières technologies pour la formation footballistique",
          address: "789 Boulevard de l'Avenir",
          city: "Marrakech",
          region: "Marrakech-Safi",
          phone: "0524000003",
          email: "contact@future-football.ma",
          website: "https://future-football.ma",
          socialMedia: {
            facebook: "https://facebook.com/futurefootball",
            instagram: "https://instagram.com/futurefootball",
            youtube: "https://youtube.com/futurefootball"
          },
          history: "L'École de Football Future a révolutionné la formation au Maroc en intégrant la technologie moderne dans l'entraînement.",
          values: "Innovation, Technologie, Excellence, Développement durable, Leadership",
          isActive: true,
          isVerified: false,
          ownerId: 1
        }
      })
    ]);

    console.log(`✅ ${academies.length} académies créées`);

    // Créer des équipes pour chaque académie
    console.log('⚽ Création des équipes...');
    
    for (const academy of academies) {
      const teams = await Promise.all([
        prisma.academyTeam.create({
          data: {
            name: "U8",
            category: "U8",
            color: "#FF6B6B",
            academyId: academy.id,
            coachId: 1
          }
        }),
        prisma.academyTeam.create({
          data: {
            name: "U10",
            category: "U10",
            color: "#4ECDC4",
            academyId: academy.id,
            coachId: 1
          }
        }),
        prisma.academyTeam.create({
          data: {
            name: "U12",
            category: "U12",
            color: "#45B7D1",
            academyId: academy.id,
            coachId: 1
          }
        }),
        prisma.academyTeam.create({
          data: {
            name: "U15",
            category: "U15",
            color: "#96CEB4",
            academyId: academy.id,
            coachId: 1
          }
        }),
        prisma.academyTeam.create({
          data: {
            name: "U17",
            category: "U17",
            color: "#FFEAA7",
            academyId: academy.id,
            coachId: 1
          }
        })
      ]);

      console.log(`✅ ${teams.length} équipes créées pour ${academy.name}`);

      // Créer des joueurs pour chaque équipe
      console.log('👥 Création des joueurs...');
      
      for (const team of teams) {
        const players = await Promise.all([
          prisma.academyPlayer.create({
            data: {
              firstName: "Ahmed",
              lastName: "Benali",
              birthDate: new Date("2015-03-15"),
              position: "Attaquant",
              jerseyNumber: 10,
              parentPhone: "0612345678",
              parentEmail: "parent1@example.com",
              medicalInfo: "Aucune allergie connue",
              academyId: academy.id,
              teamId: team.id
            }
          }),
          prisma.academyPlayer.create({
            data: {
              firstName: "Youssef",
              lastName: "El Amrani",
              birthDate: new Date("2015-07-22"),
              position: "Milieu",
              jerseyNumber: 8,
              parentPhone: "0623456789",
              parentEmail: "parent2@example.com",
              medicalInfo: "Asthme léger",
              academyId: academy.id,
              teamId: team.id
            }
          }),
          prisma.academyPlayer.create({
            data: {
              firstName: "Karim",
              lastName: "Tazi",
              birthDate: new Date("2015-11-08"),
              position: "Défenseur",
              jerseyNumber: 4,
              parentPhone: "0634567890",
              parentEmail: "parent3@example.com",
              medicalInfo: "Aucune",
              academyId: academy.id,
              teamId: team.id
            }
          }),
          prisma.academyPlayer.create({
            data: {
              firstName: "Omar",
              lastName: "Fassi",
              birthDate: new Date("2015-01-30"),
              position: "Gardien",
              jerseyNumber: 1,
              parentPhone: "0645678901",
              parentEmail: "parent4@example.com",
              medicalInfo: "Aucune",
              academyId: academy.id,
              teamId: team.id
            }
          })
        ]);

        console.log(`✅ ${players.length} joueurs créés pour l'équipe ${team.name}`);

        // Créer des statistiques pour chaque joueur
        for (const player of players) {
          await prisma.academyPlayerStats.create({
            data: {
              playerId: player.id,
              season: "2023-2024",
              matches: Math.floor(Math.random() * 20) + 10,
              goals: Math.floor(Math.random() * 15),
              assists: Math.floor(Math.random() * 10),
              yellowCards: Math.floor(Math.random() * 3),
              redCards: Math.floor(Math.random() * 2),
              minutesPlayed: Math.floor(Math.random() * 1000) + 500
            }
          });
        }
      }

      // Créer des événements pour chaque académie
      console.log('📅 Création des événements...');
      
      const events = await Promise.all([
        prisma.academyEvent.create({
          data: {
            title: "Tournoi d'été",
            description: "Tournoi amical entre les équipes de l'académie",
            type: "tournoi",
            startDate: new Date("2024-07-15"),
            endDate: new Date("2024-07-17"),
            location: "Terrain principal",
            isPublic: true,
            maxParticipants: 100,
            registrationDeadline: new Date("2024-07-10"),
            academyId: academy.id
          }
        }),
        prisma.academyEvent.create({
          data: {
            title: "Stage technique",
            description: "Stage d'amélioration des compétences techniques",
            type: "entraînement",
            startDate: new Date("2024-08-05"),
            endDate: new Date("2024-08-09"),
            location: "Centre d'entraînement",
            isPublic: false,
            maxParticipants: 30,
            registrationDeadline: new Date("2024-07-25"),
            academyId: academy.id
          }
        })
      ]);

      console.log(`✅ ${events.length} événements créés pour ${academy.name}`);

      // Créer des annonces pour chaque académie
      console.log('📢 Création des annonces...');
      
      const announcements = await Promise.all([
        prisma.academyAnnouncement.create({
          data: {
            title: "Inscriptions ouvertes",
            content: "Les inscriptions pour la saison 2024-2025 sont maintenant ouvertes. Contactez-nous pour plus d'informations.",
            type: "info",
            isPublic: true,
            academyId: academy.id
          }
        }),
        prisma.academyAnnouncement.create({
          data: {
            title: "Match amical ce weekend",
            content: "Notre équipe U15 affrontera l'équipe de l'Académie de Football Excellence ce samedi à 15h.",
            type: "success",
            isPublic: true,
            academyId: academy.id
          }
        })
      ]);

      console.log(`✅ ${announcements.length} annonces créées pour ${academy.name}`);

      // Créer des sponsors pour chaque académie
      console.log('🏢 Création des sponsors...');
      
      const sponsors = await Promise.all([
        prisma.academySponsor.create({
          data: {
            name: "Sport Equipment Pro",
            description: "Fournisseur officiel d'équipements sportifs",
            website: "https://sportequipmentpro.ma",
            isActive: true,
            academyId: academy.id
          }
        }),
        prisma.academySponsor.create({
          data: {
            name: "Energy Drink Plus",
            description: "Partenaire nutritionnel officiel",
            website: "https://energydrinkplus.ma",
            isActive: true,
            academyId: academy.id
          }
        })
      ]);

      console.log(`✅ ${sponsors.length} sponsors créés pour ${academy.name}`);
    }

    console.log('🎉 Seeding des académies terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding des académies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
seedAcademies();
