# Library Book Handling System

A comprehensive, modern web-based library management system with role-based access control, book cataloging, borrowing/returning functionality, alerts, and reporting features.

---

## 📋 Project Overview

### Purpose

The Library Book Handling System is designed to streamline library operations by providing a user-friendly platform for managing book inventory, tracking borrowing and returning of books, and generating reports. It serves both administrators who manage the library and students who borrow books.

**Key Objectives:**
- Centralize book catalog management
- Track borrowing and returning activities
- Generate automated alerts and reports
- Provide role-based access control
- Enable efficient inventory management

### Key Features

- ✅ **Role-Based Authentication** - Admin and Student access levels
- ✅ **Book Management** - Add, edit, delete, and search books
- ✅ **Borrowing System** - Track active borrows with automatic fine calculation
- ✅ **Alerts & Reports** - Overdue books, low stock alerts, and popular books reports
- ✅ **User Management** - Create, edit, and manage user accounts
- ✅ **Configurable Settings** - Customize borrowing period and fine rates
- ✅ **Real-Time Updates** - Live dashboard and catalog synchronization
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices
- ✅ **Data Persistence** - Supabase database for reliable data storage
- ✅ **Session Management** - Secure login with persistent sessions

---

## 📁 Project Structure

```
Library Book Handling System/
├── src/
│   ├── components/              # React components
│   │   ├── AddBookView.tsx       # Add/Create book interface
│   │   ├── AlertsReportsView.tsx # Alerts and reporting dashboard
│   │   ├── BookDetailsDialog.tsx # Book detail modal
│   │   ├── BorrowBookDialog.tsx  # Borrowing dialog
│   │   ├── BorrowReturnView.tsx  # Borrow/Return management
│   │   ├── CatalogView.tsx       # Book catalog browser
│   │   ├── DashboardLayout.tsx   # Main layout component
│   │   ├── DashboardView.tsx     # Admin dashboard
│   │   ├── EditBookDialog.tsx    # Edit book dialog
│   │   ├── LoginPage.tsx         # Authentication page
│   │   ├── SettingsView.tsx      # System settings
│   │   ├── UsersView.tsx         # User management
│   │   ├── figma/                # Design system components
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── api.ts                # API integration
│   │   ├── mockData.ts           # Mock data for development
│   │   └── storage.ts            # Local storage utilities
│   ├── supabase/
│   │   └── functions/            # Backend functions
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── utils/
│   │   └── supabase/             # Supabase utilities
│   ├── styles/
│   │   ├── globals.css           # Global styles
│   │   └── index.css             # Component styles
│   ├── guidelines/
│   │   └── Guidelines.md         # Design guidelines
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Styling
├── build/                        # Production build output
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 🚀 Deployment

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account (for database)
- Modern web browser

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/sajith-24/Library-System.git
   cd Library-System
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase** (Optional - uses mock data by default)
   - Create a `.env.local` file in the project root
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_key
     ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Application will be available at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

6. **Preview Production Build**
   ```bash
   npm run preview
   ```

### Deployment Platforms

**Vercel**
```bash
npm install -g vercel
vercel
```

**Netlify**
```bash
npm run build
# Drag and drop the 'build' folder to Netlify
```

**Traditional Server (Docker)**
```bash
docker build -t library-system .
docker run -p 3000:3000 library-system
```

---

## 💾 Database Models

### User Model
```typescript
interface User {
  id: string;              // Unique identifier
  username: string;        // Login username (unique)
  password: string;        // Encrypted password
  role: 'Admin' | 'Student'; // User role/permission level
  email: string;           // Email address
  createdAt: string;       // Account creation timestamp
}
```

### Book Model
```typescript
interface Book {
  id: string;              // Unique ISBN or system ID
  title: string;           // Book title
  author: string;          // Author name
  category: string;        // Book category
  isbn: string;            // ISBN-13/ISBN-10
  quantity: number;        // Total copies in library
  available: number;       // Available copies
  publisher: string;       // Publishing company
  year: number;            // Publication year
  coverUrl?: string;       // Book cover image URL
  description?: string;    // Book description/synopsis
}
```

### BorrowedBook Model
```typescript
interface BorrowedBook {
  id: string;              // Borrow record ID
  bookId: string;          // Reference to Book
  userId: string;          // Reference to User
  borrowDate: string;      // Date of borrowing
  dueDate: string;         // Expected return date
  returnDate?: string;     // Actual return date
  fine?: number;           // Fine amount (if overdue)
  book?: Book;             // Populated book details
  user?: User;             // Populated user details
}
```

### AlertSettings Model
```typescript
interface AlertSettings {
  lowStockThreshold: number;   // Books count threshold for alerts
  borrowingPeriodDays: number; // Default borrow duration
  finePerDay: number;          // Daily fine rate (USD)
}
```

---

## 🏃 Getting Started

### Quick Start (Using Mock Data)

1. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

2. **Open Browser**
   - Navigate to `http://localhost:5173`

3. **Login with Demo Credentials**
   - See "Test Accounts" section below

### Using with Real Database (Supabase)

