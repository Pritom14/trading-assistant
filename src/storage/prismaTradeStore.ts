import { PrismaClient, User as PrismaUser } from '@prisma/client';

const prisma = new PrismaClient();

export const prismaTradeStore = {
  async getOrCreateDemoUser(): Promise<PrismaUser> {
    let user = await prisma.user.findUnique({ where: { email: 'demo@user.com' } });
    if (!user) {
      try {
        user = await prisma.user.create({ data: { email: 'demo@user.com', name: 'Demo User' } });
      } catch (e: any) {
        // Log the error for debugging
        console.error('Error creating demo user:', e);
        // Always fetch the user after a failed create attempt
        user = await prisma.user.findUnique({ where: { email: 'demo@user.com' } });
      }
    }
    return user!;
  },
  // Add other store methods as needed
}; 