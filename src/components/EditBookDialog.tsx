import { useState, useEffect } from 'react';
import { Book } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { bookCategories } from '../lib/mockData';

interface EditBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book;
  onSave: (updates: Partial<Book>) => void;
}

export function EditBookDialog({ open, onOpenChange, book, onSave }: EditBookDialogProps) {
  const [formData, setFormData] = useState({
    title: book.title,
    author: book.author,
    category: book.category,
    isbn: book.isbn,
    quantity: book.quantity,
    publisher: book.publisher,
    year: book.year,
    description: book.description || ''
  });

  useEffect(() => {
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      quantity: book.quantity,
      publisher: book.publisher,
      year: book.year,
      description: book.description || ''
    });
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate new available count
    const borrowedCount = book.quantity - book.available;
    const newAvailable = Math.max(0, formData.quantity - borrowedCount);
    
    onSave({
      ...formData,
      available: newAvailable
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>Update the book information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-author">Author *</Label>
                <Input
                  id="edit-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-isbn">ISBN *</Label>
                <Input
                  id="edit-isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-publisher">Publisher *</Label>
                <Input
                  id="edit-publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-year">Published Year *</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Total Quantity *</Label>
              <Input
                id="edit-quantity"
                type="number"
                min={book.quantity - book.available}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
              <p className="text-xs text-gray-500">
                Currently borrowed: {book.quantity - book.available}. Minimum quantity: {book.quantity - book.available}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
