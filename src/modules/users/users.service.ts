import { Injectable } from '@nestjs/common';
import { PrismaClient, User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    private prisma = new PrismaClient();

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }
}