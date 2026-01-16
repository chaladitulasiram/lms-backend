import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // 1. Validate User (Check email & password)
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result; // Return user without password
        }
        return null;
    }

    // 2. Login (Generate JWT Token)
    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role,
            name: user.name
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                designation: user.designation,
                role: user.role,
                avatar: user.avatar,
            }
        };
    }

    // 3. Register (Create new user)
    async register(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            ...data,
            password: hashedPassword,
        });

        // Return user without password
        const { password, ...result } = user;
        return result;
    }

    // 4. Get Profile
    async getProfile(userId: string) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const { password, ...result } = user;
        return result;
    }

    // 5. Update Profile
    async updateProfile(userId: string, data: any) {
        const user = await this.usersService.update(userId, data);
        const { password, ...result } = user;
        return result;
    }
}