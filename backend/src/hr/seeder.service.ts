import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../survey/entities/user.entity';
import { Position } from '../survey/entities/position.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { PerformanceEvaluation, EvaluationType, EvaluationStatus } from './entities/performance-evaluation.entity';
import { PerformanceGoal, GoalCategory, GoalPriority, GoalStatus } from './entities/performance-goal.entity';
import { Contract, ContractStatus, ContractType } from './entities/contract.entity';
import { Assignment } from './entities/assignment.entity';

interface SeederResult {
    positions: number;
    users: number;
    contracts: number;
    assignments: number;
    goals: number;
    evaluations: number;
    errors: string[];
}

@Injectable()
export class SeederService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Position)
        private positionRepository: Repository<Position>,
        @InjectRepository(EmployeeProfile)
        private employeeProfileRepository: Repository<EmployeeProfile>,
        @InjectRepository(PerformanceEvaluation)
        private evaluationRepository: Repository<PerformanceEvaluation>,
        @InjectRepository(PerformanceGoal)
        private goalRepository: Repository<PerformanceGoal>,
        @InjectRepository(Contract)
        private contractRepository: Repository<Contract>,
        @InjectRepository(Assignment)
        private assignmentRepository: Repository<Assignment>,
    ) {}

    // داده‌های تستی چارت سازمانی
    private positionsData = [
        // سطح 1 - مدیریت عالی
        { title: 'مدیر عامل', level: 1, department: 'مدیریت عالی', parentTitle: null, order: 1, isActive: true, colorScheme: 0x7c3aed }, // Royal Purple (بنفش سلطنتی)

        // سطح 2 - معاونان و مدیران اصلی (تحت مدیر عامل)
        { title: 'معاون اجرایی', level: 2, department: 'مدیریت عالی', parentTitle: 'مدیر عامل', order: 2, isActive: true, colorScheme: 0x059669 }, // Emerald (زمردی)
        { title: 'معاون مالی و اداری', level: 2, department: 'مدیریت عالی', parentTitle: 'مدیر عامل', order: 3, isActive: true, colorScheme: 0xdc2626 }, // Crimson Red (قرمز خونین)

        // سطح 3 - مدیران بخش‌ها (تحت معاونان) - طیف کامل رنگ‌ها
        { title: 'مدیر منابع انسانی', level: 3, department: 'منابع انسانی', parentTitle: 'معاون اجرایی', order: 4, isActive: true, colorScheme: 0xea580c }, // Burnt Orange (نارنجی سوخته)
        { title: 'مدیر مالی', level: 3, department: 'مالی', parentTitle: 'معاون مالی و اداری', order: 5, isActive: true, colorScheme: 0x0891b2 }, // Ocean Blue (آبی اقیانوسی)
        { title: 'مدیر فروش', level: 3, department: 'فروش', parentTitle: 'معاون اجرایی', order: 6, isActive: true, colorScheme: 0x7c2d12 }, // Chocolate Brown (قهوه‌ای شکلاتی)
        { title: 'مدیر بازاریابی', level: 3, department: 'بازاریابی', parentTitle: 'معاون اجرایی', order: 7, isActive: true, colorScheme: 0xc2410c }, // Carrot Orange (هویج نارنجی)
        { title: 'مدیر تولید', level: 3, department: 'تولید', parentTitle: 'معاون اجرایی', order: 8, isActive: true, colorScheme: 0x166534 }, // Forest Green (سبز جنگلی)
        { title: 'مدیر IT', level: 3, department: 'فناوری اطلاعات', parentTitle: 'معاون اجرایی', order: 9, isActive: true, colorScheme: 0x5b21b6 }, // Deep Violet (بنفش عمیق)
        { title: 'مدیر اداری', level: 3, department: 'اداری', parentTitle: 'معاون مالی و اداری', order: 10, isActive: true, colorScheme: 0x92400e }, // Rusty Orange (نارنجی زنگ‌زده)

        // سطح 4 - کارشناسان و سرپرستان (تحت مدیران بخش‌ها) - رنگ‌های هماهنگ با مدیران + تنوع بیشتر
        { title: 'کارشناس منابع انسانی', level: 4, department: 'منابع انسانی', parentTitle: 'مدیر منابع انسانی', order: 11, isActive: true, colorScheme: 0xf97316 }, // Bright Orange (نارنجی روشن)
        { title: 'کارشناس استخدام', level: 4, department: 'منابع انسانی', parentTitle: 'مدیر منابع انسانی', order: 12, isActive: true, colorScheme: 0xf59e0b }, // Golden Yellow (زرد طلایی)
        { title: 'حسابدار', level: 4, department: 'مالی', parentTitle: 'مدیر مالی', order: 13, isActive: true, colorScheme: 0x0ea5e9 }, // Sky Blue (آبی آسمانی)
        { title: 'کارشناس مالی', level: 4, department: 'مالی', parentTitle: 'مدیر مالی', order: 14, isActive: true, colorScheme: 0x0284c7 }, // Steel Blue (آبی فولادی)
        { title: 'کارشناس فروش', level: 4, department: 'فروش', parentTitle: 'مدیر فروش', order: 15, isActive: true, colorScheme: 0xa16207 }, // Amber Brown (قهوه‌ای کهربایی)
        { title: 'کارشناس پشتیبانی فروش', level: 4, department: 'فروش', parentTitle: 'مدیر فروش', order: 16, isActive: true, colorScheme: 0x9a3412 }, // Auburn (قرمز-قهوه‌ای)
        { title: 'کارشناس بازاریابی دیجیتال', level: 4, department: 'بازاریابی', parentTitle: 'مدیر بازاریابی', order: 17, isActive: true, colorScheme: 0xea580c }, // Tangerine (نارنجی ماندارین)
        { title: 'طراح گرافیک', level: 4, department: 'بازاریابی', parentTitle: 'مدیر بازاریابی', order: 18, isActive: true, colorScheme: 0xc2410c }, // Pumpkin (کدو تنبل)
        { title: 'سرپرست تولید', level: 4, department: 'تولید', parentTitle: 'مدیر تولید', order: 19, isActive: true, colorScheme: 0x15803d }, // Kelly Green (سبز کلی)
        { title: 'کارشناس کنترل کیفیت', level: 4, department: 'تولید', parentTitle: 'مدیر تولید', order: 20, isActive: true, colorScheme: 0x16a34a }, // Jungle Green (سبز جنگلی روشن)
        { title: 'برنامه‌نویس ارشد', level: 4, department: 'فناوری اطلاعات', parentTitle: 'مدیر IT', order: 21, isActive: true, colorScheme: 0x7c3aed }, // Electric Purple (بنفش برقی)
        { title: 'مدیر پروژه', level: 4, department: 'فناوری اطلاعات', parentTitle: 'مدیر IT', order: 22, isActive: true, colorScheme: 0x8b5cf6 }, // Vivid Violet (بنفش زنده)
        { title: 'منشی', level: 4, department: 'اداری', parentTitle: 'مدیر اداری', order: 23, isActive: true, colorScheme: 0xb45309 }, // Copper Orange (نارنجی مس)
        { title: 'کارشناس اداری', level: 4, department: 'اداری', parentTitle: 'مدیر اداری', order: 24, isActive: true, colorScheme: 0xd97706 }, // Saffron (زعفران)

        // سطح 5 - کارمندان عملیاتی (تحت کارشناسان) - طیف کامل رنگ‌ها با تنوع بالا
        { title: 'کارمند منابع انسانی', level: 5, department: 'منابع انسانی', parentTitle: 'کارشناس منابع انسانی', order: 25, isActive: true, colorScheme: 0xffedd5 }, // Cream (کرم)
        { title: 'کارمند استخدام', level: 5, department: 'منابع انسانی', parentTitle: 'کارشناس استخدام', order: 26, isActive: true, colorScheme: 0xfef3c7 }, // Pale Yellow (زرد کم‌رنگ)
        { title: 'کارمند مالی', level: 5, department: 'مالی', parentTitle: 'حسابدار', order: 27, isActive: true, colorScheme: 0xe0f2fe }, // Alice Blue (آبی آلیس)
        { title: 'کارمند حسابداری', level: 5, department: 'مالی', parentTitle: 'کارشناس مالی', order: 28, isActive: true, colorScheme: 0xdbf3ff }, // Powder Blue (آبی پودر)
        { title: 'نماینده فروش', level: 5, department: 'فروش', parentTitle: 'کارشناس فروش', order: 29, isActive: true, colorScheme: 0xfef2f2 }, // Misty Rose (رز مه‌آلود)
        { title: 'کارشناس پشتیبانی', level: 5, department: 'فروش', parentTitle: 'کارشناس پشتیبانی فروش', order: 30, isActive: true, colorScheme: 0xfee2e2 }, // Light Blush (بلاش روشن)
        { title: 'کارشناس دیجیتال', level: 5, department: 'بازاریابی', parentTitle: 'کارشناس بازاریابی دیجیتال', order: 31, isActive: true, colorScheme: 0xfbf1ff }, // Lavender Blush (بلاش лавندر)
        { title: 'طراح', level: 5, department: 'بازاریابی', parentTitle: 'طراح گرافیک', order: 32, isActive: true, colorScheme: 0xfce7f3 }, // Pink Champagne (شامپاین صورتی)
        { title: 'کارگر خط تولید', level: 5, department: 'تولید', parentTitle: 'سرپرست تولید', order: 33, isActive: true, colorScheme: 0xd1fae5 }, // Honeydew (عسل شبنم)
        { title: 'کارشناس QC', level: 5, department: 'تولید', parentTitle: 'کارشناس کنترل کیفیت', order: 34, isActive: true, colorScheme: 0xa7f3d0 }, // Mint Cream (کرم نعنایی)
        { title: 'برنامه‌نویس', level: 5, department: 'فناوری اطلاعات', parentTitle: 'برنامه‌نویس ارشد', order: 35, isActive: true, colorScheme: 0xe9d5ff }, // Pale Purple (بنفش کم‌رنگ)
        { title: 'کارشناس IT', level: 5, department: 'فناوری اطلاعات', parentTitle: 'مدیر پروژه', order: 36, isActive: true, colorScheme: 0xddd6fe }, // Light Lavender (لاوندر روشن)
        { title: 'کارمند اداری', level: 5, department: 'اداری', parentTitle: 'منشی', order: 37, isActive: true, colorScheme: 0xfef7ed }, // Seashell (صدف دریا)
        { title: 'کارشناس بایگانی', level: 5, department: 'اداری', parentTitle: 'کارشناس اداری', order: 38, isActive: true, colorScheme: 0xffedd5 }, // Antique White (سفید عتیقه)
    ];

    private firstNames = [
        'احمد', 'محمد', 'علی', 'حسن', 'حسین', 'رضا', 'مهدی', 'امیر', 'سعید', 'حمید',
        'پارسا', 'آرین', 'سامان', 'کیان', 'آرمان', 'ایمان', 'رامین', 'فرهاد', 'بهنام', 'پوریا',
        'مریم', 'فاطمه', 'زهرا', 'نازنین', 'سارا', 'مونا', 'الهام', 'مینا', 'لیلا', 'نرگس',
        'شیرین', 'مهسا', 'سمیه', 'زینب', 'معصومه', 'ریحانه', 'ملیکا', 'فرناز', 'نیلوفر', 'سپیده'
    ];

    private lastNames = [
        'احمدی', 'محمدی', 'علیزاده', 'حسینی', 'رضایی', 'کریمی', 'نوری', 'صادقی', 'موسوی', 'قاسمی',
        'نجفی', 'صدر', 'کاظمی', 'حکیمی', 'شریفی', 'عالی', 'جعفری', 'تقوی', 'امینی', 'رضوی',
        'یزدی', 'عباسی', 'نعیمی', 'صالحی', 'طالبی', 'نجفی', 'سعیدی', 'مبینی', 'شاهی', 'نجاتی'
    ];

    private profileImages = [
        'profile-1766849051591-975057215.png',
        'profile-1766850850314-61459496.png',
        'profile-1766851091768-80024541.png',
        'profile-1766851380056-476134584.png',
        'profile-1766852146307-162983942.png'
    ];

    // توابع کمکی
    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private generateEmployeeData(index: number, positionId: string) {
        const firstName = this.getRandomElement(this.firstNames);
        const lastName = this.getRandomElement(this.lastNames);
        const birthDate = new Date(1970 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const hireDate = new Date(2015 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

        const cities = ['تهران', 'اصفهان', 'مشهد', 'شیراز', 'کرج', 'قم', 'اهواز', 'تبریز', 'کرمانشاه', 'زاهدان'];
        const departments = ['منابع انسانی', 'مالی', 'فروش', 'بازاریابی', 'تولید', 'فناوری اطلاعات', 'اداری', 'عملیات'];

        const username = `user${index.toString().padStart(3, '0')}`;

        return {
            username,
            firstName,
            lastName,
            password: 'password123', // This will be hashed by the auth service
            role: Math.random() > 0.9 ? 'MIDDLEMANAGER' : Math.random() > 0.8 ? 'HRADMIN' : 'PERSONNEL',
            isActive: true,
            positionId,
            employeeProfile: {
                nationalId: `001${index.toString().padStart(6, '0')}`,
                birthDate: birthDate.toISOString().split('T')[0],
                birthPlace: this.getRandomElement(cities),
                gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
                maritalStatus: Math.random() > 0.6 ? 'MARRIED' : Math.random() > 0.3 ? 'SINGLE' : Math.random() > 0.15 ? 'DIVORCED' : 'WIDOWED',
                childrenCount: Math.floor(Math.random() * 4),
                militaryStatus: Math.random() > 0.7 ? 'COMPLETED' : Math.random() > 0.5 ? 'EXEMPTED' : 'NOT_COMPLETED',
                phoneNumber: `0912${Math.floor(Math.random() * 9000000 + 1000000)}`,
                emergencyPhone: `0912${Math.floor(Math.random() * 9000000 + 1000000)}`,
                address: `تهران، خیابان ${Math.floor(Math.random() * 100) + 1}، پلاک ${Math.floor(Math.random() * 200) + 1}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
                hireDate: hireDate.toISOString().split('T')[0],
                employeeId: `EMP${index.toString().padStart(4, '0')}`,
                department: this.getRandomElement(departments),
                baseSalary: Math.floor(Math.random() * 5000000 + 3000000),
                employmentType: Math.random() > 0.7 ? 'CONTRACT' : Math.random() > 0.5 ? 'FULL_TIME' : Math.random() > 0.25 ? 'PART_TIME' : 'INTERN',
                insuranceNumber: `INS${index.toString().padStart(5, '0')}`,
                taxCode: `TAX${index.toString().padStart(5, '0')}`,
                bankAccountNumber: `ACC${index.toString().padStart(10, '0')}`,
                bankName: this.getRandomElement(['بانک ملی', 'بانک ملت', 'بانک صادرات', 'بانک پارسیان', 'بانک پاسارگاد']),
                skills: ['مهارت 1', 'مهارت 2', 'مهارت 3'].join(', '),
                notes: `کارمند نمونه شماره ${index}`,
                profileImageUrl: `/uploads/profiles/${this.getRandomElement(this.profileImages)}`,
                isActive: true
            }
        };
    }

    getDefaultPositionCount(): number {
        return this.positionsData.length;
    }

    async seedTestData(userCount: number = 100, positionCount: number = this.positionsData.length): Promise<SeederResult> {
        console.log('🚀 شروع ایجاد داده‌های تستی...');

        const result: SeederResult = {
            positions: 0,
            users: 0,
            contracts: 0,
            assignments: 0,
            goals: 0,
            evaluations: 0,
            errors: []
        };

        try {
        // 1. ایجاد سمت‌ها با ساختار سلسله مراتبی
        console.log('📋 ایجاد چارت سازمانی...');
        const createdPositions: Position[] = [];
        const positionMap = new Map<string, Position>();

        // ابتدا سمت‌های انتخاب شده را بدون parentPositionId ایجاد می‌کنیم
        const selectedPositions = this.positionsData.slice(0, positionCount);
        for (const positionData of selectedPositions) {
            try {
                const { parentTitle, department, ...positionFields } = positionData;
                const savedPosition = await this.positionRepository.save({
                    ...positionFields,
                    parentPositionId: undefined, // بعداً تنظیم می‌شود
                } as any);
                createdPositions.push(savedPosition);
                positionMap.set(savedPosition.title, savedPosition);
                result.positions++;
                console.log(`✅ سمت ایجاد شد: ${savedPosition.title}`);
            } catch (error: any) {
                console.log(`⚠️ خطا در ایجاد سمت ${positionData.title}:`, error.message);
                result.errors.push(`Position ${positionData.title}: ${error.message}`);
            }
        }

        // سپس parentPositionId را برای سمت‌هایی که parent دارند تنظیم می‌کنیم
        console.log('🔗 تنظیم روابط سلسله مراتبی چارت سازمانی...');
        for (const positionData of selectedPositions) {
            if (positionData.parentTitle) {
                try {
                    const position = positionMap.get(positionData.title);
                    const parentPosition = positionMap.get(positionData.parentTitle);

                    if (position && parentPosition) {
                        await this.positionRepository.update(position.id, {
                            parentPositionId: parentPosition.id
                        });
                        console.log(`🔗 رابطه تنظیم شد: ${position.title} ← ${parentPosition.title}`);
                    } else {
                        console.log(`⚠️ رابطه نامعتبر: ${positionData.title} ← ${positionData.parentTitle}`);
                    }
                } catch (error: any) {
                    console.log(`⚠️ خطا در تنظیم رابطه ${positionData.title}:`, error.message);
                }
            }
        }

            // 2. ایجاد پرسنل
            console.log('👥 ایجاد پرسنل...');

            for (let i = 1; i <= userCount; i++) {
                try {
                    // تولید داده کارمند (شامل department)
                    const tempEmployeeData = this.generateEmployeeData(i, 'temp');

                    // انتخاب سمت بر اساس سطح سازمانی کارمند (نه department چون Position entity آن را ندارد)
                    // برای کارمندان عادی از سطح 4 و 5 انتخاب می‌کنیم
                    const employeeLevel = Math.random() > 0.7 ? 5 : 4; // بیشتر کارمندان سطح 4 و 5
                    const suitablePositions = createdPositions.filter(pos =>
                        pos.title !== 'مدیر عامل' && // مدیر عامل ویژه است
                        (employeeLevel === 5 ? pos.title.includes('کارمند') || pos.title.includes('نماینده') || pos.title.includes('کارشناس') :
                        pos.title.includes('کارشناس') || pos.title.includes('سرپرست'))
                    );

                    // اگر سمت مناسبی پیدا نشد، از همه سمت‌ها انتخاب کنیم
                    const availablePositions = suitablePositions.length > 0 ? suitablePositions : createdPositions.filter(pos => pos.title !== 'مدیر عامل');
                    const selectedPosition = this.getRandomElement(availablePositions);

                    const employeeData = this.generateEmployeeData(i, selectedPosition.id);

                // ایجاد کاربر
                const user = this.userRepository.create({
                    employeeId: employeeData.username, // استفاده از employeeId به جای username
                    username: employeeData.username,
                    firstName: employeeData.firstName,
                    lastName: employeeData.lastName,
                    password: employeeData.password,
                    role: employeeData.role as any,
                    isActive: employeeData.isActive,
                    positionId: employeeData.positionId,
                });

                const savedUser = await this.userRepository.save(user);

                // ایجاد پروفایل پرسنلی
                const profile = this.employeeProfileRepository.create({
                    ...employeeData.employeeProfile,
                    userId: savedUser.id,
                    gender: employeeData.employeeProfile.gender as any,
                    maritalStatus: employeeData.employeeProfile.maritalStatus as any,
                    militaryStatus: employeeData.employeeProfile.militaryStatus as any,
                    employmentType: employeeData.employeeProfile.employmentType as any,
                });

                await this.employeeProfileRepository.save(profile);

                // ایجاد قرارداد برای پرسنل
                try {
                    const contractStartDate = new Date(employeeData.employeeProfile.hireDate);
                    const contractEndDate = employeeData.employeeProfile.employmentType === 'CONTRACT'
                        ? new Date(contractStartDate.getTime() + (365 * 24 * 60 * 60 * 1000)) // 1 year for contracts
                        : null;

                    const contract = this.contractRepository.create({
                        userId: savedUser.id,
                        startDate: contractStartDate,
                        ...(contractEndDate && { endDate: contractEndDate }),
                        status: ContractStatus.ACTIVE,
                        contractType: employeeData.employeeProfile.employmentType === 'FULL_TIME' ? ContractType.FULL_TIME :
                                   employeeData.employeeProfile.employmentType === 'PART_TIME' ? ContractType.PART_TIME :
                                   employeeData.employeeProfile.employmentType === 'CONTRACT' ? ContractType.CONTRACTOR :
                                   ContractType.HOURLY,
                        fileUrl: `/uploads/contracts/contract-${savedUser.username}.pdf`
                    });

                    const savedContract = await this.contractRepository.save(contract);

                    // ایجاد حکم برای پرسنل
                    const assignment = this.assignmentRepository.create({
                        contractId: savedContract.id,
                        positionId: employeeData.positionId,
                        startDate: contractStartDate,
                        ...(contractEndDate && { endDate: contractEndDate }),
                        workloadPercentage: employeeData.employeeProfile.employmentType === 'PART_TIME' ? 50.0 : 100.0,
                        isPrimary: true,
                        customJobDescription: `وظایف مربوط به سمت ${selectedPosition.title}`
                    });

                    await this.assignmentRepository.save(assignment);
                    result.contracts++;
                    result.assignments++;

                } catch (contractError: any) {
                    console.log(`⚠️ خطا در ایجاد قرارداد/حکم برای ${savedUser.firstName}:`, contractError.message);
                    result.errors.push(`Contract/Assignment for ${savedUser.firstName}: ${contractError.message}`);
                }

                result.users++;
                console.log(`✅ پرسنل ایجاد شد: ${savedUser.firstName} ${savedUser.lastName}`);
                } catch (error) {
                    console.log(`⚠️ خطا در ایجاد پرسنل ${i}:`, error.message);
                    result.errors.push(`User ${i}: ${error.message}`);
                }

                // کمی صبر کن تا سرور overload نشه
                if (i % 20 === 0) {
                    console.log(`📊 ${i} پرسنل ایجاد شد...`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            // 3. ایجاد اهداف عملکردی نمونه (برای 20 نفر اول)
            console.log('🎯 ایجاد اهداف عملکردی...');
            const allUsers = await this.userRepository.find({ take: 20 });

            for (const user of allUsers) {
                try {
                    const goal = this.goalRepository.create({
                        employeeId: user.id,
                        title: `هدف عملکردی ${user.firstName}`,
                        description: `بهبود عملکرد در حوزه کاری ${user.employeeProfile?.skills || 'عمومی'}`,
                        category: GoalCategory.INDIVIDUAL,
                        priority: GoalPriority.MEDIUM,
                        measurementCriteria: 'بر اساس ارزیابی‌های دوره‌ای و تکمیل پروژه‌ها',
                        targetValue: 85,
                        unit: 'درصد',
                        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 روز بعد
                        progress: Math.floor(Math.random() * 50),
                        status: GoalStatus.ACTIVE,
                        comments: 'هدف تعیین شده توسط مدیر مستقیم'
                    });

                    await this.goalRepository.save(goal);
                    result.goals++;
                    console.log(`✅ هدف برای ${user.firstName} ایجاد شد`);
                } catch (error) {
                    console.log(`⚠️ خطا در ایجاد هدف برای ${user.firstName}:`, error.message);
                    result.errors.push(`Goal for ${user.firstName}: ${error.message}`);
                }
            }

            // 4. ایجاد ارزیابی‌های نمونه (برای 10 نفر اول)
            console.log('📊 ایجاد ارزیابی‌های عملکرد...');
            const usersForEvaluation = await this.userRepository.find({ take: 10 });

            for (const user of usersForEvaluation) {
                try {
                    const evaluation = this.evaluationRepository.create({
                        employeeId: user.id,
                        evaluatorId: user.id, // خودارزیابی
                        evaluationType: EvaluationType.SELF,
                        period: '2024-Q4',
                        startDate: new Date('2024-10-01'),
                        endDate: new Date('2024-12-31'),
                        categories: [
                            {
                                name: 'کیفیت کار',
                                description: 'ارزیابی کیفیت و دقت انجام کارها',
                                weight: 30,
                                criteria: [
                                    {
                                        title: 'دقت و توجه به جزئیات',
                                        description: 'میزان دقت در انجام وظایف',
                                        rating: Math.floor(Math.random() * 3) + 3, // 3-5
                                        comments: 'عملکرد خوب در این زمینه'
                                    },
                                    {
                                        title: 'کیفیت خروجی کار',
                                        description: 'کیفیت نهایی کارها و پروژه‌ها',
                                        rating: Math.floor(Math.random() * 3) + 3,
                                        comments: 'نیاز به بهبود دارد'
                                    }
                                ]
                            },
                            {
                                name: 'همکاری تیمی',
                                description: 'ارزیابی روابط با همکاران و تیم',
                                weight: 25,
                                criteria: [
                                    {
                                        title: 'ارتباط موثر',
                                        description: 'کیفیت ارتباطات کلامی و نوشتاری',
                                        rating: Math.floor(Math.random() * 3) + 3,
                                        comments: 'ارتباطات خوب'
                                    }
                                ]
                            }
                        ],
                        overallRating: Math.floor(Math.random() * 3) + 3,
                        overallComments: 'عملکرد کلی خوب بوده و پتانسیل رشد دارد',
                        strengths: 'روحیه همکاری بالا، دقت در کار',
                        weaknesses: 'نیاز به بهبود مهارت‌های زمان‌بندی',
                        improvementGoals: 'شرکت در دوره‌های آموزشی مدیریت زمان',
                        status: EvaluationStatus.SUBMITTED
                    });

                    await this.evaluationRepository.save(evaluation);
                    result.evaluations++;
                    console.log(`✅ ارزیابی برای ${user.firstName} ایجاد شد`);
                } catch (error) {
                    console.log(`⚠️ خطا در ایجاد ارزیابی برای ${user.firstName}:`, error.message);
                    result.errors.push(`Evaluation for ${user.firstName}: ${error.message}`);
                }
            }

            console.log('🎉 ایجاد داده‌های تستی کامل شد!');
            console.log(`📊 آمار نهایی:`, result);

            return result;

        } catch (error: any) {
            console.error('❌ خطا در ایجاد داده‌های تستی:', error);
            result.errors.push(`General error: ${error.message}`);
            return result;
        }
    }

    async clearTestData(): Promise<SeederResult> {
        console.log('🧹 شروع پاک کردن داده‌های تستی...');

        const result: SeederResult = {
            positions: 0,
            users: 0,
            contracts: 0,
            assignments: 0,
            goals: 0,
            evaluations: 0,
            errors: []
        };

        try {
            // پاک کردن به ترتیب وابستگی‌ها

            // 1. پاک کردن ارزیابی‌های عملکرد
            console.log('📊 پاک کردن ارزیابی‌های عملکرد...');
            const evaluationResult = await this.evaluationRepository
                .createQueryBuilder()
                .delete()
                .execute();
            result.evaluations = evaluationResult.affected || 0;
            console.log(`✅ ${result.evaluations} ارزیابی پاک شد`);

            // 2. پاک کردن اهداف عملکردی
            console.log('🎯 پاک کردن اهداف عملکردی...');
            const goalResult = await this.goalRepository
                .createQueryBuilder()
                .delete()
                .execute();
            result.goals = goalResult.affected || 0;
            console.log(`✅ ${result.goals} هدف پاک شد`);

            // 3. پاک کردن حکم‌ها
            console.log('📋 پاک کردن حکم‌ها...');
            const assignmentResult = await this.assignmentRepository
                .createQueryBuilder()
                .delete()
                .execute();
            result.assignments = assignmentResult.affected || 0;
            console.log(`✅ ${result.assignments} حکم پاک شد`);

            // 4. پاک کردن قراردادها
            console.log('📄 پاک کردن قراردادها...');
            const contractResult = await this.contractRepository
                .createQueryBuilder()
                .delete()
                .execute();
            result.contracts = contractResult.affected || 0;
            console.log(`✅ ${result.contracts} قرارداد پاک شد`);

            // 5. پاک کردن پروفایل‌های پرسنلی
            console.log('👤 پاک کردن پروفایل‌های پرسنلی...');
            const profileResult = await this.employeeProfileRepository
                .createQueryBuilder()
                .delete()
                .execute();
            console.log(`✅ ${profileResult.affected || 0} پروفایل پرسنلی پاک شد`);

            // 6. پاک کردن کاربران (به جز ادمین)
            console.log('👥 پاک کردن کاربران تستی...');
            const userResult = await this.userRepository
                .createQueryBuilder()
                .delete()
                .where('username LIKE :pattern', { pattern: 'user%' })
                .execute();
            result.users = userResult.affected || 0;
            console.log(`✅ ${result.users} کاربر پاک شد`);

            // 7. پاک کردن سمت‌های تستی (فقط سمت‌هایی که هیچ کاربری به آن‌ها ارجاع ندارد)
            console.log('📋 پاک کردن سمت‌های تستی...');
            const positionResult = await this.positionRepository
                .createQueryBuilder('position')
                .delete()
                .where('NOT EXISTS (SELECT 1 FROM users WHERE users.positionId = position.id)')
                .andWhere('position.title NOT LIKE :adminPattern', { adminPattern: 'مدیر%' })
                .execute();
            result.positions = positionResult.affected || 0;
            console.log(`✅ ${result.positions} سمت پاک شد`);

            console.log('🎉 پاک کردن داده‌های تستی کامل شد!');
            console.log(`📊 آمار پاک شده:`, result);

            return result;

        } catch (error: any) {
            console.error('❌ خطا در پاک کردن داده‌های تستی:', error);
            result.errors.push(`General error: ${error.message}`);
            return result;
        }
    }

    async getSeederStats(): Promise<any> {
        const positions = await this.positionRepository.count();
        const users = await this.userRepository.count();
        const contracts = await this.contractRepository.count();
        const assignments = await this.assignmentRepository.count();
        const goals = await this.goalRepository.count();
        const evaluations = await this.evaluationRepository.count();
        const profiles = await this.employeeProfileRepository.count();

        return {
            positions,
            users,
            contracts,
            assignments,
            goals,
            evaluations,
            profiles,
            total: positions + users + contracts + assignments + goals + evaluations + profiles
        };
    }
}
