import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { success, created, badRequest, notFound } from '../utils/apiResponse';

export const createStadium = async (req: Request, res: Response) => {
  const { name, address, city, region, capacity, fieldCount, fieldTypes, amenities, description, images, contactInfo, pricing, isPartner } = req.body;

  try {
    // Vérifier les champs requis
    if (!name || !city || !capacity) {
      return badRequest(res, "Nom, ville et capacité sont requis");
    }

    const stadium = await prisma.stadium.create({
      data: {
        name,
        address: address || '',
        city,
        region: region || city,
        capacity: parseInt(capacity),
        fieldCount: fieldCount || 1,
        fieldTypes: fieldTypes || ['11v11'],
        amenities: amenities || [],
        images: images || [],
        contactInfo: contactInfo || {},
        pricing: pricing || {},
        description: description || '',
        isPartner: isPartner || false,
        ownerId: req.user?.userId || 1,
      },
    });

    return created(res, stadium, "Stade créé avec succès");
  } catch (error) {
    console.error("Erreur création stade:", error);
    return badRequest(res, "Erreur lors de la création du stade");
  }
};

export const getStadiums = async (req: Request, res: Response) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    return success(res, stadiums);
  } catch (error) {
    console.error("Erreur récupération stades:", error);
    return badRequest(res, "Erreur lors de la récupération des stades");
  }
};

export const getStadiumById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const stadium = await prisma.stadium.findUnique({
      where: {
        id: parseInt(id)
      },
    });

    if (!stadium) {
      return notFound(res, "Stade non trouvé");
    }

    return success(res, stadium);
  } catch (error) {
    console.error("Erreur récupération stade:", error);
    return badRequest(res, "Erreur lors de la récupération du stade");
  }
};

export const updateStadium = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Vérifier que le stade existe
    const existingStadium = await prisma.stadium.findUnique({
      where: {
        id: parseInt(id)
      },
    });

    if (!existingStadium) {
      return notFound(res, "Stade non trouvé");
    }

    // Convertir la capacité en nombre si fournie
    if (updateData.capacity) {
      updateData.capacity = parseInt(updateData.capacity);
    }

    const stadium = await prisma.stadium.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });

    return success(res, stadium, "Stade mis à jour avec succès");
  } catch (error) {
    console.error("Erreur mise à jour stade:", error);
    return badRequest(res, "Erreur lors de la mise à jour du stade");
  }
};

export const deleteStadium = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Vérifier que le stade existe
    const existingStadium = await prisma.stadium.findUnique({
      where: {
        id: parseInt(id)
      },
    });

    if (!existingStadium) {
      return notFound(res, "Stade non trouvé");
    }

    await prisma.stadium.delete({
      where: {
        id: parseInt(id),
      },
    });

    return success(res, null, "Stade supprimé avec succès");
  } catch (error) {
    console.error("Erreur suppression stade:", error);
    return badRequest(res, "Erreur lors de la suppression du stade");
  }
};

export const getStadiumsByCity = async (req: Request, res: Response) => {
  const { city } = req.params;

  try {
    const stadiums = await prisma.stadium.findMany({
      where: {
        city: {
          contains: city,
          mode: 'insensitive'
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return success(res, stadiums);
  } catch (error) {
    console.error("Erreur récupération stades par ville:", error);
    return badRequest(res, "Erreur lors de la récupération des stades");
  }
};

export const getFavoriteStadiums = async (req: Request, res: Response) => {
  try {
    const stadiums = await prisma.stadium.findMany({
      where: {
        isPartner: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return success(res, stadiums);
  } catch (error) {
    console.error("Erreur récupération stades favoris:", error);
    return badRequest(res, "Erreur lors de la récupération des stades favoris");
  }
}; 