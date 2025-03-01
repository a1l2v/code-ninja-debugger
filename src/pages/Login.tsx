
import React from 'react';
import Navbar from '../components/Navbar';
import AuthForm from '../components/AuthForm';

const Login: React.FC = () => {
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
