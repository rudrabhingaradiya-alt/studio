
'use client';

import Link from 'next/link';
import { Menu, User, TrendingUp, LogOut, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import Logo from '@/components/icons/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';

const navLinks = [
  { href: '/play', label: 'Play' },
  { href: '/puzzles', label: 'Puzzles' },
  { href: '/puzzle-rush', label: 'Puzzle Rush' },
];

const UserDropdown = () => {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {isLoggedIn ? (user ? user.displayName || 'User' : 'Guest') : 'Guest'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {isLoggedIn ? (user ? user.email : 'guest@chessarena.com') : 'guest@chessarena.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoggedIn && user ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
                <Link href="/login">Log In</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href="/signup">Sign Up</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Chess Arena</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navigation */}
        <div className="flex w-full items-center justify-between md:hidden">
           <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Chess Arena</span>
          </Link>
           <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0 flex flex-col">
                <SheetClose asChild>
                  <Link href="/" className="flex items-center space-x-2">
                    <Logo className="h-6 w-6" />
                    <span className="font-bold">Chess Arena</span>
                  </Link>
                </SheetClose>
                <div className="my-4 flex-grow pb-10 pl-6">
                    <div className="flex flex-col space-y-3">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link href={link.href} className="text-foreground">
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                </div>
                 {isLoggedIn && user && (
                    <div className="border-t pl-6 py-4">
                        <SheetClose asChild>
                            <Button variant="ghost" /*onClick={logout}*/ className="w-full justify-start">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                        </SheetClose>
                    </div>
                 )}
              </SheetContent>
            </Sheet>
        </div>

        {/* Desktop User Menu */}
        <div className="hidden flex-1 items-center justify-end space-x-4 md:flex">
          {isLoggedIn && (
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Rating: 1200
            </div>
          )}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;
