import { useState, useEffect } from 'react';
import { User, BorrowedBook, Book } from '../types';
import { borrowAPI, settingsAPI, calculateFine } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Search, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BorrowReturnViewProps {
  user: User;
}

export function BorrowReturnView({ user }: BorrowReturnViewProps) {
  const [borrowedBooks, setBorrowedBooks] = useState<(BorrowedBook & { book?: Book; user?: User })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowedBook | null>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBorrowedBooks();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadBorrowedBooks, 5000);
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const loadBorrowedBooks = async () => {
    try {
      const books = await borrowAPI.getAll();
      
      // Filter by user if student
      if (user.role === 'Student') {
        setBorrowedBooks(books.filter(b => b.userId === user.id));
      } else {
        setBorrowedBooks(books);
      }
    } catch (error) {
      console.error('Error loading borrowed books:', error);
      toast.error('Failed to load borrowed books');
    } finally {
      setIsLoading(false);
    }
  };

  const activeBooks = borrowedBooks.filter(b => !b.returnDate);
  const returnedBooks = borrowedBooks.filter(b => b.returnDate);

  const filteredActive = activeBooks.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.book?.title.toLowerCase().includes(term) ||
      b.book?.author.toLowerCase().includes(term) ||
      b.user?.username.toLowerCase().includes(term)
    );
  });

  const filteredReturned = returnedBooks.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.book?.title.toLowerCase().includes(term) ||
      b.book?.author.toLowerCase().includes(term) ||
      b.user?.username.toLowerCase().includes(term)
    );
  });

  const handleReturn = (borrow: BorrowedBook) => {
    setSelectedBorrow(borrow);
    setShowReturnDialog(true);
  };

  const confirmReturn = async () => {
    if (!selectedBorrow) return;

    try {
      const settings = await settingsAPI.get();
      const fine = calculateFine(selectedBorrow.dueDate, settings.finePerDay);

      await borrowAPI.returnBook(selectedBorrow.id, fine);
      toast.success('Book returned successfully!');
      loadBorrowedBooks();
      setShowReturnDialog(false);
      setSelectedBorrow(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to return book');
    }
  };

  const isOverdue = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Borrow & Return</h2>
        <p className="text-gray-600">Manage book borrowing and returns</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by book title, author, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active Borrows ({activeBooks.length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            Returned ({returnedBooks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {filteredActive.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No active borrowed books</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Author</TableHead>
                        {user.role === 'Admin' && <TableHead>Borrower</TableHead>}
                        <TableHead>Borrow Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredActive.map((borrow) => {
                        const overdue = isOverdue(borrow.dueDate);
                        const daysRemaining = getDaysRemaining(borrow.dueDate);
                        
                        return (
                          <TableRow key={borrow.id}>
                            <TableCell>{borrow.book?.title || 'Unknown'}</TableCell>
                            <TableCell>{borrow.book?.author || 'Unknown'}</TableCell>
                            {user.role === 'Admin' && (
                              <TableCell>{borrow.user?.username || 'Unknown'}</TableCell>
                            )}
                            <TableCell>{new Date(borrow.borrowDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {overdue ? (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  Overdue ({Math.abs(daysRemaining)} days)
                                </Badge>
                              ) : daysRemaining <= 3 ? (
                                <Badge variant="outline" className="gap-1 border-orange-300 text-orange-700">
                                  <AlertCircle className="h-3 w-3" />
                                  Due soon ({daysRemaining} days)
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Active ({daysRemaining} days)
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleReturn(borrow)}
                              >
                                Return Book
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="returned" className="mt-6">
          {filteredReturned.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No returned books</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Book</TableHead>
                        <TableHead>Author</TableHead>
                        {user.role === 'Admin' && <TableHead>Borrower</TableHead>}
                        <TableHead>Borrow Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Return Date</TableHead>
                        <TableHead>Fine</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReturned.map((borrow) => (
                        <TableRow key={borrow.id}>
                          <TableCell>{borrow.book?.title || 'Unknown'}</TableCell>
                          <TableCell>{borrow.book?.author || 'Unknown'}</TableCell>
                          {user.role === 'Admin' && (
                            <TableCell>{borrow.user?.username || 'Unknown'}</TableCell>
                          )}
                          <TableCell>{new Date(borrow.borrowDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            {borrow.fine ? (
                              <span className="text-red-600">${borrow.fine.toFixed(2)}</span>
                            ) : (
                              <span className="text-green-600">$0.00</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Return Dialog */}
      {selectedBorrow && (() => {
        // Calculate fine immediately using default settings
        const defaultFinePerDay = 1; // Default value
        const fine = calculateFine(selectedBorrow.dueDate, defaultFinePerDay);
        
        return (
          <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Return Book</DialogTitle>
                <DialogDescription>Confirm the return of this book</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Book:</span>
                    <span>{borrowedBooks.find(b => b.id === selectedBorrow.id)?.book?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span>{new Date(selectedBorrow.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Return Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                {fine > 0 ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-red-900 mb-1">Late Return Fine</h4>
                        <p className="text-sm text-red-800">
                          This book is {Math.ceil((new Date().getTime() - new Date(selectedBorrow.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue.
                          Fine: <strong>${fine.toFixed(2)}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-green-900 mb-1">On Time Return</h4>
                        <p className="text-sm text-green-800">No fine. Book returned on time.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmReturn}>Confirm Return</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}