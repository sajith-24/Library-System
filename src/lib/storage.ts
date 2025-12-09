import { User, Book, BorrowedBook, AlertSettings } from '../types';
import { mockUsers, mockBooks, mockBorrowedBooks, defaultSettings } from './mockData';

// LocalStorage keys
const USERS_KEY = 'library_users';
const BOOKS_KEY = 'library_books';
const BORROWED_KEY = 'library_borrowed';
const SETTINGS_KEY = 'library_settings';
const CURRENT_USER_KEY = 'library_current_user';

// Initialize data in localStorage if not present
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(BOOKS_KEY)) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(mockBooks));
  }
  if (!localStorage.getItem(BORROWED_KEY)) {
    localStorage.setItem(BORROWED_KEY, JSON.stringify(mockBorrowedBooks));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
  }
};

// User functions
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return mockUsers;
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : mockUsers;
};

export const saveUsers = (users: User[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const loginUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  setCurrentUser(null);
};

// Book functions
export const getBooks = (): Book[] => {
  if (typeof window === 'undefined') return mockBooks;
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : mockBooks;
};

export const saveBooks = (books: Book[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
};

export const addBook = (book: Omit<Book, 'id'>): Book => {
  const books = getBooks();
  const newBook: Book = {
    ...book,
    id: String(Date.now()),
  };
  books.push(newBook);
  saveBooks(books);
  return newBook;
};

export const updateBook = (id: string, updates: Partial<Book>) => {
  const books = getBooks();
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...updates };
    saveBooks(books);
  }
};

export const deleteBook = (id: string) => {
  const books = getBooks();
  const filtered = books.filter(b => b.id !== id);
  saveBooks(filtered);
};

// Borrowed books functions
export const getBorrowedBooks = (): BorrowedBook[] => {
  if (typeof window === 'undefined') return mockBorrowedBooks;
  const data = localStorage.getItem(BORROWED_KEY);
  return data ? JSON.parse(data) : mockBorrowedBooks;
};

export const saveBorrowedBooks = (borrowed: BorrowedBook[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BORROWED_KEY, JSON.stringify(borrowed));
};

export const borrowBook = (bookId: string, userId: string, borrowingPeriodDays: number): BorrowedBook => {
  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  
  if (!book || book.available <= 0) {
    throw new Error('Book not available');
  }

  // Update book availability
  book.available -= 1;
  updateBook(bookId, { available: book.available });

  // Create borrowed record
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + borrowingPeriodDays);

  const borrowed: BorrowedBook = {
    id: String(Date.now()),
    bookId,
    userId,
    borrowDate: borrowDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
  };

  const borrowedBooks = getBorrowedBooks();
  borrowedBooks.push(borrowed);
  saveBorrowedBooks(borrowedBooks);

  return borrowed;
};

export const returnBook = (borrowedId: string, fine?: number) => {
  const borrowedBooks = getBorrowedBooks();
  const borrowed = borrowedBooks.find(b => b.id === borrowedId);
  
  if (!borrowed) {
    throw new Error('Borrowed record not found');
  }

  // Update borrowed record
  borrowed.returnDate = new Date().toISOString().split('T')[0];
  if (fine !== undefined) {
    borrowed.fine = fine;
  }
  saveBorrowedBooks(borrowedBooks);

  // Update book availability
  const books = getBooks();
  const book = books.find(b => b.id === borrowed.bookId);
  if (book) {
    book.available += 1;
    updateBook(book.id, { available: book.available });
  }
};

// Settings functions
export const getSettings = (): AlertSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : defaultSettings;
};

export const saveSettings = (settings: AlertSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Helper functions
export const getBookById = (id: string): Book | undefined => {
  const books = getBooks();
  return books.find(b => b.id === id);
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const getBorrowedBooksWithDetails = (): (BorrowedBook & { book?: Book; user?: User })[] => {
  const borrowed = getBorrowedBooks();
  return borrowed.map(b => ({
    ...b,
    book: getBookById(b.bookId),
    user: getUserById(b.userId),
  }));
};

export const getActiveBorrows = (): BorrowedBook[] => {
  const borrowed = getBorrowedBooks();
  return borrowed.filter(b => !b.returnDate);
};

export const getOverdueBooks = (): (BorrowedBook & { book?: Book; user?: User })[] => {
  const today = new Date().toISOString().split('T')[0];
  const borrowed = getBorrowedBooksWithDetails();
  return borrowed.filter(b => !b.returnDate && b.dueDate < today);
};

export const getLowStockBooks = (): Book[] => {
  const settings = getSettings();
  const books = getBooks();
  return books.filter(b => b.available <= settings.lowStockThreshold);
};

export const calculateFine = (dueDate: string, finePerDay: number): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * finePerDay : 0;
};
