import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Sliders,
  Send,
  Layers,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

interface ImageCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (imageMarkdown: string) => void;
}

interface ImageHistoryItem {
  id: string;
  prompt: string;
  url: string;
  aspectRatio: string;
  style: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  {
    label: '🐯 Bengal Tiger',
    prompt: 'A majestic Royal Bengal Tiger sitting in a glowing neon mysterious rain forest, 8k resolution, cinematic photorealistic lighting, highly detailed',
    style: 'Cinematic 8K'
  },
  {
    label: '🌌 Dhaka 2080',
    prompt: 'Futuristic Dhaka City in year 2080 with flying cars, neon glass skyscrapers, river reflection, cyberpunk anime digital art style',
    style: 'Cyberpunk 3D'
  },
  {
    label: '🧙‍♂️ Anime Cat Wizard',
    prompt: 'An adorable cute cat wizard wearing glowing magical robes and holding a starry magic staff, vibrant studio Ghibli anime style',
    style: 'Anime & Manga'
  },
  {
    label: '🚀 Deep Space Nebulae',
    prompt: 'A mesmerizing deep space galaxy nebula with swirling golden stars, glowing cosmic dust, 3D hyper-detailed ultra HD render',
    style: 'Digital Art'
  },
  {
    label: '🎨 Village Sunset',
    prompt: 'A peaceful traditional Bangladeshi rural village landscape at golden hour sunset, reflections on calm river water, impressionist oil painting',
    style: 'Oil Painting'
  },
  {
    label: '🐉 Cloud Dragon',
    prompt: 'An epic mythical oriental dragon flying through sunset thunderstorm clouds, glowing lightning eyes, hyper-detailed fantasy illustration',
    style: 'Fantasy Art'
  }
];

const ASPECT_RATIOS = [
  { label: '1:1 Square', width: 1024, height: 1024, icon: '⬛' },
  { label: '16:9 Banner', width: 1280, height: 720, icon: '🖼️' },
  { label: '9:16 Mobile', width: 720, height: 1280, icon: '📱' },
  { label: '4:3 Card', width: 1024, height: 768, icon: '📷' },
  { label: '3:4 Portrait', width: 768, height: 1024, icon: '🖼️' },
];

const ART_STYLES = [
  'Photorealistic',
  'Anime & Manga',
  'Cyberpunk 3D',
  'Cinematic 8K',
  'Digital Art',
  'Oil Painting',
  'Fantasy Art',
  'Pixel Art'
];