1. **Set Up Supabase**
   - Create a Supabase project at https://supabase.com
   - Create tables: `users`, `books`, `borrows`, `settings`

2. **Configure Credentials**
   - Add `.env.local` with Supabase credentials

3. **Initialize Database**
   - Run migration scripts or use Supabase dashboard to create tables

4. **Start Application**
   ```bash
   npm run dev
   ```

---

## 🔐 Test Accounts

### Admin Account
```
Username: admin
Password: admin123
Role: Administrator
Access: Full system access
```
**Capabilities:**
- Add, edit, delete books
- Manage users
- View all reports and alerts
- Configure system settings
- Borrow/return books

### Student Account 1
```
Username: student1
Password: pass123
Role: Student
Access: Catalog browsing and borrowing
```
**Capabilities:**
- Search and browse books
- Borrow available books
- View and return their own books
- Cannot manage system

### Student Account 2
```
Username: student
Password: student123
Role: Student
Access: Catalog browsing and borrowing
```

---

## 📖 Usage Guide

### 1. Login
- Enter username and password
- Click "Sign In"
- Session persists for subsequent visits

### 2. Browse Catalog (All Users)
- Click "Catalog" in sidebar
- Search by title, author, ISBN, or category
- Click book title to view details
- Check availability status

### 3. Borrow Books (All Users)
- Select a book from catalog
- Click "Borrow Book" button
- System calculates due date automatically
- Confirmation notification appears

### 4. Return Books (All Users)
- Go to "Borrow/Return" section
- Find active borrow record
- Click "Return" button
- Fine calculated automatically if overdue
- Return date recorded

### 5. Add Books (Admin Only)
- Navigate to "Add Book"
- Fill in book details (title, author, ISBN, etc.)
- Upload book cover image (optional)
- Set initial quantity
- Click "Add Book"

### 6. Manage Users (Admin Only)
- Go to "Users" section
- Add new users with role selection
- Edit user credentials
- Delete users from system

### 7. View Reports (Admin Only)
- Navigate to "Alerts & Reports"
- View overdue books with borrower info
- Check low stock alerts
- Review popular books statistics
- Export data to CSV

### 8. Configure Settings (Admin Only)
- Go to "Settings"
- Adjust low stock threshold
- Set borrowing period (days)
- Configure fine per day rate
- Changes apply immediately

### 9. Dashboard (Admin Only)
- View key metrics:
  - Total books in catalog
  - Available books
  - Active borrows
  - Overdue books
  - Books in low stock
  - Total pending fines
  - Total students

---

## 🎨 Features in Detail

### Authentication & Authorization
- **Secure Login**: Username and password validation
- **Role-Based Access Control (RBAC)**: Two roles - Admin and Student
- **Session Persistence**: Login state saved across browser sessions
- **Logout**: Clear session and return to login page

### Book Management
- **Add Books**: Create new catalog entries with metadata
- **Edit Books**: Update title, author, quantity, publisher, year, description
- **Delete Books**: Remove books from circulation
- **Book Covers**: Display cover images for visual browsing
- **Search & Filter**: Find books by title, author, ISBN, or category
- **Categories**: 15+ predefined book categories
- **Availability Tracking**: Real-time stock level updates

### Borrowing System
- **Borrow Tracking**: Record all borrowing activities
- **Automatic Due Dates**: Configurable borrowing period
- **Return Processing**: Easy return with one click
- **Fine Calculation**: Automatic fine for overdue returns
- **Borrowing History**: View past and active borrows
- **Quantity Management**: Automatic inventory updates

### Alerts & Reports
- **Overdue Books**: List all overdue books with borrower contact info
- **Low Stock Alerts**: Books below configured threshold
- **Popular Books**: Most borrowed items report
- **CSV Export**: Download reports for external analysis
- **Real-Time Data**: Updates reflect immediately

### User Management
- **Create Users**: Add new students or admins
- **Edit Users**: Update user information and passwords
- **Delete Users**: Remove user accounts
- **Search Users**: Find users by username, email, or role
- **Role Assignment**: Select user role during creation

### Settings & Configuration
- **Low Stock Threshold**: Configure alert trigger level
- **Borrowing Period**: Set default borrow duration (days)
- **Fine Rate**: Set fine amount per overdue day
- **Persistent Settings**: Changes saved and applied system-wide

---

## 🔒 Security Features

### Authentication Security
- Password-based login system
- Session-based access control
- Protected routes based on user role
- Logout clears session data

### Data Protection
- Role-based access control prevents unauthorized operations
- Admin-only functions restricted to admin users
- User data isolation - students see only their borrows
- No sensitive data in browser storage

### Input Validation
- Form validation on all user inputs
- Type checking with TypeScript
- Database constraints on data integrity

### Session Management
- Secure session handling
- Auto-logout on browser close (optional)
- Session timeout protection (configurable)

---

## 📱 Responsive Design

### Desktop Experience
- Full-featured interface with sidebar navigation
- Multi-column layouts for data tables
- Optimized for 1920x1080 and higher resolutions

