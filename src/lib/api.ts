import { User, Book, BorrowedBook, AlertSettings } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bf9395cb`;

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  return response.json();
}

// ============ AUTH API ============

export const authAPI = {
  login: async (username: string, password: string): Promise<User> => {
    const data = await apiCall<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return data.user;
  },
};

// ============ USER API ============

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    const data = await apiCall<{ users: User[] }>('/users');
    return data.users;
  },

  create: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const data = await apiCall<{ user: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return data.user;
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const data = await apiCall<{ user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  delete: async (id: string): Promise<void> => {
    await apiCall<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ BOOK API ============

export const bookAPI = {
  getAll: async (): Promise<Book[]> => {
    const data = await apiCall<{ books: Book[] }>('/books');
    return data.books;
  },

  getById: async (id: string): Promise<Book> => {
    const data = await apiCall<{ book: Book }>(`/books/${id}`);
    return data.book;
  },

  create: async (bookData: Omit<Book, 'id' | 'available'>): Promise<Book> => {
    const data = await apiCall<{ book: Book }>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
    return data.book;
  },

  update: async (id: string, updates: Partial<Book>): Promise<Book> => {
    const data = await apiCall<{ book: Book }>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.book;
  },

  delete: async (id: string): Promise<void> => {
    await apiCall<{ success: boolean }>(`/books/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ BORROW API ============

export const borrowAPI = {
  getAll: async (): Promise<(BorrowedBook & { book?: Book; user?: User })[]> => {
    const data = await apiCall<{ borrows: (BorrowedBook & { book?: Book; user?: User })[] }>('/borrows');
    return data.borrows;
  },

  create: async (bookId: string, userId: string): Promise<BorrowedBook & { book?: Book; user?: User }> => {
    const data = await apiCall<{ borrow: BorrowedBook & { book?: Book; user?: User } }>('/borrows', {
      method: 'POST',
      body: JSON.stringify({ bookId, userId }),
    });
    return data.borrow;
  },

  returnBook: async (borrowId: string, fine?: number): Promise<BorrowedBook> => {
    const data = await apiCall<{ borrow: BorrowedBook }>(`/borrows/${borrowId}/return`, {
      method: 'PUT',
      body: JSON.stringify({ fine }),
    });
    return data.borrow;
  },
};

// ============ SETTINGS API ============

export const settingsAPI = {
  get: async (): Promise<AlertSettings> => {
    const data = await apiCall<{ settings: AlertSettings }>('/settings');
    return data.settings;
  },

  update: async (settings: AlertSettings): Promise<AlertSettings> => {
    const data = await apiCall<{ settings: AlertSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.settings;
  },
};

// ============ ANALYTICS API ============

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  activeBorrows: number;
  overdueCount: number;
  lowStockCount: number;
  totalFines: number;
  studentCount: number;
}

export const analyticsAPI = {
  getStats: async (): Promise<DashboardStats> => {
    const data = await apiCall<{ stats: DashboardStats }>('/analytics/stats');
    return data.stats;
  },
};

// ============ HELPER FUNCTIONS ============

export const calculateFine = (dueDate: string, finePerDay: number): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * finePerDay : 0;
};

export const getOverdueBooks = (borrows: (BorrowedBook & { book?: Book; user?: User })[]): (BorrowedBook & { book?: Book; user?: User })[] => {
  const today = new Date().toISOString().split('T')[0];
  return borrows.filter(b => !b.returnDate && b.dueDate < today);
};

export const getLowStockBooks = (books: Book[], threshold: number): Book[] => {
  return books.filter(b => b.available <= threshold);
};

export const getActiveBorrows = (borrows: BorrowedBook[]): BorrowedBook[] => {
  return borrows.filter(b => !b.returnDate);
};
