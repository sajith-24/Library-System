import { useState, useEffect } from 'react';
import { Book, User } from '../types';
import { bookAPI, borrowAPI, settingsAPI } from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { bookCategories } from '../lib/mockData';
import { BorrowBookDialog } from './BorrowBookDialog';
import { BookDetailsDialog } from './BookDetailsDialog';
import { EditBookDialog } from './EditBookDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

interface CatalogViewProps {
  user: User;
}

export function CatalogView({ user }: CatalogViewProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'title' | 'author' | 'category' | 'isbn'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBorrowDialog, setShowBorrowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
    // Refresh books every 5 seconds for real-time updates
    const interval = setInterval(loadBooks, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterBooks();
  }, [searchTerm, filterType, selectedCategory, books]);

  const loadBooks = async () => {
    try {
      const allBooks = await bookAPI.getAll();
      setBooks(allBooks);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book => {
        switch (filterType) {
          case 'title':
            return book.title.toLowerCase().includes(term);
          case 'author':
            return book.author.toLowerCase().includes(term);
          case 'category':
            return book.category.toLowerCase().includes(term);
          case 'isbn':
            return book.isbn.toLowerCase().includes(term);
          default:
            return (
              book.title.toLowerCase().includes(term) ||
              book.author.toLowerCase().includes(term) ||
              book.category.toLowerCase().includes(term) ||
              book.isbn.toLowerCase().includes(term)
            );
        }
      });
    }

    setFilteredBooks(filtered);
  };

  const handleBorrow = (book: Book) => {
    setSelectedBook(book);
    setShowBorrowDialog(true);
  };

  const handleBorrowConfirm = async () => {
    if (selectedBook) {
      try {
        await borrowAPI.create(selectedBook.id, user.id);
        toast.success('Book borrowed successfully!');
        loadBooks();
        setShowBorrowDialog(false);
      } catch (error: any) {
        toast.error(error.message || 'Failed to borrow book. It may not be available.');
      }
    }
  };

  const handleViewDetails = (book: Book) => {
    setSelectedBook(book);
    setShowDetailsDialog(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setShowEditDialog(true);
  };

  const handleEditSave = async (updates: Partial<Book>) => {
    if (selectedBook) {
      try {
        await bookAPI.update(selectedBook.id, updates);
        toast.success('Book updated successfully!');
        loadBooks();
        setShowEditDialog(false);
      } catch (error) {
        toast.error('Failed to update book');
      }
    }
  };

  const handleDelete = (book: Book) => {
    setBookToDelete(book);
  };

  const confirmDelete = async () => {
    if (bookToDelete) {
      try {
        await bookAPI.delete(bookToDelete.id);
        toast.success('Book deleted successfully!');
        loadBooks();
        setBookToDelete(null);
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Book Catalog</h2>
        <p className="text-gray-600">Search and browse available books</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="isbn">ISBN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {bookCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="flex flex-col overflow-hidden">
            {book.coverUrl && (
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <ImageWithFallback 
                  src={book.coverUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => handleViewDetails(book)}
                />
                <Badge 
                  variant={book.available > 0 ? 'default' : 'destructive'} 
                  className="absolute top-2 right-2"
                >
                  {book.available > 0 ? 'Available' : 'Borrowed'}
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{book.title}</CardTitle>
                  <CardDescription className="truncate">{book.author}</CardDescription>
                </div>
                {!book.coverUrl && (
                  <Badge variant={book.available > 0 ? 'default' : 'destructive'} className="shrink-0">
                    {book.available > 0 ? 'Available' : 'Borrowed'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span>{book.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ISBN:</span>
                  <span className="font-mono text-xs">{book.isbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available:</span>
                  <span>{book.available} / {book.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Year:</span>
                  <span>{book.year > 0 ? book.year : 'Ancient'}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(book)}
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Details
              </Button>
              {user.role === 'Admin' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(book)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(book)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleBorrow(book)}
                  disabled={book.available === 0}
                  className="flex-1"
                >
                  Borrow
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No books found matching your criteria</p>
        </div>
      )}

      {/* Dialogs */}
      {selectedBook && (
        <>
          <BorrowBookDialog
            open={showBorrowDialog}
            onOpenChange={setShowBorrowDialog}
            book={selectedBook}
            user={user}
            onConfirm={handleBorrowConfirm}
          />
          <BookDetailsDialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
            book={selectedBook}
          />
          <EditBookDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            book={selectedBook}
            onSave={handleEditSave}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!bookToDelete} onOpenChange={() => setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}