### Tablet Experience
- Adaptive layouts using Tailwind CSS
- Touch-friendly buttons and inputs
- Collapsible sidebar navigation

### Mobile Experience
- Single-column layouts
- Hamburger menu for navigation
- Full-width tables with horizontal scrolling
- Touch-optimized UI elements

### Framework
- Built with React and TypeScript
- Styled with Tailwind CSS
- shadcn/ui component library for consistency
- Responsive breakpoints: sm, md, lg, xl, 2xl

---

## ⚠️ Error Handling

### User-Friendly Notifications
- **Success Notifications**: Confirm successful operations
- **Error Alerts**: Display clear error messages
- **Warning Toasts**: Warn about potential issues
- **Validation Feedback**: Real-time form validation

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid credentials" | Wrong username/password | Verify credentials and try again |
| "Book not available" | No copies in stock | Choose different book or check later |
| "Cannot borrow more" | User has max active borrows | Return books and try again |
| "Book not found" | ISBN/ID doesn't exist | Verify ISBN or create new book |
| "User already exists" | Duplicate username | Use different username |

### Fallback Mechanisms
- Graceful error recovery
- Clear guidance for users
- Automatic retry options where applicable

---

## 🔄 Data Flow

### Login Flow
```
User enters credentials → Validation → Check role → 
Load dashboard → Store session → Navigate to home
```

### Book Borrowing Flow
```
Select book → Check availability → Click Borrow → 
Calculate due date → Update inventory → Record borrow → 
Show confirmation → Update dashboard
```

### Book Return Flow
```
View active borrows → Click Return → Calculate fine → 
Update return date → Update inventory → 
Record transaction → Update dashboard
```

### Admin Configuration Flow
```
Admin accesses Settings → Modify values → 
Save to database → Apply system-wide → 
Notify users of changes
```

---

## 👥 Support & Maintenance

### Troubleshooting

**Problem: Login not working**
- Clear browser cache and cookies
- Verify username/password
- Check if user account exists
- Restart application

**Problem: Books not appearing**
- Refresh page (Ctrl+R)
- Check internet connection
- Verify database connection
- Check browser console for errors

**Problem: Borrow button disabled**
- Verify book is available
- Check user hasn't reached borrow limit
- Ensure logged in as valid user

### Regular Maintenance

**Daily Tasks:**
- Monitor overdue books
- Check low stock alerts
- Verify system performance

**Weekly Tasks:**
- Review borrow patterns
- Archive old borrow records
- Update book descriptions

**Monthly Tasks:**
- Generate comprehensive reports
- Backup database
- Review system logs
- Update fine rates if needed

### Support Contact

For issues or feature requests:
- **GitHub Issues**: https://github.com/sajith-24/Library-System/issues
- **Email**: Contact project maintainer

---

## 👨‍💻 Developer

**Project Developer:** Sajith-24

**Repository:** https://github.com/sajith-24/Library-System

**License:** MIT

### Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use React hooks for state management
- Maintain component reusability
- Write clear commit messages
- Test changes before submitting PR

---

## 🚀 Future Enhancements

### Phase 2 Features

#### Advanced Search
- Full-text search across book catalog
- Advanced filtering by multiple criteria
- Search history and saved searches
- Barcode scanning support

#### Digital Library
- E-book support and viewing
- Audio book integration
- Document preview functionality

#### User Features
- User profile customization
- Reading history and recommendations
- Wishlist functionality
- Book reviews and ratings

#### Communication
- Email notifications for due dates
- SMS alerts for overdue books
- In-app messaging system
- Automated reminder notifications

#### Analytics & Reporting
- Advanced analytics dashboard
- Custom report generation
- Data visualization (charts/graphs)
- Trend analysis and forecasting
- User behavior analytics

#### Multi-Language Support
- Internationalization (i18n) support
- Multi-language UI
- RTL language support

#### Enhanced Security
- Two-factor authentication (2FA)
- LDAP/Active Directory integration
- Biometric authentication
- Audit logging

#### API & Integrations
- RESTful API for third-party apps
- GraphQL API option
- Mobile app API
- Third-party library integration

#### Payment Integration
- Online fine payment
- Membership fee management
- Digital payment gateway

#### Advanced Features
- Reservation system for unavailable books
- Renewal extension for active borrows
- Hold/Queue system for popular books
- Inter-library lending

---

## 📊 Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | Frontend framework |
| **TypeScript** | Type safety and development |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library |
| **Lucide React** | Icons |
| **Sonner** | Toast notifications |
| **Vite** | Build tool and dev server |
| **Supabase** | Backend & database |
| **React Hook Form** | Form management |
| **Recharts** | Data visualization |
| **Radix UI** | Headless UI components |

---

## 📝 Notes

- The application uses browser localStorage for demo mode
- For production, configure Supabase database connection
- All timestamps use ISO 8601 format
- Fines are calculated in USD
- Default borrowing period is 14 days
- Default fine rate is $1.00 per day

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Last Updated:** December 2025  
**Version:** 0.1.0  
**Status:** Active Development

For the latest updates and information, visit the [GitHub Repository](https://github.com/sajith-24/Library-System)
