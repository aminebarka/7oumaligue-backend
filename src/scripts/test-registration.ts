import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testRegistration() {
  try {
    console.log('🧪 Test de l\'inscription...')

    // Test 1: Vérifier la connexion à la base de données
    console.log('📋 Test 1: Connexion à la base de données...')
    await prisma.$connect()
    console.log('✅ Connexion réussie')

    // Test 2: Vérifier les tables existantes
    console.log('📋 Test 2: Vérification des tables...')
    const tenants = await prisma.tenant.findMany()
    console.log('✅ Table tenants:', tenants.length, 'enregistrements')

    const users = await prisma.user.findMany()
    console.log('✅ Table users:', users.length, 'enregistrements')

    // Test 3: Test de création d'un tenant
    console.log('📋 Test 3: Création d\'un tenant...')
    const testTenant = await prisma.tenant.create({
      data: {
        name: 'Test Organization'
      }
    })
    console.log('✅ Tenant créé:', testTenant.id)

    // Test 4: Test de création d'un utilisateur
    console.log('📋 Test 4: Création d\'un utilisateur...')
    const hashedPassword = await bcrypt.hash('password123', 12)
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin',
        tenantId: testTenant.id
      }
    })
    console.log('✅ Utilisateur créé:', testUser.id)

    // Test 5: Nettoyage des données de test
    console.log('📋 Test 5: Nettoyage...')
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    await prisma.tenant.delete({
      where: { id: testTenant.id }
    })
    console.log('✅ Données de test supprimées')

    console.log('🎉 Tous les tests sont passés !')
    
  } catch (error: any) {
    console.error('❌ Erreur lors du test:', error)
    console.error('Détails:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  testRegistration()
    .then(() => {
      console.log('🎉 Script de test terminé !')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Erreur lors de l\'exécution du script:', error)
      process.exit(1)
    })
}

export { testRegistration } 