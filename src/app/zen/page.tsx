import { redirect } from 'next/navigation';

export default function ZenPage() {
  redirect('/');
  
  // This will never be rendered
  return null;
} 