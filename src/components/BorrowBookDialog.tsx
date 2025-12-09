import { Book, User } from '../types';
import { getSettings } from '../lib/storage';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

interface BorrowBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  user: User;
  onConfirm: () => void;
}

export function BorrowBookDialog({ open, onOpenChange, book, user, onConfirm }: BorrowBookDialogProps) {
  const settings = getSettings();
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + settings.borrowingPeriodDays);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Borrow Book</DialogTitle>
          <DialogDescription>
            Confirm the details of your book borrowing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="mb-2">Book Details</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span>{book.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Author:</span>
                <span>{book.author}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ISBN:</span>
                <span className="font-mono text-sm">{book.isbn}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2">Borrowing Information</h4>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Borrow Date:</span>
                <span>{borrowDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">Due Date:</span>
                <span>{dueDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Borrowing Period:</span>
                <span>{settings.borrowingPeriodDays} days</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
            <p className="text-yellow-800">
              <strong>Note:</strong> Late returns will incur a fine of ${settings.finePerDay} per day.
              Please return the book by the due date.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm Borrow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
