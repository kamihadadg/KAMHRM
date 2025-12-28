import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../survey/entities/user.entity';

@Injectable()
export class OrganizationHelpers {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    /**
     * دریافت زیرمجموعه‌های مستقیم یک User
     */
    async getSubordinates(userId: string): Promise<User[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['subordinates'],
        });

        if (!user) {
            return [];
        }

        return user.subordinates || [];
    }

    /**
     * دریافت هم‌ردیف‌های یک User (هم‌مدیر)
     */
    async getPeers(userId: string): Promise<User[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });

        if (!user || !user.managerId) {
            return [];
        }

        // پیدا کردن User هایی که managerId یکسان دارند
        const peers = await this.userRepository.find({
            where: {
                managerId: user.managerId,
                isActive: true,
            },
        });

        // حذف خود User از لیست
        return peers.filter(peer => peer.id !== userId);
    }

    /**
     * دریافت همه زیرمجموعه‌ها به صورت بازگشتی
     */
    async getAllSubordinatesRecursive(userId: string): Promise<User[]> {
        const allSubordinates: User[] = [];
        const visited = new Set<string>();

        const collectSubordinates = async (currentUserId: string) => {
            if (visited.has(currentUserId)) {
                return;
            }
            visited.add(currentUserId);

            const subordinates = await this.getSubordinates(currentUserId);
            allSubordinates.push(...subordinates);

            // بازگشتی برای هر زیرمجموعه
            for (const subordinate of subordinates) {
                await collectSubordinates(subordinate.id);
            }
        };

        await collectSubordinates(userId);
        return allSubordinates;
    }

    /**
     * دریافت پرسنل بر اساس چارت سازمانی
     * اگر rootUserId مشخص شود: همه زیرمجموعه‌های آن User
     * اگر مشخص نشود: همه User های فعال در سیستم
     */
    async getEmployeesByHierarchy(rootUserId?: string): Promise<User[]> {
        if (rootUserId) {
            // دریافت User ریشه
            const rootUser = await this.userRepository.findOne({
                where: { id: rootUserId, isActive: true },
            });

            if (!rootUser) {
                return [];
            }

            // دریافت همه زیرمجموعه‌ها به صورت بازگشتی
            const subordinates = await this.getAllSubordinatesRecursive(rootUserId);
            
            // اضافه کردن خود User ریشه
            return [rootUser, ...subordinates];
        } else {
            // دریافت همه User های فعال
            return this.userRepository.find({
                where: { isActive: true },
                order: { createdAt: 'ASC' },
            });
        }
    }
}

