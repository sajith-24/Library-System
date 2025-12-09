import { useState } from 'react';
import { bookAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { bookCategories } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';
import { BookPlus } from 'lucide-react';

export function AddBookView() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    quantity: 1,
    publisher: '',
    year: new Date().getFullYear(),
    description: '',
    coverUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await bookAPI.create(formData);
      
      toast.success('Book added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        author: '',
        category: '',
        isbn: '',
        quantity: 1,
        publisher: '',
        year: new Date().getFullYear(),
        description: '',
        coverUrl: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      author: '',
      category: '',
      isbn: '',
      quantity: 1,
      publisher: '',
      year: new Date().getFullYear(),
      description: '',
      coverUrl: ''
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Add New Book</h2>
        <p className="text-gray-600">Add a new book to the library catalog</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <BookPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Book Information</CardTitle>
              <CardDescription>Fill in the details of the new book</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="isbn">ISBN *</Label>
                <Input
                  id="isbn"
                  placeholder="978-0-XXX-XXXXX-X"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher *</Label>
                <Input
                  id="publisher"
                  placeholder="Enter publisher name"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Published Year *</Label>
                <Input
                  id="year"
                  type="number"
                  min="0"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a brief description of the book"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                <BookPlus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-3xl bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="shrink-0">
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <BookPlus className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-blue-900">Tips for Adding Books</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure the ISBN is unique and follows the standard format</li>
                <li>• Set the initial quantity to the total number of copies available</li>
                <li>• Choose the most appropriate category for easy searching</li>
                <li>• Add a description to help users understand what the book is about</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}