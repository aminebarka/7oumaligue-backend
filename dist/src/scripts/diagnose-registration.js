"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnoseRegistration = diagnoseRegistration;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function diagnoseRegistration() {
    try {
        console.log('🔍 Diagnostic du problème d\'inscription...');
        console.log('\n📋 1. Test de connexion à la base de données...');
        try {
            await prisma.$connect();
            console.log('✅ Connexion réussie');
        }
        catch (error) {
            console.error('❌ Erreur de connexion:', error?.message);
            return;
        }
        console.log('\n📋 2. Vérification des tables...');
        try {
            const tenants = await prisma.tenant.findMany();
            console.log('✅ Table tenants:', tenants.length, 'enregistrements');
            const users = await prisma.user.findMany();
            console.log('✅ Table users:', users.length, 'enregistrements');
            const userSample = await prisma.user.findFirst();
            if (userSample) {
                console.log('✅ Structure User:', Object.keys(userSample));
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de la vérification des tables:', error?.message);
        }
        console.log('\n📋 3. Test de création d\'un tenant...');
        let testTenantId = null;
        try {
            const testTenant = await prisma.tenant.create({
                data: {
                    name: 'Test Organization'
                }
            });
            testTenantId = testTenant.id;
            console.log('✅ Tenant créé avec succès, ID:', testTenantId);
        }
        catch (error) {
            console.error('❌ Erreur lors de la création du tenant:', error?.message);
            console.error('Détails:', error?.meta);
            return;
        }
        console.log('\n📋 4. Test de création d\'un utilisateur...');
        try {
            const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
            console.log('✅ Mot de passe haché avec succès');
            const testUser = await prisma.user.create({
                data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: hashedPassword,
                    role: 'admin',
                    tenantId: testTenantId
                }
            });
            console.log('✅ Utilisateur créé avec succès, ID:', testUser.id);
            console.log('✅ Email:', testUser.email);
            console.log('✅ Role:', testUser.role);
            console.log('✅ TenantId:', testUser.tenantId);
            console.log('\n📋 5. Nettoyage des données de test...');
            await prisma.user.delete({
                where: { id: testUser.id }
            });
            await prisma.tenant.delete({
                where: { id: testTenantId }
            });
            console.log('✅ Données de test supprimées');
        }
        catch (error) {
            console.error('❌ Erreur lors de la création de l\'utilisateur:', error?.message);
            console.error('Code d\'erreur:', error?.code);
            console.error('Métadonnées:', error?.meta);
            if (testTenantId) {
                try {
                    await prisma.tenant.delete({
                        where: { id: testTenantId }
                    });
                    console.log('✅ Tenant nettoyé');
                }
                catch (cleanupError) {
                    console.error('❌ Erreur lors du nettoyage:', cleanupError?.message);
                }
            }
        }
        console.log('\n📋 6. Vérification des contraintes...');
        try {
            const existingUsers = await prisma.user.findMany({
                where: { email: 'test@example.com' }
            });
            console.log('✅ Contrainte d\'unicité email:', existingUsers.length === 0 ? 'OK' : 'PROBLÈME');
            const invalidTenantId = 999999;
            try {
                await prisma.user.create({
                    data: {
                        name: 'Test',
                        email: 'test2@example.com',
                        password: 'hashed',
                        role: 'user',
                        tenantId: invalidTenantId
                    }
                });
                console.log('❌ Contrainte foreign key: PROBLÈME (devrait échouer)');
            }
            catch (fkError) {
                console.log('✅ Contrainte foreign key: OK');
            }
        }
        catch (error) {
            console.error('❌ Erreur lors de la vérification des contraintes:', error?.message);
        }
        console.log('\n🎉 Diagnostic terminé !');
    }
    catch (error) {
        console.error('💥 Erreur générale lors du diagnostic:', error?.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    diagnoseRegistration()
        .then(() => {
        console.log('🎉 Script de diagnostic terminé !');
        process.exit(0);
    })
        .catch((error) => {
        console.error('💥 Erreur lors de l\'exécution du script:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=diagnose-registration.js.map