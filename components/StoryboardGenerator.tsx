import React, { useState, useCallback } from 'react';
import { Scene } from '../types';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';

const StoryboardGenerator: React.FC = () => {
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateStoryboard = useCallback(async () => {
    if (!script.trim()) {
      setError("Script cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setScenes([]);

    try {
      const parsedScenesData = await geminiService.parseScript(script);
      const scenesWithIds = parsedScenesData.map((s, index) => ({
        ...s,
        id: index,
        isLoading: false,
        error: undefined,
        image: undefined,
      }));
      setScenes(scenesWithIds);
      
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      for (let i = 0; i < scenesWithIds.length; i++) {
        setScenes(prev => prev.map(s => s.id === i ? { ...s, isLoading: true } : s));
        try {
          const imageUrl = await geminiService.generateImage(scenesWithIds[i].description);
          setScenes(prev => prev.map(s => s.id === i ? { ...s, image: imageUrl, isLoading: false } : s));
        } catch (imageError) {
            const errorMessage = imageError instanceof Error ? imageError.message : "Unknown error";
            setScenes(prev => prev.map(s => s.id === i ? { ...s, error: errorMessage, isLoading: false } : s));
        }

        // Add a delay before the next iteration, but not after the last one, to avoid rate-limiting.
        if (i < scenesWithIds.length - 1) {
            await sleep(5000); // 5-second delay
        }
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [script]);

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="bg-base-200 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-white">Enter Your Script</h2>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="e.g., INT. COFFEE SHOP - DAY. JANE sits at a table, looking anxious. The door opens."
          className="w-full h-48 p-4 bg-base-300 border border-base-100 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow text-content-100"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateStoryboard}
          disabled={isLoading}
          className="mt-4 w-full sm:w-auto px-6 py-3 bg-brand-primary text-white font-semibold rounded-md hover:bg-indigo-500 disabled:bg-base-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? <Spinner /> : null}
          {isLoading ? 'Generating...' : 'Generate Storyboard'}
        </button>
        {error && <p className="mt-4 text-red-400">{error}</p>}
      </div>

      {(isLoading && scenes.length === 0) && (
        <div className="text-center p-8">
            <p className="text-lg">Parsing script and preparing scenes...</p>
        </div>
      )}

      {scenes.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-white text-center">Your Storyboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenes.map((scene) => (
              <div key={scene.id} className="bg-base-200 rounded-lg shadow-lg overflow-hidden animate-fade-in flex flex-col">
                <div className="aspect-video bg-base-300 flex items-center justify-center">
                  {scene.isLoading && (
                    <div className="flex flex-col items-center gap-2 text-content-200">
                        <Spinner />
                        <span>Generating image...</span>
                    </div>
                  )}
                  {scene.error && <p className="text-red-400 p-4 text-center">{scene.error}</p>}
                  {scene.image && <img src={scene.image} alt={scene.description} className="w-full h-full object-cover" />}
                </div>
                <div className="p-4 flex-grow">
                  <p className="text-content-100 text-sm">{scene.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryboardGenerator;