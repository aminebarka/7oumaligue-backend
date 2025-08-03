const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    console.log('🔍 Recherche de l\'utilisateur Amine...');
    
    // Rechercher l'utilisateur par email ou nom
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Amine', mode: 'insensitive' } },
          { email: { contains: 'amine', mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      console.log('❌ Utilisateur Amine non trouvé');
      console.log('📋 Utilisateurs disponibles:');
      const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
      });
      allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`));
      return;
    }

    console.log('✅ Utilisateur trouvé:', {
      id: user.id,
      name: user.name,
      email: user.email,
      currentRole: user.role
    });

    // Mettre à jour le rôle vers admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'admin' }
    });

    console.log('✅ Rôle mis à jour avec succès:', {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      newRole: updatedUser.role
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole(); 