import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image as ImageIcon, X, Square, Sparkles, Globe, FlaskConical, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, imageUrl?: string, isWebSearch?: boolean, isDeepResearch?: boolean) => void;
  isStreaming: boolean;
  onStopGeneration: () => void;
  selectedModel: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopGeneration,
  selectedModel,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      const initialText = inputText;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(initialText ? `${initialText} ${transcript}` : transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage) return;
    if (isStreaming) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(inputText.trim(), attachedImage || undefined, isWebSearchEnabled, isDeepResearchEnabled);
    setInputText('');
    setAttachedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 w-full px-3 py-2 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-3xl mx-auto">
        {/* Attachment preview if image added */}
        {attachedImage && (
          <div className="relative inline-block mb-2 group">
            <img
              src={attachedImage}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-xl border border-stone-300 dark:border-stone-700 shadow-xs"
            />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-500 transition-colors"
              title="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Mode Indicators */}
        {(isWebSearchEnabled || isDeepResearchEnabled || isListening) && (
          <div className="flex flex-wrap items-center gap-2 mb-1.5 px-1 text-xs">
            {isListening && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-medium animate-pulse">
                <Mic className="w-3 h-3 text-rose-500" />
                <span>Listening... Speak your prompt</span>
              </span>
            )}
            {isWebSearchEnabled && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-medium">
                <Globe className="w-3 h-3" />
                <span>Web Search Active</span>
              </span>
            )}
            {isDeepResearchEnabled && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-medium">
                <FlaskConical className="w-3 h-3" />
                <span>Deep Research Pipeline Active</span>
              </span>
            )}
          </div>
        )}

        {/* Input Wrapper Card */}
        <div className="relative flex flex-col p-2 bg-white dark:bg-stone-800/90 rounded-2xl border border-stone-300 dark:border-stone-700 shadow-md focus-within:border-emerald-500 dark:focus-within:border-emerald-500 transition-all">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening... Speak now..."
                : isDeepResearchEnabled
                ? "Enter deep research topic..."
                : "Message ChatGPT..."
            }
            rows={1}
            className="w-full px-2 py-1 text-sm bg-transparent border-none text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden resize-none max-h-40"
            id="input-chat-message"
          />

          {/* Bottom toolbar inside input box */}
          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-stone-100 dark:border-stone-700/50">
            <div className="flex items-center space-x-1 text-stone-400">
              {/* Image upload trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="file-input-image"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                title="Attach image"
                id="btn-attach-image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Microphone Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 animate-pulse'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200 text-stone-500 dark:text-stone-400'
                }`}
                title={isListening ? "Stop listening" : "Speak to type (Voice input)"}
                id="btn-mic-speech"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-rose-500" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {/* Quick Web Search Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsWebSearchEnabled(!isWebSearchEnabled);
                  if (!isWebSearchEnabled) setIsDeepResearchEnabled(false);
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isWebSearchEnabled
                    ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/40'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400'
                }`}
                title="Toggle real-time web search"
                id="btn-toggle-web-search"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>

              {/* Deep Research Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsDeepResearchEnabled(!isDeepResearchEnabled);
                  if (!isDeepResearchEnabled) setIsWebSearchEnabled(false);
                }}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isDeepResearchEnabled
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40'
                    : 'hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400'
                }`}
                title="Deep Research Mode (Multi-step report)"
                id="btn-toggle-deep-research"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Deep Research</span>
              </button>

              <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-700/60 text-[11px] font-medium text-stone-600 dark:text-stone-300">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span className="truncate max-w-[100px]">{selectedModel}</span>
              </div>
            </div>

            {/* Send / Stop button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                title="Stop generation"
                id="btn-stop-stream"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() && !attachedImage}
                className={`p-2 rounded-xl text-white shadow-xs transition-colors ${
                  inputText.trim() || attachedImage
                    ? isDeepResearchEnabled
                      ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
                      : isWebSearchEnabled
                      ? 'bg-sky-600 hover:bg-sky-500 cursor-pointer'
                      : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                    : 'bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-500 cursor-not-allowed'
                }`}
                title="Send message"
                id="btn-send-message"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-1 text-center text-[11px] text-stone-400">
          ChatGPT can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
};