export const ImageCreatorModal: React.FC<ImageCreatorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, extra limbs, bad anatomy');
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedStyle, setSelectedStyle] = useState(ART_STYLES[0]);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 999999));
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingText, setLoadingText] = useState('Connecting to AI Engine...');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleSurpriseMe = () => {
    const randomPreset = PRESET_PROMPTS[Math.floor(Math.random() * PRESET_PROMPTS.length)];
    setPrompt(randomPreset.prompt);
    setSelectedStyle(randomPreset.style);
    setSeed(Math.floor(Math.random() * 999999));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setLoadingText('Formulating AI Visual Prompts...');

    setTimeout(() => setLoadingText('Generating high-resolution details...'), 800);
    setTimeout(() => setLoadingText('Applying lighting & textures...'), 1600);

    const currentSeed = seed || Math.floor(Math.random() * 999999);
    const fullPromptText = `${prompt}, ${selectedStyle} style, high detail, 8k quality`;
    const encoded = encodeURIComponent(fullPromptText);
    const encodedNeg = encodeURIComponent(negativePrompt);

    const finalUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${selectedRatio.width}&height=${selectedRatio.height}&seed=${currentSeed}&nologo=true&negative=${encodedNeg}`;

    setTimeout(() => {
      setGeneratedImageUrl(finalUrl);
      setIsGenerating(false);

      // Add to session history
      const newItem: ImageHistoryItem = {
        id: Date.now().toString(),
        prompt: prompt.trim(),
        url: finalUrl,
        aspectRatio: selectedRatio.label,
        style: selectedStyle,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setHistory(prev => [newItem, ...prev.slice(0, 15)]);
    }, 2400);
  };

  const handleCopyUrl = () => {
    if (!generatedImageUrl) return;
    navigator.clipboard.writeText(generatedImageUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    if (!generatedImageUrl) return;
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `S-AI_Image_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(generatedImageUrl, '_blank');
    }
  };

  const handleSendImageToChat = () => {
    if (!generatedImageUrl || !onSendToChat) return;
    const markdown = `🖼️ **AI Generated Image**\n\n**Prompt:** "${prompt}"\n\n![${prompt}](${generatedImageUrl})\n\n[📥 Download HD Image](${generatedImageUrl})`;
    onSendToChat(markdown);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] bg-stone-950 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-900/80">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>Prompt to Image Creator Studio</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-semibold border border-purple-500/30">
                  HD Pollinations AI Engine
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                প্রমট লিখে পছন্দমত এইচডি ডিজিটাল ছবি, আর্ট ও ইলাস্ট্রেশন তৈরি করুন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            id="btn-close-image-creator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Prompt Input & Controls */}
          <div className="md:col-span-5 p-4 border-r border-stone-800 flex flex-col space-y-4 overflow-y-auto bg-stone-900/30">
            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-300 flex items-center space-x-1.5">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span>প্রমট বিবরণ (Image Prompt):</span>
                </label>
                <button
                  onClick={handleSurpriseMe}
                  className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center space-x-1 transition-colors"
                  id="btn-surprise-me"
                >
                  <Zap className="w-3 h-3" />
                  <span>Surprise Me</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="যেমন: A majestic Royal Bengal Tiger in a glowing neon rain forest, 8k..."
                rows={3}
                className="w-full bg-stone-900 border border-stone-700 text-xs rounded-xl p-3 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-purple-500 resize-none"
                id="input-image-prompt"
              />
            </div>

            {/* Presets Row */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                জনপ্রিয় প্রমট আইডিয়া (Presets):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PROMPTS.map((ps, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(ps.prompt);
                      setSelectedStyle(ps.style);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-purple-950 hover:border-purple-500/50 border border-stone-700 text-stone-300 hover:text-purple-300 transition-all"
                    id={`btn-preset-prompt-${idx}`}
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                সাইজ / অ্যাসপেক্ট রেশিও (Aspect Ratio):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar.label}
                    onClick={() => setSelectedRatio(ar)}
                    className={`flex items-center space-x-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                      selectedRatio.label === ar.label
                        ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                    }`}
                    id={`btn-ratio-${ar.label.replace(/[^a-zA-Z0-9]/g, '')}`}
                  >
                    <span>{ar.icon}</span>
                    <span className="truncate">{ar.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                আর্ট স্টাইল (Art Style):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {ART_STYLES.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStyle(st)}
                    className={`py-1.5 px-2.5 rounded-xl border text-xs text-center transition-all ${
                      selectedStyle === st
                        ? 'bg-purple-900/40 border-purple-500 text-white font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                    }`}
                    id={`btn-style-${st.replace(/[^a-zA-Z0-9]/g, '')}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Advanced Controls */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-stone-400 hover:text-stone-200 flex items-center space-x-1 py-1"
                id="btn-toggle-advanced-image"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>{showAdvanced ? 'এডভান্সড সেটিংস লুকান' : 'এডভান্সড সেটিংস (Negative Prompt & Seed)'}</span>
              </button>

              {showAdvanced && (
                <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 space-y-3 mt-2 text-xs">
                  <div>
                    <label className="text-stone-400 font-medium block mb-1">
                      Negative Prompt (যা ছবিটিতে থাকবে না):
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-stone-400 font-medium block mb-1">
                      Random Seed Number:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                        className="flex-1 bg-stone-950 border border-stone-800 rounded-lg p-2 text-stone-200 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => setSeed(Math.floor(Math.random() * 999999))}
                        className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-semibold"
                      >
                        Random
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <div className="pt-2 mt-auto">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                id="btn-generate-image-main"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-200" />
                ) : (
                  <Sparkles className="w-5 h-5 fill-current" />
                )}
                <span>{isGenerating ? loadingText : 'ছবি তৈরি করুন (Generate Image)'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Generated Image View & Gallery */}
          <div className="md:col-span-7 p-4 flex flex-col bg-stone-950 justify-between overflow-y-auto">
            {/* Display Stage */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-[380px] p-4 bg-stone-900/40 rounded-2xl border border-stone-800 relative overflow-hidden">
              {isGenerating ? (
                <div className="flex flex-col items-center space-y-4 text-center p-6">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                    <Wand2 className="w-6 h-6 text-purple-400 absolute" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-200 text-sm">{loadingText}</h4>
                    <p className="text-xs text-stone-500 mt-1">AI রেন্ডারিং সম্পন্ন হতে ৩-৪ সেকেন্ড সময় লাগছে...</p>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                  <div className="relative group max-h-[420px] rounded-xl overflow-hidden shadow-2xl border border-stone-700">
                    <img
                      src={generatedImageUrl}
                      alt={prompt}
                      referrerPolicy="no-referrer"
                      className="max-h-[420px] w-auto object-contain rounded-xl"
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2">
                    <button
                      onClick={handleDownloadImage}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                      id="btn-download-hd-image"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download HD Image</span>
                    </button>

                    <button
                      onClick={handleCopyUrl}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-all"
                      id="btn-copy-image-link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopied ? 'Link Copied' : 'Copy Link'}</span>
                    </button>

                    {onSendToChat && (
                      <button
                        onClick={handleSendImageToChat}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
                        id="btn-send-image-chat"
                      >
                        <Send className="w-4 h-4" />
                        <span>চ্যাটে যুক্ত করুন (Send to Chat)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-500 p-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 flex items-center justify-center border border-stone-800 text-purple-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-300 text-sm">কোনো ছবি তৈরি করা হয়নি</h4>
                    <p className="text-xs text-stone-500 max-w-xs mt-1">
                      বামে প্রমট লিখুন অথবা Preset সিলেক্ট করে "ছবি তৈরি করুন" বাটনে চাপ দিন
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery History Bar */}
            {history.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-400 flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>গ্যালারি ইতিহাস (Session History):</span>
                  </span>
                  <span className="text-[10px] text-stone-500">{history.length} items</span>
                </div>

                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setGeneratedImageUrl(item.url);
                        setPrompt(item.prompt);
                      }}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        generatedImageUrl === item.url ? 'border-purple-500 scale-105' : 'border-stone-800 opacity-70 hover:opacity-100'
                      }`}
                      id={`gallery-item-${item.id}`}
                    >
                      <img src={item.url} alt={item.prompt} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
