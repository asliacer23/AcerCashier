import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="container mx-auto p-6 max-w-2xl min-h-[60vh] flex items-center justify-center">
      <Card className="pos-card w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-4xl font-bold mb-2">404</CardTitle>
          <h2 className="text-xl text-muted-foreground">Page Not Found</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-muted-foreground">
            Requested path: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </p>
          <Button asChild className="pos-button">
            <a href="/">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
