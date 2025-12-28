import { Survey, SurveyResponse, SurveyResults } from '@/types/survey';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.112:3080';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export async function getActiveSurveys(): Promise<Survey[]> {
  const response = await fetch(`${API_BASE_URL}/surveys/active`);
  if (!response.ok) {
    throw new Error('Failed to fetch surveys');
  }
  return response.json();
}

export async function getSurveyById(id: string): Promise<Survey> {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch survey');
  }
  return response.json();
}

export async function submitSurveyResponse(response: SurveyResponse): Promise<void> {
  const surveyResponse = await fetch(`${API_BASE_URL}/surveys/${response.surveyId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(response),
  });

  if (!surveyResponse.ok) {
    throw new Error('Failed to submit survey response');
  }
}

export async function getSurveyResults(id: string): Promise<SurveyResults> {
  const response = await fetch(`${API_BASE_URL}/surveys/${id}/results`);
  if (!response.ok) {
    throw new Error('Failed to fetch survey results');
  }
  return response.json();
}

export interface CreateCommentDto {
  name?: string;
  message: string;
}

export interface CommentItem {
  id: string;
  name?: string;
  message: string;
  createdAt: string;
}

export async function getComments(limit = 20): Promise<CommentItem[]> {
  const response = await fetch(`${API_BASE_URL}/comments?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch comments');
  return response.json();
}

export async function createComment(dto: CreateCommentDto): Promise<CommentItem> {
  const res = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
}

export async function getAdminComments(secret: string, limit = 100): Promise<CommentItem[]> {
  const res = await fetch(`${API_BASE_URL}/comments/admin?limit=${limit}`, {
    headers: { 'x-admin-secret': secret },
  });
  if (!res.ok) throw new Error('Failed to fetch admin comments');
  return res.json();
}

export async function getCommentCount(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/comments/count`);
  if (!res.ok) throw new Error('Failed to fetch comment count');
  const json = await res.json();
  return json.count ?? 0;
}

// Admin API functions
export async function getAllUsers(query: PaginationQuery = {}): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await fetch(`${API_BASE_URL}/auth/admin/users?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

// Surveys Management
export async function getAllSurveys(query: PaginationQuery = {}): Promise<PaginatedResponse<Survey>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await fetch(`${API_BASE_URL}/surveys?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch surveys');
  }
  return response.json();
}

export async function createSurvey(surveyData: any): Promise<Survey> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(surveyData),
  });
  if (!response.ok) {
    throw new Error('Failed to create survey');
  }
  return response.json();
}

export async function deleteSurvey(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/surveys/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete survey');
  }
}

export async function createUser(userData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create user');
  }
  return response.json();
}

export async function updateUser(userId: string, userData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  return response.json();
}

export async function deleteUser(userId: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
}


// Position management API functions
export async function getAllPositions(query: PaginationQuery = {}): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await fetch(`${API_BASE_URL}/auth/admin/positions?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch positions');
  }
  return response.json();
}

export async function createPosition(positionData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(positionData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create position');
  }
  return response.json();
}

export async function updatePosition(positionId: string, positionData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(positionData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update position');
  }
  return response.json();
}

export async function updatePositionParent(positionId: string, parentPositionId: string | null): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}/parent`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ parentPositionId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update position parent');
  }
  return response.json();
}

export async function updatePositionCoordinates(positionId: string, x: number | null, y: number | null): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}/coordinates`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ x, y }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update position coordinates');
  }
  return response.json();
}

export async function resetOrgChartLayout(): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/reset-layout`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reset org chart layout');
  }
  return response.json();
}

export async function uploadProfileImage(file: File): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/auth/upload/profile-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile image');
  }

  return response.json();
}

export async function getAllPositionsFlat(): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/flat`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch positions');
  }
  return response.json();
}

export async function deletePosition(positionId: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/positions/${positionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete position');
  }
}

export async function getOrganizationalChart(): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/auth/admin/org-chart`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch organizational chart');
  }

  return response.json();
}

// HR Module API Functions

// Contracts
export async function getAllContracts(query: PaginationQuery = {}): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await fetch(`${API_BASE_URL}/hr/contracts?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch contracts');
  }
  return response.json();
}

export async function createContract(contractData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(contractData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create contract');
  }
  return response.json();
}

export async function updateContractStatus(id: string, status: string): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/contracts/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error('Failed to update contract status');
  }
  return response.json();
}

