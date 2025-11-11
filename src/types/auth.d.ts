declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'teacher' | 'student' | 'admin';
      classIds?: string[];
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: 'teacher' | 'student' | 'admin';
    classIds?: string[];
  }
}