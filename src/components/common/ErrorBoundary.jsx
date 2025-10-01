import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              Oups, une erreur est survenue !
            </CardTitle>
            <CardDescription>
              Ce composant a rencontré un problème. Le reste de l'application continue de fonctionner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vous pouvez essayer de rafraîchir la page ou contacter le support si le problème persiste.
            </p>
            <details className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <summary>Détails de l'erreur (pour le support technique)</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all">
                    {this.state.error?.toString()}
                </pre>
            </details>
            <Button onClick={() => window.location.reload()}>
              Rafraîchir la page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;