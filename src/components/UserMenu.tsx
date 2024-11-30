import { useEffect, useState } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function UserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="outline-none">
          <Avatar.Root className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors">
            <Avatar.Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name}
              className="w-full h-full rounded-full object-cover"
            />
            <Avatar.Fallback className="flex items-center justify-center w-full h-full bg-indigo-100 text-indigo-600">
              <User className="w-5 h-5" />
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[200px] bg-white rounded-lg shadow-lg p-2 mt-2">
          <DropdownMenu.Item className="text-sm text-gray-500 p-2">
            {user.user_metadata.full_name}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
          <DropdownMenu.Item
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-red-600 p-2 outline-none cursor-pointer hover:bg-red-50 rounded-md"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}