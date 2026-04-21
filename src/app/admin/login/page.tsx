'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

const formSchema = z.object({
  email: z.string().email({ message: 'Harap masukkan alamat email yang valid.' }),
  password: z.string().min(6, { message: 'Password harus memiliki setidaknya 6 karakter.' }),
});

function getLoginErrorMessage(error: unknown): string {
  const code =
    error instanceof FirebaseError
      ? error.code
      : typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code)
        : undefined;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau password salah.';
    case 'auth/invalid-email':
      return 'Format email tidak valid.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
    case 'auth/network-request-failed':
      return 'Koneksi bermasalah. Coba cek internet Anda.';
    default:
      return 'Gagal login. Periksa kembali email dan password Anda.';
  }
}

export default function AdminLoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace('/admin');
    }
  }, [user, isUserLoading, router]);

	  async function onSubmit(values: z.infer<typeof formSchema>) {
	    setIsSubmitting(true);
	    try {
	      await signInWithEmailAndPassword(auth, values.email, values.password);
	      toast({
	        title: 'Login Berhasil',
	        description: 'Anda akan diarahkan ke dasbor admin.',
	      });
	      router.push('/admin');
	    } catch (error: unknown) {
	      toast({
	        variant: 'destructive',
	        title: 'Login Gagal',
	        description: getLoginErrorMessage(error),
	      });
	    } finally {
	      setIsSubmitting(false);
	    }
	  }

  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses panel admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Login
              </Button>
            </form>
          </Form>
	          <p className="mt-4 text-center text-xs text-muted-foreground">
	            Gunakan email dan password akun admin Anda.
	          </p>
	        </CardContent>
	      </Card>
	    </div>
	  );
}
