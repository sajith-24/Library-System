export type UserRole = 'Admin' | 'Student';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  email?: string;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  quantity: number;
  available: number;
  publisher: string;
  year: number;
  coverUrl?: string;
  description?: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  book?: Book;
  user?: User;
}

export interface AlertSettings {
  lowStockThreshold: number;
  borrowingPeriodDays: number;
  finePerDay: number;
}
