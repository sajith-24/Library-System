import { User, Book, BorrowedBook, AlertSettings } from '../types';
import { mockUsers, mockBooks, mockBorrowedBooks, defaultSettings } from './mockData';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-bf9395cb`;
const USE_MOCK_DATA = true; // Set to true to use mock data, false to use Supabase

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
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
  } catch (error) {
    // If Supabase fails and USE_MOCK_DATA is true, use mock data
    if (USE_MOCK_DATA) {
      console.log('Supabase unavailable, using mock data for:', endpoint);
      return Promise.reject(error); // Let the caller handle with mock data
    }
    throw error;
  }
}

// ============ AUTH API ============

export const authAPI = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      const data = await apiCall<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return data.user;
    } catch (error) {
      // Fallback to mock data
      if (USE_MOCK_DATA) {
        const user = mockUsers.find(u => u.username === username && u.password === password);
        if (user) {
          return user;
        }
      }
      throw new Error('Invalid username or password');
    }
  },
};

// ============ USER API ============

export const userAPI = {
  getAll: async (): Promise<User[]> => {
    try {
      const data = await apiCall<{ users: User[] }>('/users');
      return data.users;
    } catch (error) {
      if (USE_MOCK_DATA) {
        return mockUsers;
      }
      throw error;
    }
  },

  create: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    try {
      const data = await apiCall<{ user: User }>('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return data.user;
    } catch (error) {
      if (USE_MOCK_DATA) {
        // Create a mock user
        const newUser: User = {
          id: (mockUsers.length + 1).toString(),
          ...userData,
          createdAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        return newUser;
      }
      throw error;
    }
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    try {
      const data = await apiCall<{ user: User }>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.user;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const user = mockUsers.find(u => u.id === id);
        if (user) {
          Object.assign(user, updates);
          return user;
        }
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiCall<{ success: boolean }>(`/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (USE_MOCK_DATA) {
        const index = mockUsers.findIndex(u => u.id === id);
        if (index > -1) {
          mockUsers.splice(index, 1);
          return;
        }
      }
      throw error;
    }
  },
};

// ============ BOOK API ============

export const bookAPI = {
  getAll: async (): Promise<Book[]> => {
    try {
      const data = await apiCall<{ books: Book[] }>('/books');
      return data.books;
    } catch (error) {
      if (USE_MOCK_DATA) {
        return mockBooks;
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Book> => {
    try {
      const data = await apiCall<{ book: Book }>(`/books/${id}`);
      return data.book;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const book = mockBooks.find(b => b.id === id);
        if (book) return book;
      }
      throw new Error('Book not found');
    }
  },

  create: async (bookData: Omit<Book, 'id' | 'available'>): Promise<Book> => {
    try {
      const data = await apiCall<{ book: Book }>('/books', {
        method: 'POST',
        body: JSON.stringify(bookData),
      });
      return data.book;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const newBook: Book = {
          id: (mockBooks.length + 1).toString(),
          ...bookData,
          available: bookData.quantity,
        };
        mockBooks.push(newBook);
        return newBook;
      }
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Book>): Promise<Book> => {
    try {
      const data = await apiCall<{ book: Book }>(`/books/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.book;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const book = mockBooks.find(b => b.id === id);
        if (book) {
          Object.assign(book, updates);
          return book;
        }
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiCall<{ success: boolean }>(`/books/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (USE_MOCK_DATA) {
        const index = mockBooks.findIndex(b => b.id === id);
        if (index > -1) {
          mockBooks.splice(index, 1);
          return;
        }
      }
      throw error;
    }
  },
};

// ============ BORROW API ============

export const borrowAPI = {
  getAll: async (): Promise<(BorrowedBook & { book?: Book; user?: User })[]> => {
    try {
      const data = await apiCall<{ borrows: (BorrowedBook & { book?: Book; user?: User })[] }>('/borrows');
      return data.borrows;
    } catch (error) {
      if (USE_MOCK_DATA) {
        return mockBorrowedBooks.map(borrow => ({
          ...borrow,
          book: mockBooks.find(b => b.id === borrow.bookId),
          user: mockUsers.find(u => u.id === borrow.userId),
        }));
      }
      throw error;
    }
  },

  create: async (bookId: string, userId: string): Promise<BorrowedBook & { book?: Book; user?: User }> => {
    try {
      const data = await apiCall<{ borrow: BorrowedBook & { book?: Book; user?: User } }>('/borrows', {
        method: 'POST',
        body: JSON.stringify({ bookId, userId }),
      });
      return data.borrow;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const book = mockBooks.find(b => b.id === bookId);
        if (!book || book.available <= 0) {
          throw new Error('Book not available');
        }
        const newBorrow: BorrowedBook = {
          id: (mockBorrowedBooks.length + 1).toString(),
          bookId,
          userId,
          borrowDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        };
        mockBorrowedBooks.push(newBorrow);
        book.available--;
        return { ...newBorrow, book, user: mockUsers.find(u => u.id === userId) };
      }
      throw error;
    }
  },

  returnBook: async (borrowId: string, fine?: number): Promise<BorrowedBook> => {
    try {
      const data = await apiCall<{ borrow: BorrowedBook }>(`/borrows/${borrowId}/return`, {
        method: 'PUT',
        body: JSON.stringify({ fine }),
      });
      return data.borrow;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const borrow = mockBorrowedBooks.find(b => b.id === borrowId);
        if (borrow) {
          borrow.returnDate = new Date().toISOString();
          if (fine !== undefined) {
            borrow.fine = fine;
          }
          const book = mockBooks.find(b => b.id === borrow.bookId);
          if (book) {
            book.available++;
          }
          return borrow;
        }
      }
      throw error;
    }
  },
};

// ============ SETTINGS API ============

export const settingsAPI = {
  get: async (): Promise<AlertSettings> => {
    try {
      const data = await apiCall<{ settings: AlertSettings }>('/settings');
      return data.settings;
    } catch (error) {
      if (USE_MOCK_DATA) {
        return defaultSettings;
      }
      throw error;
    }
  },

  update: async (settings: AlertSettings): Promise<AlertSettings> => {
    try {
      const data = await apiCall<{ settings: AlertSettings }>('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      return data.settings;
    } catch (error) {
      if (USE_MOCK_DATA) {
        Object.assign(defaultSettings, settings);
        return defaultSettings;
      }
      throw error;
    }
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
    try {
      const data = await apiCall<{ stats: DashboardStats }>('/analytics/stats');
      return data.stats;
    } catch (error) {
      if (USE_MOCK_DATA) {
        const activeBorrows = mockBorrowedBooks.filter(b => !b.returnDate);
        const today = new Date().toISOString().split('T')[0];
        const overdue = activeBorrows.filter(b => b.dueDate < today);
        const lowStock = mockBooks.filter(b => b.available <= defaultSettings.lowStockThreshold);
        const totalFines = mockBorrowedBooks.reduce((sum, b) => sum + (b.fine || 0), 0);
        const students = mockUsers.filter(u => u.role === 'Student');

        return {
          totalBooks: mockBooks.length,
          availableBooks: mockBooks.reduce((sum, b) => sum + b.available, 0),
          activeBorrows: activeBorrows.length,
          overdueCount: overdue.length,
          lowStockCount: lowStock.length,
          totalFines,
          studentCount: students.length,
        };
      }
      throw error;
    }
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
