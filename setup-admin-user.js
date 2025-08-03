const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupAdminUser() {
  try {
    console.log('🔧 Configuration du système...');
    
    // 1. Vérifier s'il y a des tenants
    const tenants = await prisma.tenant.findMany();
    console.log('📋 Tenants disponibles:', tenants.length);
    
    let tenantId = 1; // Default tenant ID
    
    if (tenants.length === 0) {
      console.log('🏢 Création d\'un tenant par défaut...');
      const newTenant = await prisma.tenant.create({
        data: {
          name: 'Default Tenant'
        }
      });
      tenantId = newTenant.id;
      console.log('✅ Tenant créé:', newTenant);
    } else {
      tenantId = tenants[0].id;
      console.log('✅ Utilisation du tenant existant:', tenantId);
    }
    
    // 2. Vérifier les utilisateurs existants
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, tenantId: true }
    });
    
    console.log('📋 Utilisateurs disponibles:');
    users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role} - Tenant: ${u.tenantId}`));
    
    // 3. Chercher ou créer l'utilisateur Amine
    let amineUser = users.find(u => 
      u.name.toLowerCase().includes('amine') || 
      u.email.toLowerCase().includes('amine')
    );
    
    if (amineUser) {
      console.log('\n✅ Utilisateur Amine trouvé:', amineUser);
      
      // Mettre à jour le rôle et le tenant si nécessaire
      if (amineUser.role !== 'admin' || amineUser.tenantId !== tenantId) {
        console.log('🔄 Mise à jour de l\'utilisateur...');
        
        const updatedUser = await prisma.user.update({
          where: { id: amineUser.id },
          data: { 
            role: 'admin',
            tenantId: tenantId
          }
        });

        console.log('✅ Utilisateur mis à jour:', {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          tenantId: updatedUser.tenantId
        });
      } else {
        console.log('✅ Utilisateur a déjà les bonnes permissions');
      }
    } else {
      console.log('\n❌ Utilisateur Amine non trouvé');
      console.log('💡 Vous devrez vous connecter avec un utilisateur admin existant ou créer un nouvel utilisateur');
    }
    
    // 4. Afficher les informations de connexion
    console.log('\n📝 Informations de connexion:');
    console.log('- Assurez-vous d\'être connecté avec un utilisateur ayant le rôle "admin"');
    console.log('- Le tenantId doit être défini pour l\'utilisateur');
    console.log('- Vérifiez que le token JWT contient les bonnes informations');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdminUser(); 