import { useState } from 'react';
import { User, UserRole } from '../types';
import { authAPI, userAPI } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, LogIn, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(true); // Changed to true to show signup first
  const [isLoading, setIsLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authAPI.login(username, password);
      
      if (user.role !== role) {
        setError(`Invalid credentials for ${role} role`);
        setIsLoading(false);
        return;
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        onLogin(user);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!createForm.username || !createForm.password || !createForm.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await userAPI.create({
        username: createForm.username,
        password: createForm.password,
        email: createForm.email || undefined,
        role: 'Student'
      });

      toast.success('Account created successfully! You can now log in.');
      setShowCreateAccount(false);
      setCreateForm({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Library Management System</CardTitle>
          <CardDescription>
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {showSuccess && (
              <Alert className="bg-green-50 text-green-900 border-green-200">
                <AlertDescription>Login successful! Redirecting...</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={showSuccess}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={showSuccess}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)} disabled={showSuccess}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="mb-1">Demo credentials:</p>
              <p>Admin: username: <span className="font-mono">admin</span>, password: <span className="font-mono">admin123</span></p>
              <p>Student: username: <span className="font-mono">student</span>, password: <span className="font-mono">student123</span></p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={showSuccess}>
              <LogIn className="mr-2 h-4 w-4" />
              {showSuccess ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setShowCreateAccount(true)}
                className="text-blue-600 hover:underline"
              >
                Create student account
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Create Account Dialog */}
      <Dialog open={showCreateAccount} onOpenChange={setShowCreateAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Student Account</DialogTitle>
            <DialogDescription>Register as a new student to borrow books</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAccount}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Username *</Label>
                <Input
                  id="create-username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="your.email@library.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-confirm-password">Confirm Password *</Label>
                <Input
                  id="create-confirm-password"
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
                <p>Student accounts can browse and borrow books from the library catalog.</p>
              </div>
            </div>

            <DialogFooter className="flex gap-2 flex-col">
              <div className="text-sm text-gray-600 text-center mb-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setShowCreateAccount(false)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login here
                </button>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateAccount(false)} className="flex-1">
                  Back to Login
                </Button>
                <Button type="submit" className="flex-1">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}