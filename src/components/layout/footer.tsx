'use client';

import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {currentYear || new Date().getFullYear()} Chess Arena. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
