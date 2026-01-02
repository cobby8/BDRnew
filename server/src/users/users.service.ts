import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async onModuleInit() {
        await this.seedAdminUser();
    }

    async seedAdminUser() {
        const adminUser = await this.findOne('admin');
        if (!adminUser) {
            console.log('Seeding initial admin user...');
            const hashedPassword = await bcrypt.hash('1234', 10);
            const user = this.usersRepository.create({
                username: 'admin',
                password: hashedPassword,
                role: UserRole.SUPER_ADMIN,
                status: UserStatus.APPROVED
            });
            await this.usersRepository.save(user);
            console.log('Admin user seeded (admin/1234)');
        }
    }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async create(userData: Partial<User>): Promise<User> {
        if (!userData.password) {
            throw new Error('Password is required');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
            status: userData.status || UserStatus.PENDING // Default to PENDING if not specified
        });
        return this.usersRepository.save(user);
    }

    async findByStatus(status: UserStatus): Promise<User[]> {
        return this.usersRepository.find({
            where: { status },
            order: { createdAt: 'DESC' }
        });
    }

    async updateStatus(id: string, status: UserStatus): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('User not found');
        }
        user.status = status;
        return this.usersRepository.save(user);
    }
}
