import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Sparkles, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NFTMintPage = () => {
  const { address, isConnected } = useAccount();
  const [selectedChain, setSelectedChain] = useState(1);
  
  // Form State
  const [collectionName, setCollectionName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [style, setStyle] = useState('minimal');
  const [colorMood, setColorMood] = useState('neon');
  const [background, setBackground] = useState('dark');
  const [uniqueTwist, setUniqueTwist] = useState('');
  
  // Generation State
  const [currentStep, setCurrentStep] = useState('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const stylePresets = [
    { value: 'minimal', label: 'Minimal 3D', icon: '🎨' },
    { value: 'anime', label: 'Anime', icon: '🎌' },
    { value: 'pixel', label: 'Pixel Art', icon: '👾' },
    { value: 'photoreal', label: 'Photo-Real', icon: '📸' },
    { value: 'cyberpunk', label: 'Cyberpunk', icon: '🌃' }
  ];

  const generatePreview = async () => {
    if (!prompt) {
      toast.error('Please enter a description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/nft/generate-preview`, {
        prompt,
        style,
        colorMood,
        background,
        uniqueTwist,
        count: 12
      });
      setPreviewImages(response.data.images);
      setCurrentStep('preview');
      toast.success('Preview generated!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate preview');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950">
      <Navbar selectedChain={selectedChain} onChainChange={setSelectedChain} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-brand-purple text-white rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">AI NFT Generator</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
            Create Unique NFT Collections
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Turn your ideas into NFTs with AI. Non-custodial, stored on IPFS.
          </p>
        </div>

        {currentStep === 'input' && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Describe Your Collection</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Collection Name</label>
                <Input
                  placeholder="e.g., Cyber Cats"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Describe your collection</label>
                <textarea
                  placeholder="e.g., Futuristic cats with neon accessories in a cyberpunk city"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Style</label>
                <div className="grid grid-cols-5 gap-3">
                  {stylePresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => setStyle(preset.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        style === preset.value
                          ? 'border-brand-blue bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="text-3xl mb-2">{preset.icon}</div>
                      <div className="text-xs font-medium dark:text-white">{preset.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Color Mood</label>
                  <select
                    value={colorMood}
                    onChange={(e) => setColorMood(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="neon">Neon</option>
                    <option value="pastel">Pastel</option>
                    <option value="monochrome">Monochrome</option>
                    <option value="warm">Warm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">Background</label>
                  <select
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="gradient">Gradient</option>
                    <option value="transparent">Transparent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Unique Twist (Optional)</label>
                <Input
                  placeholder="e.g., glowing eyes, geometric patterns"
                  value={uniqueTwist}
                  onChange={(e) => setUniqueTwist(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Collection Size</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="10"
                  max="10000"
                />
              </div>

              <Button
                onClick={generatePreview}
                disabled={isGenerating || !prompt}
                className="w-full bg-gradient-to-r from-brand-blue to-brand-purple hover:from-blue-700 hover:to-purple-700 py-6 text-lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Free Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-lg mb-6">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Preview Your Collection</h2>
              <div className="grid grid-cols-4 gap-4 mb-8">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.url}
                      alt={`Preview ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => setCurrentStep('input')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={() => toast.info('Full generation coming soon!')}
                  className="flex-1 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-blue-700 hover:to-purple-700"
                >
                  Generate {quantity} NFTs
                </Button>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Non-Custodial:</strong> You sign all transactions. We never hold your keys.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTMintPage;
