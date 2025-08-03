const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndUpdateUserRole() {
  try {
    console.log('🔍 Vérification des utilisateurs...');
    
    // Lister tous les utilisateurs
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });

    console.log('📋 Utilisateurs disponibles:');
    users.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));

    // Chercher l'utilisateur Amine
    const amineUser = users.find(u => 
      u.name.toLowerCase().includes('amine') || 
      u.email.toLowerCase().includes('amine')
    );

    if (amineUser) {
      console.log('\n✅ Utilisateur Amine trouvé:', amineUser);
      
      if (amineUser.role !== 'admin' && amineUser.role !== 'coach') {
        console.log('🔄 Mise à jour du rôle vers admin...');
        
        const updatedUser = await prisma.user.update({
          where: { id: amineUser.id },
          data: { role: 'admin' }
        });

        console.log('✅ Rôle mis à jour avec succès:', {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          newRole: updatedUser.role
        });
      } else {
        console.log('✅ Utilisateur a déjà les permissions nécessaires');
      }
    } else {
      console.log('\n❌ Utilisateur Amine non trouvé');
      console.log('💡 Vous pouvez créer un nouvel utilisateur admin ou mettre à jour un utilisateur existant');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateUserRole(); 