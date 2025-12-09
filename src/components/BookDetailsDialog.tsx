import { Book } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BookDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
}

export function BookDetailsDialog({ open, onOpenChange, book }: BookDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {book.coverUrl && (
              <div className="md:w-48 shrink-0">
                <ImageWithFallback 
                  src={book.coverUrl} 
                  alt={book.title}
                  className="w-full h-64 md:h-80 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={book.available > 0 ? 'default' : 'destructive'}>
                  {book.available > 0 ? 'Available' : 'All Borrowed'}
                </Badge>
                <Badge variant="outline">{book.category}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Author</h4>
                  <p>{book.author}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Publisher</h4>
                  <p>{book.publisher}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">Published Year</h4>
                  <p>{book.year > 0 ? book.year : 'Ancient'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500 mb-1">ISBN</h4>
                  <p className="font-mono text-sm">{book.isbn}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm text-gray-500 mb-2">Availability</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Total Copies:</span>
                <span>{book.quantity}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Available:</span>
                <span className="text-green-600">{book.available}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Currently Borrowed:</span>
                <span className="text-blue-600">{book.quantity - book.available}</span>
              </div>
            </div>
          </div>

          {book.description && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm text-gray-500 mb-2">Description</h4>
                <p className="text-sm text-gray-700">{book.description}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
