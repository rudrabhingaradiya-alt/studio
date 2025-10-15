
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PresenceData {
  status: 'online' | 'offline';
  last_seen: {
    seconds: number;
    nanoseconds: number;
  };
  displayName: string;
  photoURL?: string;
}

export default function CommunityPage() {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const presenceQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'presence'),
      where('status', '==', 'online'),
      orderBy('displayName', 'asc')
    );
  }, [firestore]);

  const { data: onlineUsers, isLoading } = useCollection<PresenceData>(presenceQuery);

  const handleInvite = (userName: string) => {
    toast({
      title: 'Invitation Sent!',
      description: `Your invitation to play has been sent to ${userName}.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Community
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          See who is online and challenge them to a match.
        </p>
      </div>

      <Card className="mt-12 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Online Players</CardTitle>
          <CardDescription>
            {isLoading ? 'Loading...' : `${onlineUsers?.length || 0} players currently online.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {onlineUsers && onlineUsers.length > 0 ? (
                  onlineUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.photoURL} alt={user.displayName} />
                          <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user.displayName}</p>
                          <Badge variant="secondary" className="bg-green-500 text-white">Online</Badge>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleInvite(user.displayName)}>
                        <Swords className="mr-2 h-4 w-4" />
                        Invite to Play
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No other players are online right now.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
