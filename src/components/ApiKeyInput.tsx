import { useState } from 'react';
import { Key, AlertCircle, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ApiKeyInputProps {
  onApiKeySubmit: (googleMapsApiKey: string, geminiApiKey: string) => void;
}

const ApiKeyInput = ({ onApiKeySubmit }: ApiKeyInputProps) => {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleMapsApiKey.trim() && geminiApiKey.trim()) {
      setIsSubmitting(true);
      onApiKeySubmit(googleMapsApiKey.trim(), geminiApiKey.trim());
      // Store in localStorage for future sessions
      localStorage.setItem('googleMapsApiKey', googleMapsApiKey.trim());
      localStorage.setItem('geminiApiKey', geminiApiKey.trim());
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-floating">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
            <Key className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl">API Keys Required</CardTitle>
          <CardDescription className="text-center">
            Enter your Google Maps and Gemini API keys to access the AI-powered map dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  <strong>Security Note:</strong> Your API key will be stored locally in your browser and not sent to any servers.
                </p>
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    Get your Google Maps API key from{' '}
                    <a 
                      href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Cloud Console
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    Get your Gemini API key from{' '}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Google Maps API Key</label>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your Google Maps API key"
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Gemini API Key</label>
                </div>
                <Input
                  type="password"
                  placeholder="Enter your Gemini API key"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="font-mono text-sm"
                  required
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!googleMapsApiKey.trim() || !geminiApiKey.trim() || isSubmitting}
            >
              {isSubmitting ? 'Loading Dashboard...' : 'Continue to AI-Powered Dashboard'}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Check out our{' '}
              <a 
                href="https://docs.lovable.dev/integrations/supabase/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Supabase integration docs
              </a>{' '}
              for secure API key management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyInput;