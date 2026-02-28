import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { dark, setDark } = useTheme();

  const toggle = () => setDark(!dark);

  return (
    <Button variant='ghost' size='icon' onClick={toggle}>
      {dark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
    </Button>
  );
}

