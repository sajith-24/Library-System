import { useState, useEffect } from 'react';
import { Book, BorrowedBook, User } from '../types';
import { getOverdueBooks, getLowStockBooks, getBorrowedBooksWithDetails, getBooks } from '../lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertTriangle, TrendingDown, Download, FileText } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function AlertsReportsView() {
  const [overdueBooks, setOverdueBooks] = useState<(BorrowedBook & { book?: Book; user?: User })[]>([]);
  const [lowStockBooks, setLowStockBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<{ book: Book; borrowCount: number }[]>([]);

  useEffect(() => {
    loadAlerts();
    calculatePopularBooks();
  }, []);

  const loadAlerts = () => {
    const overdue = getOverdueBooks();
    const lowStock = getLowStockBooks();
    
    setOverdueBooks(overdue);
    setLowStockBooks(lowStock);
  };

  const calculatePopularBooks = () => {
    const allBorrows = getBorrowedBooksWithDetails();
    const allBooks = getBooks();
    
    const borrowCounts = new Map<string, number>();
    
    allBorrows.forEach(borrow => {
      const count = borrowCounts.get(borrow.bookId) || 0;
      borrowCounts.set(borrow.bookId, count + 1);
    });

    const popular = allBooks
      .map(book => ({
        book,
        borrowCount: borrowCounts.get(book.id) || 0
      }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 10);

    setPopularBooks(popular);
  };

  const exportToCSV = (type: 'overdue' | 'lowstock' | 'popular') => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'overdue':
        csvContent = 'Book Title,Author,Borrower,Borrow Date,Due Date,Days Overdue\n';
        overdueBooks.forEach(borrow => {
          const today = new Date();
          const dueDate = new Date(borrow.dueDate);
          const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          csvContent += `"${borrow.book?.title}","${borrow.book?.author}","${borrow.user?.username}","${borrow.borrowDate}","${borrow.dueDate}","${daysOverdue}"\n`;
        });
        filename = 'overdue_books.csv';
        break;

      case 'lowstock':
        csvContent = 'Title,Author,Category,ISBN,Total Quantity,Available,Status\n';
        lowStockBooks.forEach(book => {
          csvContent += `"${book.title}","${book.author}","${book.category}","${book.isbn}","${book.quantity}","${book.available}","Low Stock"\n`;
        });
        filename = 'low_stock_books.csv';
        break;

      case 'popular':
        csvContent = 'Title,Author,Category,Times Borrowed\n';
        popularBooks.forEach(({ book, borrowCount }) => {
          csvContent += `"${book.title}","${book.author}","${book.category}","${borrowCount}"\n`;
        });
        filename = 'popular_books.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-2">Alerts & Reports</h2>
          <p className="text-gray-600">Monitor library alerts and generate reports</p>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Overdue Books</CardTitle>
            <div className="bg-red-500 p-2 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{overdueBooks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Low Stock Books</CardTitle>
            <div className="bg-orange-500 p-2 rounded-lg">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{lowStockBooks.length}</div>
            <p className="text-xs text-gray-500 mt-1">Consider restocking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overdue" className="w-full">
        <TabsList>
          <TabsTrigger value="overdue">
            Overdue Books ({overdueBooks.length})
          </TabsTrigger>
          <TabsTrigger value="lowstock">
            Low Stock ({lowStockBooks.length})
          </TabsTrigger>
          <TabsTrigger value="popular">
            Popular Books
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Overdue Books</CardTitle>
                  <CardDescription>Books that have passed their due date</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV('overdue')}
                  disabled={overdueBooks.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {overdueBooks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No overdue books</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Borrower</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Days Overdue</TableHead>
                        <TableHead>Contact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueBooks.map((borrow) => {
                        const today = new Date();
                        const dueDate = new Date(borrow.dueDate);
                        const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                        return (
                          <TableRow key={borrow.id}>
                            <TableCell>{borrow.book?.title}</TableCell>
                            <TableCell>{borrow.book?.author}</TableCell>
                            <TableCell>{borrow.user?.username}</TableCell>
                            <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{daysOverdue} days</Badge>
                            </TableCell>
                            <TableCell className="text-sm text-blue-600">
                              {borrow.user?.email || 'No email'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lowstock" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Low Stock Books</CardTitle>
                  <CardDescription>Books with limited availability</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV('lowstock')}
                  disabled={lowStockBooks.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockBooks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingDown className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No low stock alerts</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockBooks.map((book) => (
                        <TableRow key={book.id}>
                          <TableCell>{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.category}</TableCell>
                          <TableCell>{book.quantity}</TableCell>
                          <TableCell>{book.available}</TableCell>
                          <TableCell>
                            <Badge variant={book.available === 0 ? 'destructive' : 'outline'} className="border-orange-300 text-orange-700">
                              {book.available === 0 ? 'Out of Stock' : 'Low Stock'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Popular Books</CardTitle>
                  <CardDescription>Most borrowed books in the library</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV('popular')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Times Borrowed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popularBooks.map(({ book, borrowCount }, index) => (
                      <TableRow key={book.id}>
                        <TableCell>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell>{book.category}</TableCell>
                        <TableCell>
                          <Badge>{borrowCount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-blue-900">Export Options</h4>
              <p className="text-sm text-blue-800">
                All reports can be exported to CSV format for further analysis in spreadsheet applications.
                Use the Export buttons above each report section.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
