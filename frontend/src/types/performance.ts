export enum EvaluationType {
    SELF = 'SELF',
    MANAGER = 'MANAGER',
    PEER = 'PEER',
    SUBORDINATE = 'SUBORDINATE',
    CLIENT = 'CLIENT',
}

export enum EvaluationStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    REVIEWED = 'REVIEWED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum GoalCategory {
    INDIVIDUAL = 'INDIVIDUAL',
    TEAM = 'TEAM',
    DEPARTMENTAL = 'DEPARTMENTAL',
    ORGANIZATIONAL = 'ORGANIZATIONAL',
}

export enum GoalStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum GoalPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export interface EvaluationCriterion {
    title: string;
    description?: string;
    rating?: number;
    comments?: string;
}

export interface EvaluationCategory {
    name: string;
    description?: string;
    weight: number;
    criteria: EvaluationCriterion[];
}

export interface PerformanceEvaluation {
    id: string;
    employeeId: string;
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    evaluatorId: string;
    evaluator: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    evaluationType: EvaluationType;
    period: string;
    startDate: string;
    endDate: string;
    categories: EvaluationCategory[];
    overallRating?: number;
    overallComments?: string;
    strengths?: string;
    weaknesses?: string;
    improvementGoals?: string;
    status: EvaluationStatus;
    submittedAt?: string;
    reviewedAt?: string;
    managerComments?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PerformanceGoal {
    id: string;
    employeeId: string;
    employee: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    setterId?: string;
    setter?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    title: string;
    description: string;
    category: GoalCategory;
    priority: GoalPriority;
    measurementCriteria?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    deadline: string;
    progress: number;
    status: GoalStatus;
    completedAt?: string;
    comments?: string;
    parentGoalId?: string;
    parentGoal?: PerformanceGoal;
    createdAt: string;
    updatedAt: string;
}

export interface EvaluationStatistics {
    averageRating: number;
    totalEvaluations: number;
    lastEvaluationDate: string | null;
}

export interface CreateEvaluationDto {
    employeeId: string;
    evaluatorId: string;
    evaluationType?: EvaluationType;
    period: string;
    startDate: string;
    endDate: string;
    categories: EvaluationCategory[];
    overallRating?: number;
    overallComments?: string;
    strengths?: string;
    weaknesses?: string;
    improvementGoals?: string;
    status?: EvaluationStatus;
}

export interface UpdateEvaluationDto {
    period?: string;
    startDate?: string;
    endDate?: string;
    categories?: EvaluationCategory[];
    overallRating?: number;
    overallComments?: string;
    strengths?: string;
    weaknesses?: string;
    improvementGoals?: string;
    status?: EvaluationStatus;
    managerComments?: string;
}

export interface CreateGoalDto {
    employeeId: string;
    setterId?: string;
    title: string;
    description: string;
    category?: GoalCategory;
    priority?: GoalPriority;
    measurementCriteria?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    deadline: string;
    progress?: number;
    status?: GoalStatus;
    comments?: string;
    parentGoalId?: string;
}

export interface UpdateGoalDto {
    title?: string;
    description?: string;
    category?: GoalCategory;
    priority?: GoalPriority;
    measurementCriteria?: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    deadline?: string;
    progress?: number;
    status?: GoalStatus;
    comments?: string;
}
