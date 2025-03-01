
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center pt-16 pb-16 px-4">
        <div className="w-full max-w-md">
          <AuthForm type="login" />
        </div>
      </main>
      
      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          CodeDebugAI © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Login;
