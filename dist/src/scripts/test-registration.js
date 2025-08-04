"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRegistration = testRegistration;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function testRegistration() {
    try {
        console.log('🧪 Test de l\'inscription...');
        console.log('📋 Test 1: Connexion à la base de données...');
        await prisma.$connect();
        console.log('✅ Connexion réussie');
        console.log('📋 Test 2: Vérification des tables...');
        const tenants = await prisma.tenant.findMany();
        console.log('✅ Table tenants:', tenants.length, 'enregistrements');
        const users = await prisma.user.findMany();
        console.log('✅ Table users:', users.length, 'enregistrements');
        console.log('📋 Test 3: Création d\'un tenant...');
        const testTenant = await prisma.tenant.create({
            data: {
                name: 'Test Organization'
            }
        });
        console.log('✅ Tenant créé:', testTenant.id);
        console.log('📋 Test 4: Création d\'un utilisateur...');
        const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
        const testUser = await prisma.user.create({
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'admin',
                tenantId: testTenant.id
            }
        });
        console.log('✅ Utilisateur créé:', testUser.id);
        console.log('📋 Test 5: Nettoyage...');
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        await prisma.tenant.delete({
            where: { id: testTenant.id }
        });
        console.log('✅ Données de test supprimées');
        console.log('🎉 Tous les tests sont passés !');
    }
    catch (error) {
        console.error('❌ Erreur lors du test:', error);
        console.error('Détails:', {
            message: error?.message,
            code: error?.code,
            meta: error?.meta
        });
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    testRegistration()
        .then(() => {
        console.log('🎉 Script de test terminé !');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Erreur lors de l\'exécution du script:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=test-registration.js.map