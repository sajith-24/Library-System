import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to generate unique IDs
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Initialize default data
const initializeData = async () => {
  try {
    // Check if data is already initialized
    const initialized = await kv.get('initialized');
    if (initialized) return;

    console.log('Initializing database with default data...');

    // Create default admin user
    const adminId = generateId();
    const adminUser = {
      id: adminId,
      username: 'admin',
      password: 'admin123',
      role: 'Admin',
      email: 'admin@library.com',
      createdAt: new Date().toISOString()
    };

    // Create default student user
    const studentId = generateId();
    const studentUser = {
      id: studentId,
      username: 'student',
      password: 'student123',
      role: 'Student',
      email: 'student@library.com',
      createdAt: new Date().toISOString()
    };

    // Save users
    await kv.set(`user:${adminId}`, adminUser);
    await kv.set(`user:${studentId}`, studentUser);
    await kv.set(`auth:admin`, adminId);
    await kv.set(`auth:student`, studentId);
    await kv.set('user_list', [adminId, studentId]);

    // Create default books
    const books = [
      {
        id: generateId(),
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        isbn: '978-0-06-112008-4',
        quantity: 5,
        available: 3,
        publisher: 'J.B. Lippincott & Co.',
        year: 1960,
        coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        description: 'A classic novel of a lawyer in the Depression-era South defending a black man charged with the rape of a white woman.'
      },
      {
        id: generateId(),
        title: '1984',
        author: 'George Orwell',
        category: 'Science Fiction',
        isbn: '978-0-452-28423-4',
        quantity: 8,
        available: 5,
        publisher: 'Secker & Warburg',
        year: 1949,
        coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400',
        description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.'
      },
      {
        id: generateId(),
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        isbn: '978-0-7432-7356-5',
        quantity: 6,
        available: 6,
        publisher: 'Charles Scribner\'s Sons',
        year: 1925,
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
        description: 'A novel about the American Dream in the Roaring Twenties.'
      }
    ];

    const bookIds = [];
    for (const book of books) {
      await kv.set(`book:${book.id}`, book);
      bookIds.push(book.id);
    }
    await kv.set('book_list', bookIds);

    // Create default settings
    const defaultSettings = {
      lowStockThreshold: 3,
      borrowingPeriodDays: 14,
      finePerDay: 1
    };
    await kv.set('settings', defaultSettings);

    // Initialize empty borrow list
    await kv.set('borrow_list', []);

    // Mark as initialized
    await kv.set('initialized', true);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize on startup
initializeData();

// Health check endpoint
app.get("/make-server-bf9395cb/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ENDPOINTS ============

// Login endpoint
app.post("/make-server-bf9395cb/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // Get user ID from auth mapping
    const userId = await kv.get(`auth:${username}`);
    if (!userId) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Get user data
    const user = await kv.get(`user:${userId}`);
    if (!user || user.password !== password) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ============ USER ENDPOINTS ============

// Get all users
app.get("/make-server-bf9395cb/users", async (c) => {
  try {
    const userIds = await kv.get('user_list') || [];
    const users = [];
    
    for (const userId of userIds) {
      const user = await kv.get(`user:${userId}`);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        users.push(userWithoutPassword);
      }
    }
    
    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Create user
app.post("/make-server-bf9395cb/users", async (c) => {
  try {
    const userData = await c.req.json();
    
    // Check if username already exists
    const existingUserId = await kv.get(`auth:${userData.username}`);
    if (existingUserId) {
      return c.json({ error: 'Username already exists' }, 400);
    }

    const userId = generateId();
    const newUser = {
      ...userData,
      id: userId,
      createdAt: new Date().toISOString()
    };

    // Save user
    await kv.set(`user:${userId}`, newUser);
    await kv.set(`auth:${userData.username}`, userId);
    
    // Update user list
    const userList = await kv.get('user_list') || [];
    userList.push(userId);
    await kv.set('user_list', userList);

    const { password: _, ...userWithoutPassword } = newUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Update user
app.put("/make-server-bf9395cb/users/:id", async (c) => {
  try {
    const userId = c.req.param('id');
    const updates = await c.req.json();
    
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // If username is being changed, update auth mapping
    if (updates.username && updates.username !== user.username) {
      await kv.del(`auth:${user.username}`);
      await kv.set(`auth:${updates.username}`, userId);
    }

    const updatedUser = { ...user, ...updates };
    await kv.set(`user:${userId}`, updatedUser);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return c.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete user
app.delete("/make-server-bf9395cb/users/:id", async (c) => {
  try {
    const userId = c.req.param('id');
    
    const user = await kv.get(`user:${userId}`);
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Delete user and auth mapping
    await kv.del(`user:${userId}`);
    await kv.del(`auth:${user.username}`);
    
    // Update user list
    const userList = await kv.get('user_list') || [];
    const updatedList = userList.filter(id => id !== userId);
    await kv.set('user_list', updatedList);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// ============ BOOK ENDPOINTS ============

// Get all books
app.get("/make-server-bf9395cb/books", async (c) => {
  try {
    const bookIds = await kv.get('book_list') || [];
    const books = [];
    
    for (const bookId of bookIds) {
      const book = await kv.get(`book:${bookId}`);
      if (book) {
        books.push(book);
      }
    }
    
    return c.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return c.json({ error: 'Failed to fetch books' }, 500);
  }
});

// Get book by ID
app.get("/make-server-bf9395cb/books/:id", async (c) => {
  try {
    const bookId = c.req.param('id');
    const book = await kv.get(`book:${bookId}`);
    
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    return c.json({ book });
  } catch (error) {
    console.error('Error fetching book:', error);
    return c.json({ error: 'Failed to fetch book' }, 500);
  }
});

// Create book
app.post("/make-server-bf9395cb/books", async (c) => {
  try {
    const bookData = await c.req.json();
    const bookId = generateId();
    
    const newBook = {
      ...bookData,
      id: bookId,
      available: bookData.quantity // Initially all copies are available
    };

    await kv.set(`book:${bookId}`, newBook);
    
    // Update book list
    const bookList = await kv.get('book_list') || [];
    bookList.push(bookId);
    await kv.set('book_list', bookList);

    return c.json({ book: newBook });
  } catch (error) {
    console.error('Error creating book:', error);
    return c.json({ error: 'Failed to create book' }, 500);
  }
});

// Update book
app.put("/make-server-bf9395cb/books/:id", async (c) => {
  try {
    const bookId = c.req.param('id');
    const updates = await c.req.json();
    
    const book = await kv.get(`book:${bookId}`);
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }

    const updatedBook = { ...book, ...updates };
    await kv.set(`book:${bookId}`, updatedBook);

    return c.json({ book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    return c.json({ error: 'Failed to update book' }, 500);
  }
});

// Delete book
app.delete("/make-server-bf9395cb/books/:id", async (c) => {
  try {
    const bookId = c.req.param('id');
    
    const book = await kv.get(`book:${bookId}`);
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }

    await kv.del(`book:${bookId}`);
    
    // Update book list
    const bookList = await kv.get('book_list') || [];
    const updatedList = bookList.filter(id => id !== bookId);
    await kv.set('book_list', updatedList);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return c.json({ error: 'Failed to delete book' }, 500);
  }
});

// ============ BORROW ENDPOINTS ============

// Get all borrows
app.get("/make-server-bf9395cb/borrows", async (c) => {
  try {
    const borrowIds = await kv.get('borrow_list') || [];
    const borrows = [];
    
    for (const borrowId of borrowIds) {
      const borrow = await kv.get(`borrow:${borrowId}`);
      if (borrow) {
        // Fetch related book and user data
        const book = await kv.get(`book:${borrow.bookId}`);
        const user = await kv.get(`user:${borrow.userId}`);
        
        borrows.push({
          ...borrow,
          book,
          user: user ? { ...user, password: undefined } : undefined
        });
      }
    }
    
    return c.json({ borrows });
  } catch (error) {
    console.error('Error fetching borrows:', error);
    return c.json({ error: 'Failed to fetch borrows' }, 500);
  }
});

// Create borrow (borrow a book)
app.post("/make-server-bf9395cb/borrows", async (c) => {
  try {
    const { bookId, userId } = await c.req.json();
    
    // Get book
    const book = await kv.get(`book:${bookId}`);
    if (!book) {
      return c.json({ error: 'Book not found' }, 404);
    }
    
    if (book.available <= 0) {
      return c.json({ error: 'Book not available' }, 400);
    }

    // Get settings for borrowing period
    const settings = await kv.get('settings') || { borrowingPeriodDays: 14 };
    
    // Create borrow record
    const borrowId = generateId();
    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + settings.borrowingPeriodDays);

    const newBorrow = {
      id: borrowId,
      bookId,
      userId,
      borrowDate: borrowDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    };

    await kv.set(`borrow:${borrowId}`, newBorrow);
    
    // Update borrow list
    const borrowList = await kv.get('borrow_list') || [];
    borrowList.push(borrowId);
    await kv.set('borrow_list', borrowList);

    // Update book availability
    book.available -= 1;
    await kv.set(`book:${bookId}`, book);

    // Fetch full details for response
    const user = await kv.get(`user:${userId}`);
    
    return c.json({ 
      borrow: {
        ...newBorrow,
        book,
        user: user ? { ...user, password: undefined } : undefined
      }
    });
  } catch (error) {
    console.error('Error creating borrow:', error);
    return c.json({ error: 'Failed to borrow book' }, 500);
  }
});

// Return book
app.put("/make-server-bf9395cb/borrows/:id/return", async (c) => {
  try {
    const borrowId = c.req.param('id');
    const { fine } = await c.req.json();
    
    const borrow = await kv.get(`borrow:${borrowId}`);
    if (!borrow) {
      return c.json({ error: 'Borrow record not found' }, 404);
    }

    // Update borrow record
    borrow.returnDate = new Date().toISOString().split('T')[0];
    if (fine !== undefined) {
      borrow.fine = fine;
    }
    await kv.set(`borrow:${borrowId}`, borrow);

    // Update book availability
    const book = await kv.get(`book:${borrow.bookId}`);
    if (book) {
      book.available += 1;
      await kv.set(`book:${book.id}`, book);
    }

    return c.json({ borrow });
  } catch (error) {
    console.error('Error returning book:', error);
    return c.json({ error: 'Failed to return book' }, 500);
  }
});

// ============ SETTINGS ENDPOINTS ============

// Get settings
app.get("/make-server-bf9395cb/settings", async (c) => {
  try {
    const settings = await kv.get('settings') || {
      lowStockThreshold: 3,
      borrowingPeriodDays: 14,
      finePerDay: 1
    };
    
    return c.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update settings
app.put("/make-server-bf9395cb/settings", async (c) => {
  try {
    const settings = await c.req.json();
    await kv.set('settings', settings);
    
    return c.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ============ ANALYTICS ENDPOINTS ============

// Get dashboard stats
app.get("/make-server-bf9395cb/analytics/stats", async (c) => {
  try {
    const bookIds = await kv.get('book_list') || [];
    const borrowIds = await kv.get('borrow_list') || [];
    const userIds = await kv.get('user_list') || [];
    const settings = await kv.get('settings') || { lowStockThreshold: 3, finePerDay: 1 };

    let totalBooks = 0;
    let availableBooks = 0;
    let lowStockCount = 0;

    for (const bookId of bookIds) {
      const book = await kv.get(`book:${bookId}`);
      if (book) {
        totalBooks += book.quantity;
        availableBooks += book.available;
        if (book.available <= settings.lowStockThreshold) {
          lowStockCount++;
        }
      }
    }

    let activeBorrows = 0;
    let overdueCount = 0;
    let totalFines = 0;
    const today = new Date().toISOString().split('T')[0];

    for (const borrowId of borrowIds) {
      const borrow = await kv.get(`borrow:${borrowId}`);
      if (borrow && !borrow.returnDate) {
        activeBorrows++;
        if (borrow.dueDate < today) {
          overdueCount++;
          // Calculate fine
          const dueDate = new Date(borrow.dueDate);
          const todayDate = new Date();
          const diffTime = todayDate.getTime() - dueDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 0) {
            totalFines += diffDays * settings.finePerDay;
          }
        }
      }
      if (borrow && borrow.fine) {
        totalFines += borrow.fine;
      }
    }

    const studentCount = userIds.length;

    return c.json({
      stats: {
        totalBooks,
        availableBooks,
        activeBorrows,
        overdueCount,
        lowStockCount,
        totalFines,
        studentCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

Deno.serve(app.fetch);