// Assignments
export async function getAllAssignments(query: PaginationQuery = {}): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await fetch(`${API_BASE_URL}/hr/assignments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  return response.json();
}

export async function createAssignment(assignmentData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create assignment');
  }
  return response.json();
}

export async function updateContract(id: string, contractData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/contracts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(contractData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update contract');
  }
  return response.json();
}

export async function deleteContract(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/contracts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete contract');
  }
}

export async function updateAssignment(id: string, assignmentData: any): Promise<any> {
  console.log('🚀 API - updateAssignment called with:', { id, assignmentData });

  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/assignments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });

  console.log('📡 API - Response status:', response.status);
  console.log('📡 API - Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ API - Error response:', error);
    throw new Error(error.message || 'Failed to update assignment');
  }

  const result = await response.json();
  console.log('✅ API - Success response:', result);
  return result;
}

export async function deleteAssignment(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/assignments/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete assignment');
  }
}

// Employee Profile APIs
export async function getAllEmployeeProfiles(query: PaginationQuery = {}): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);

  const response = await fetch(`${API_BASE_URL}/hr/employee-profiles?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch employee profiles');
  }
  return response.json();
}

export async function getEmployeeProfile(id: string): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/employee-profiles/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch employee profile');
  }
  return response.json();
}

export async function getEmployeeProfileByUserId(userId: string): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/employee-profiles/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch employee profile');
  }
  return response.json();
}

export async function createEmployeeProfile(employeeProfileData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/employee-profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(employeeProfileData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create employee profile');
  }
  return response.json();
}

export async function updateEmployeeProfile(id: string, employeeProfileData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/employee-profiles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(employeeProfileData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update employee profile');
  }
  return response.json();
}

export async function deleteEmployeeProfile(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/employee-profiles/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete employee profile');
  }
}

// Performance Evaluations API

export async function createPerformanceEvaluation(evaluationData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(evaluationData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create performance evaluation');
  }
  return response.json();
}

export async function getAllPerformanceEvaluations(
  query: PaginationQuery = {},
  employeeId?: string,
  evaluatorId?: string
): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  if (employeeId) params.append('employeeId', employeeId);
  if (evaluatorId) params.append('evaluatorId', evaluatorId);

  const response = await fetch(`${API_BASE_URL}/hr/performance/evaluations?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch performance evaluations');
  }
  return response.json();
}

export async function getPerformanceEvaluationById(id: string): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/evaluations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch performance evaluation');
  }
  return response.json();
}

export async function updatePerformanceEvaluation(id: string, evaluationData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/evaluations/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(evaluationData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update performance evaluation');
  }
  return response.json();
}

export async function deletePerformanceEvaluation(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/evaluations/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete performance evaluation');
  }
}

export async function getEmployeeEvaluations(employeeId: string, period?: string): Promise<any[]> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();
  if (period) params.append('period', period);

  const response = await fetch(`${API_BASE_URL}/hr/performance/employees/${employeeId}/evaluations?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch employee evaluations');
  }
  return response.json();
}

export async function getEvaluationStatistics(employeeId: string): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/employees/${employeeId}/statistics`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch evaluation statistics');
  }
  return response.json();
}

// Performance Goals API

export async function createPerformanceGoal(goalData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create performance goal');
  }
  return response.json();
}

export async function getAllPerformanceGoals(
  query: PaginationQuery = {},
  employeeId?: string,
  status?: string
): Promise<PaginatedResponse<any>> {
  const token = localStorage.getItem('auth_token');
  const params = new URLSearchParams();

  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  if (employeeId) params.append('employeeId', employeeId);
  if (status) params.append('status', status);

  const response = await fetch(`${API_BASE_URL}/hr/performance/goals?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch performance goals');
  }
  return response.json();
}

export async function getPerformanceGoalById(id: string): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/goals/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch performance goal');
  }
  return response.json();
}

export async function updatePerformanceGoal(id: string, goalData: any): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/goals/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(goalData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update performance goal');
  }
  return response.json();
}

export async function deletePerformanceGoal(id: string): Promise<void> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/performance/goals/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete performance goal');
  }
}

// Seeder API Functions

export async function seedTestData(): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/seeder/seed`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to seed test data');
  }
  return response.json();
}

export async function clearTestData(): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/seeder/clear`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to clear test data');
  }
  return response.json();
}

export async function getSeederStats(): Promise<any> {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`${API_BASE_URL}/hr/seeder/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get seeder stats');
  }
  return response.json();
}
