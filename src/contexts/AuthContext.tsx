import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { AuthError, AuthTokenResponse, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: AuthError) => {
  switch (error.message) {
    case "Invalid Refresh Token: Refresh Token Not Found":
      return "Your session has expired. Please sign in again.";
    default:
      return error.message;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: getErrorMessage(error),
        });
        navigate("/login");
        return;
      }
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === "SIGNED_IN") {
        setUser(session?.user ?? null);
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        navigate("/login");
      } else if (event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null);
      } else if (event === "USER_UPDATED") {
        setUser(session?.user ?? null);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Sign Out Error",
          description: error.message,
        });
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};