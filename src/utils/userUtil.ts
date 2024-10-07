import prisma from '@/lib/db';

interface CreateUserParams {
    id: string;
    name: string | null;
    email: string | null;
    bio: string | null;
    wallet: string;
}

const createUser = async ({ id, name, email, bio, wallet }: CreateUserParams) => {
    const user = await prisma.user.create({
        data: {
            id,
            name,
            email,
            bio,
            wallet,
            createdAt: new Date(),
            rankScore: 0
        },
    });
    return user;
};

export default createUser;
