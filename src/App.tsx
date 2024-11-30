import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultSection from './components/ResultSection';
import DailySection from './components/DailySection';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import { generateCartoonStory, generateCartoonImage, generateTitle } from './lib/openai';
import { initSupabase, saveGenerationToSupabase } from './lib/supabase';
import { Toast } from './components/Toast';
import { supabase } from './lib/supabase';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [storyPrompt, setStoryPrompt] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [generatingPhase, setGeneratingPhase] = useState<'story' | 'image' | 'title' | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [error, setError] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    initSupabase().catch(error => {
      console.error('Failed to initialize Supabase:', error);
      setError({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to connect to database',
      });
    });
  }, []);

  const handleSubmit = async (input: string) => {
    if (!input.trim()) {
      setError({
        open: true,
        message: 'Please enter some text or a URL to generate a cartoon.',
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    try {
      setCurrentInput(input);
      setError({ open: false, message: '' });
      await generateCartoon(input);
    } catch (error) {
      console.error('Generation error:', error);
      setError({
        open: true,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      setIsLoading(false);
      setGeneratingPhase(null);
    }
  };

  const generateCartoon = async (input: string) => {
    setIsLoading(true);
    setImageUrl(null);
    setStoryPrompt(null);
    setCurrentTitle('');
    setGeneratingPhase('story');
    
    try {
      const { originalPrompt, processedPrompt } = await generateCartoonStory(input);
      setStoryPrompt(originalPrompt);
      
      setGeneratingPhase('image');
      const imageUrl = await generateCartoonImage(processedPrompt);
      setImageUrl(imageUrl);
      
      setGeneratingPhase('title');
      const title = await generateTitle(input);
      setCurrentTitle(title);
      
      await saveGenerationToSupabase({
        input_text: input,
        story_prompt: originalPrompt,
        image_url: imageUrl,
        title
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
      setGeneratingPhase(null);
    }
  };

  const handleRegenerate = async () => {
    if (storyPrompt && currentInput) {
      await generateCartoon(currentInput);
    }
  };

  const handleRegenerateTitle = async () => {
    if (!currentInput) return;
    
    try {
      setGeneratingPhase('title');
      const newTitle = await generateTitle(currentInput);
      setCurrentTitle(newTitle);
      
      if (imageUrl && storyPrompt) {
        await saveGenerationToSupabase({
          input_text: currentInput,
          story_prompt: storyPrompt,
          image_url: imageUrl,
          title: newTitle
        });
      }
    } catch (error) {
      console.error('Title regeneration error:', error);
      setError({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to regenerate title',
      });
    } finally {
      setGeneratingPhase(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-6xl flex justify-end mb-4">
        <UserMenu />
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <img src="/logo.svg" alt="News2oon AI Logo" className="h-16" />
      </div>
      <p className="text-gray-600 mb-8">Turn News to an Editorial Cartoon Instantly</p>
      
      <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
      
      <div className="mt-8 w-full flex justify-center">
        <ResultSection 
          imageUrl={imageUrl} 
          title={currentTitle}
          isLoading={isLoading}
          onRegenerate={handleRegenerate}
          onRegenerateTitle={handleRegenerateTitle}
          generatingPhase={generatingPhase}
        />
      </div>

      <DailySection />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <Toast
        open={error.open}
        setOpen={(open) => setError({ ...error, open })}
        title="Error"
        description={error.message}
        type="error"
      />
    </div>
  );
}