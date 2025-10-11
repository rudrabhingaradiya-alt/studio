
'use client';

import Link from 'next/link';
import { Menu, User, TrendingUp } from 'lucide-react';

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
  { href: '/profile', label: 'History' },
];

const UserDropdown = () => {
  const { isLoggedIn, login, logout } = useAuth();

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
              {isLoggedIn ? 'Player One' : 'Guest'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {isLoggedIn
                ? 'player.one@chessarena.com'
                : 'guest@chessarena.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoggedIn ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={login}>Log in</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header = () => {
  const { isLoggedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Chess Arena</span>
          </Link>
          {isLoggedIn && (
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
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex w-full items-center justify-between md:hidden">
           <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <SheetClose asChild>
                  <Link href="/" className="flex items-center space-x-2">
                    <Logo className="h-6 w-6" />
                    <span className="font-bold">Chess Arena</span>
                  </Link>
                </SheetClose>
                <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                  {isLoggedIn && (
                    <div className="flex flex-col space-y-3">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link href={link.href} className="text-foreground">
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="font-bold">Chess Arena</span>
          </Link>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                1200
              </div>
            )}
            <UserDropdown />
          </div>
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
