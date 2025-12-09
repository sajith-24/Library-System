# Library Management System - Database Setup

## ✅ Database Connected!

Your Library Management System is now connected to a **Supabase database** with real-time data persistence.

## 🔐 Default Credentials

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full system access

### Student Account  
- **Username:** `student`
- **Password:** `student123`
- **Role:** Student
- **Access:** Browse and borrow books only

## 🗄️ Database Structure

The system uses Supabase's Key-Value store with the following data model:

### Collections
- **Users** - Store all user accounts (Admin and Student)
- **Books** - Complete book catalog with availability tracking
- **Borrows** - Active and historical borrowing records
- **Settings** - System configuration (fines, borrowing period, etc.)

### Real-Time Updates
- Dashboard stats refresh every 10 seconds
- Book catalog updates every 5 seconds  
- Borrow/return list updates every 5 seconds
- User list updates every 10 seconds

## 📊 Features Connected to Database

### ✅ Authentication
- Login with username/password
- Session persistence
- Role-based access control

### ✅ Book Management
- Add new books with cover images
- Edit book details (quantity, publisher, year, etc.)
- Delete books from catalog
- Real-time availability updates

### ✅ Borrowing System
- Borrow books (decrements availability)
- Return books with automatic fine calculation
- Overdue tracking
- Due date management

### ✅ User Management
- Create new student accounts
- Edit user profiles
- Delete users
- Email and role assignment

### ✅ Settings & Configuration
- Adjust low stock threshold
- Set borrowing period (days)
- Configure fine per day rate
- Changes apply immediately

### ✅ Dashboard Analytics
- Total books count
- Available books
- Active borrows
- Overdue books
- Low stock alerts
- Total fines
- Student count

## 🔄 Data Persistence

All data is stored in Supabase and persists across sessions:
- **Users** remain in the system
- **Books** stay in the catalog
- **Borrow records** are maintained
- **Settings** are saved

## 🚀 API Endpoints

The backend server provides the following endpoints:

### Authentication
- `POST /auth/login` - User authentication

### Users
- `GET /users` - Get all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Books
- `GET /books` - Get all books
- `GET /books/:id` - Get book by ID
- `POST /books` - Create new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### Borrows
- `GET /borrows` - Get all borrows with details
- `POST /borrows` - Borrow a book
- `PUT /borrows/:id/return` - Return a book

### Settings
- `GET /settings` - Get system settings
- `PUT /settings` - Update settings

### Analytics
- `GET /analytics/stats` - Get dashboard statistics

## 📝 Sample Data

The database is initialized with:
- 2 users (admin and student)
- 3 sample books with realistic cover images
- Default settings (14-day borrowing period, $1/day fine)
- Empty borrow history (ready for transactions)

## 🎯 Next Steps

### For Development
1. Test all functionality with the default accounts
2. Add more books to the catalog
3. Create additional student accounts
4. Test the borrowing workflow
5. Verify fine calculations

### For Production Deployment
⚠️ **Important:** Figma Make is for prototyping only. For production use:
1. Export your code
2. Set up proper Supabase project with SQL tables
3. Implement proper authentication (Supabase Auth)
4. Add data encryption for sensitive information
5. Set up proper backup and recovery
6. Implement rate limiting and security measures

## 🔒 Security Notes

- Passwords are currently stored as plain text (acceptable for prototyping)
- For production, implement proper password hashing (bcrypt, Argon2)
- Add API rate limiting
- Implement proper session management
- Use environment variables for sensitive keys
- Add input validation and sanitization

## 💡 Tips

1. **Real-time Updates**: The app automatically refreshes data, so multiple users can work simultaneously
2. **Book Availability**: When a book is borrowed, availability decreases automatically
3. **Fine Calculation**: Fines are calculated based on days overdue × fine per day setting
4. **Search**: Use the search bars to quickly find books, users, or borrows
5. **Filters**: Filter books by category or search criteria

## 🐛 Troubleshooting

If you encounter issues:

1. **Login fails**: Verify you're using correct credentials (admin/admin123)
2. **Data not loading**: Check browser console for API errors
3. **Real-time updates not working**: Refresh the page manually
4. **Book borrow fails**: Ensure book has available copies

## 📧 Support

This is a prototype system built for demonstration. For production use, please implement proper security measures and data protection.

---

**Built with:** React, TypeScript, Tailwind CSS, Supabase, Hono
**Database:** Supabase Key-Value Store
**Real-time:** Polling-based updates
