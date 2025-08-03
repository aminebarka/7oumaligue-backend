"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting database seeding...");
    const tenant = await prisma.tenant.create({
        data: {
            name: "7ouma Ligue Demo",
        },
    });
    console.log("✅ Tenant created");
    const hashedPassword = await bcryptjs_1.default.hash("admin123", 12);
    const adminUser = await prisma.user.create({
        data: {
            name: "Admin User",
            email: "admin@7oumaligue.com",
            password: hashedPassword,
            role: "admin",
            tenantId: tenant.id,
        },
    });
    console.log("✅ Admin user created");
    const teams = await Promise.all([
        prisma.team.create({
            data: {
                name: "FC Lions",
                logo: "🦁",
                coachName: "Mohamed Alami",
                players: [],
                tenantId: tenant.id,
            },
        }),
        prisma.team.create({
            data: {
                name: "Eagles FC",
                logo: "🦅",
                coachName: "Ahmed Benali",
                players: [],
                tenantId: tenant.id,
            },
        }),
        prisma.team.create({
            data: {
                name: "Sharks United",
                logo: "🦈",
                coachName: "Youssef Kadiri",
                players: [],
                tenantId: tenant.id,
            },
        }),
        prisma.team.create({
            data: {
                name: "Thunder Bolts",
                logo: "⚡",
                coachName: "Rachid Tazi",
                players: [],
                tenantId: tenant.id,
            },
        }),
    ]);
    console.log("✅ Teams created");
    const playerNames = [
        "Youssef Bennani",
        "Omar Chakir",
        "Amine Lahlou",
        "Karim Ziani",
        "Mehdi Fassi",
        "Reda Amrani",
        "Saad Berrada",
        "Hamza Idrissi",
        "Nabil Ouali",
        "Tarik Bennis",
        "Abdellatif Hajji",
        "Mustapha Kabbaj",
        "Hicham Zerouali",
        "Jamal Sellami",
        "Fouad Badr",
        "Ismail Moutaouakil",
        "Driss Benzakour",
        "Khalid Regragui",
        "Aziz Bouderbala",
        "Said Chiba",
    ];
    const positions = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const teamPlayers = [];
        for (let j = 0; j < 5; j++) {
            const playerIndex = i * 5 + j;
            const position = j === 0 ? "Gardien" : positions[Math.floor(Math.random() * (positions.length - 1)) + 1];
            const player = await prisma.player.create({
                data: {
                    name: playerNames[playerIndex],
                    position,
                    level: Math.floor(Math.random() * 5) + 1,
                    age: Math.floor(Math.random() * 20) + 20,
                    jerseyNumber: j + 1,
                    teamId: team.id,
                    tenantId: tenant.id,
                },
            });
            teamPlayers.push(player.id);
        }
        await prisma.team.update({
            where: { id: team.id },
            data: { players: teamPlayers },
        });
    }
    console.log("✅ Players created");
    const tournament = await prisma.tournament.create({
        data: {
            name: "Championnat d'Été 2024",
            logo: "🏆",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-08-31"),
            prize: "5000 MAD + Trophée",
            rules: "Format championnat - Matchs aller-retour - 2x20 minutes",
            numberOfGroups: 2,
            status: "upcoming",
            tenantId: tenant.id,
        },
    });
    console.log("✅ Tournament created");
    for (const team of teams) {
        await prisma.tournamentTeam.create({
            data: {
                tournamentId: tournament.id,
                teamId: team.id,
            },
        });
    }
    console.log("✅ Teams added to tournament");
    const groupA = await prisma.group.create({
        data: {
            name: "Groupe A",
            tournamentId: tournament.id,
            tenantId: tenant.id,
        },
    });
    const groupB = await prisma.group.create({
        data: {
            name: "Groupe B",
            tournamentId: tournament.id,
            tenantId: tenant.id,
        },
    });
    console.log("✅ Groups created");
    await prisma.groupTeam.create({
        data: {
            groupId: groupA.id,
            teamId: teams[0].id,
        },
    });
    await prisma.groupTeam.create({
        data: {
            groupId: groupA.id,
            teamId: teams[1].id,
        },
    });
    await prisma.groupTeam.create({
        data: {
            groupId: groupB.id,
            teamId: teams[2].id,
        },
    });
    await prisma.groupTeam.create({
        data: {
            groupId: groupB.id,
            teamId: teams[3].id,
        },
    });
    console.log("✅ Teams assigned to groups");
    const matches = [
        {
            date: "2024-06-15",
            time: "18:00",
            venue: "Terrain Central",
            homeTeam: teams[0].id,
            awayTeam: teams[1].id,
            tournamentId: tournament.id,
            groupId: groupA.id,
        },
        {
            date: "2024-06-16",
            time: "19:00",
            venue: "Terrain Nord",
            homeTeam: teams[2].id,
            awayTeam: teams[3].id,
            tournamentId: tournament.id,
            groupId: groupB.id,
        },
    ];
    for (const matchData of matches) {
        await prisma.match.create({
            data: {
                ...matchData,
                tenantId: tenant.id,
            },
        });
    }
    console.log("✅ Matches created");
    await prisma.tournament.update({
        where: { id: tournament.id },
        data: {
            drawCompleted: false,
        },
    });
    console.log("✅ Tournament updated");
    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📊 Summary:
- 1 Tenant created
- 1 Admin user created (admin@7oumaligue.com / admin123)
- 4 Teams created
- 20 Players created
- 1 Tournament created
- 2 Groups created
- 2 Matches created
  `);
}
main()
    .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map