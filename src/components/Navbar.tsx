import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, LogOut, LogIn, UserPlus, Menu, Dice1 as Dice } from 'lucide-react';
import AnimatedNumber from '../AnimatedNumber';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-gradient-to-r from-casino-red to-casino-purple shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Dice className="w-8 h-8 text-casino-gold mx-auto mb-6 animate-spin-slow" />
            <span className="text-2xl font-bold text-white">LuxmeBet</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/games" className="text-white hover:text-casino-gold transition-colors">Games</Link>
            <Link to="/markets" className="text-white hover:text-casino-gold transition-colors">Markets</Link>
            <Link to="/how-to-play" className="text-white hover:text-casino-gold transition-colors">How to Play</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-casino-gold transition-colors">Dashboard</Link>
                <Link to="/add-funds" className="flex items-center text-casino-gold hover:text-yellow-400 transition-colors">
                  <Wallet className="w-4 h-4 mr-1" />
                  Add Funds
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center text-white hover:text-casino-gold transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center text-white hover:text-casino-gold transition-colors">
                  <LogIn className="w-4 h-4 mr-1" />
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center px-4 py-2 rounded bg-casino-gold text-casino-black hover:bg-yellow-400 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/games" className="block py-2 text-white hover:text-casino-gold">Games</Link>
            <Link to="/markets" className="block py-2 text-white hover:text-casino-gold">Markets</Link>
            <Link to="/how-to-play" className="block py-2 text-white hover:text-casino-gold">How to Play</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-white hover:text-casino-gold">Dashboard</Link>
                <Link to="/add-funds" className="block py-2 text-white hover:text-casino-gold">Add Funds</Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-2 text-white hover:text-casino-gold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-white hover:text-casino-gold">Login</Link>
                <Link to="/register" className="block py-2 text-white hover:text-casino-gold">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;