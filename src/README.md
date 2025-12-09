# Library Book Handling System

A comprehensive, modern web-based library management system with role-based access control, book cataloging, borrowing/returning functionality, alerts, and reporting features.

## Features

### 🔐 Authentication & Authorization
- **Role-based access**: Admin and Student roles
- **Secure login** with username and password
- **Student account creation** - New students can register themselves
- **Switch profile/Logout** - Easy logout button to switch between accounts
- **Session persistence** using localStorage

### 📚 Book Management
- **Add new books** with complete metadata (title, author, category, ISBN, quantity, publisher, year, description)
- **Book cover images** - Visual book covers for better browsing experience
- **Edit book details** and update stock levels
- **Delete books** from the catalog
- **Search and filter** by title, author, category, or ISBN
- **Book categories**: Fiction, Science Fiction, Fantasy, Romance, Mystery, Biography, History, Science, Computer Science, Business, Self-Help, Psychology, Philosophy, Classics, Horror

### 📖 Borrowing System
- **Borrow books** with automatic due date calculation
- **Return books** with automatic fine calculation for overdue items
- **Track active** and **returned borrows**
- **View borrowing history** per user
- **Configurable borrowing period** and fine rates

### 🚨 Alerts & Reports
- **Overdue books alert** with borrower contact information
- **Low stock alerts** for books below threshold
- **Popular books report** showing most borrowed items
- **Export to CSV** for all reports

### 👥 User Management (Admin Only)
- **Add new users** with username, password, email, and role
- **Edit user information** and change passwords
- **Delete users** from the system
- **Search users** by username, email, or role

### ⚙️ Settings (Admin Only)
- **Low stock threshold** configuration
- **Borrowing period** (default: 14 days)
- **Fine per day** for overdue books (default: $1.00)

## Demo Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Admin

### Student Account
- **Username**: `student1`
- **Password**: `pass123`
- **Role**: Student

## Mock Data

The system comes pre-loaded with:
- **50 books** across various categories
- **10 users** (1 admin + 9 students)
- **10 borrow records** (including some overdue items)

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **UI Components**: shadcn/ui component library
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Data Storage**: localStorage (for demo purposes)

## User Roles & Permissions

### Admin
- Full access to all features
- Can add, edit, and delete books
- Can manage users
- Can access all reports and alerts
- Can modify system settings
- Can borrow and return books for any user

### Student
- Can search and browse the book catalog
- Can borrow available books
- Can view and return their own borrowed books
- Cannot add/edit/delete books
- Cannot access user management
- Cannot modify settings

## Data Persistence

The application uses browser localStorage to persist data between sessions. This includes:
- User accounts
- Book catalog
- Borrow records
- System settings
- Current logged-in user

**Note**: Data is stored locally in your browser. Clearing browser data will reset the application to default mock data.

## Key Workflows

### Borrowing a Book
1. Login as a student or admin
2. Navigate to "Search Books"
3. Find a book with available copies
4. Click "Borrow" button
5. Review borrowing details and confirm
6. Book is added to active borrows with due date

### Returning a Book
1. Navigate to "Borrow / Return"
2. Find the book in the "Active Borrows" tab
3. Click "Return Book"
4. Review return details and any fines
5. Confirm return
6. Book availability is updated

### Adding a New Book (Admin Only)
1. Login as admin
2. Navigate to "Add Book"
3. Fill in all required fields
4. Click "Add Book"
5. Book is added to catalog with full availability

### Checking Alerts (Admin Only)
1. Navigate to "Alerts & Reports"
2. View overdue books, low stock items, and popular books
3. Export reports as CSV files
4. Contact borrowers for overdue items

## System Highlights

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Clean Modern UI**: Professional interface with intuitive navigation
- **Visual Book Catalog**: Book covers displayed for enhanced user experience
- **Self-Service Registration**: Students can create their own accounts
- **Easy Profile Switching**: Prominent logout button for switching between accounts
- **Real-time Calculations**: Automatic fine calculation and due date computation
- **Data Validation**: Form validation for all inputs
- **User Feedback**: Toast notifications for all actions
- **Accessibility**: Keyboard navigation and ARIA-compliant components

## Future Enhancements (Supabase Integration)

This application can be enhanced with Supabase for:
- **Real database backend** (PostgreSQL)
- **Multi-user support** with real-time synchronization
- **Secure authentication** with JWT tokens
- **Row-level security** for role-based access
- **Cloud storage** for book cover images
- **Email notifications** for due dates and overdue books
- **Advanced analytics** and reporting

---

**Note**: This is a demonstration application designed for educational and prototyping purposes. For production use with sensitive data, implement proper backend security, user authentication, and data encryption.
