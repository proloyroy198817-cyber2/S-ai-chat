import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Image as ImageIcon,
  Paperclip,
  X,
  Square,
  Sparkles,
  Globe,
  FlaskConical,
  Mic,
  MicOff,
  FileText,
  FileCode,
  File,
  Video,
  Palette,
  Film,
} from 'lucide-react';
import { AttachedFile } from '../types';

interface ChatInputProps {
  onSendMessage: (
    text: string,
    imageUrl?: string,
    attachedFiles?: AttachedFile[],
    isWebSearch?: boolean,
    isDeepResearch?: boolean
  ) => void;
  isStreaming: boolean;
  onStopGeneration: () => void;
  selectedModel: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopGeneration,
  selectedModel,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);
  const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
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

  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (!attachedImage) {
          setAttachedImage(dataUrl);
        }
        const newAttachedFile: AttachedFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type || 'image/png',
          dataUrl,
        };
        setAttachedFiles((prev) => [...prev, newAttachedFile]);
      };
      reader.readAsDataURL(file);
    } else {
      // Text / Document / Code files
      const isTextLike =
        file.type.startsWith('text/') ||
        file.type.includes('json') ||
        file.type.includes('xml') ||
        file.type.includes('javascript') ||
        file.type.includes('csv') ||
        file.name.match(/\.(txt|md|js|ts|tsx|jsx|py|java|kt|gradle|xml|json|csv|html|css|yaml|yml|log)$/i);

      if (isTextLike) {
        const reader = new FileReader();
        reader.onload = () => {
          const textContent = reader.result as string;
          const newAttachedFile: AttachedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            textContent,
          };
          setAttachedFiles((prev) => [...prev, newAttachedFile]);
        };
        reader.readAsText(file);
      } else {
        // Binary/PDF/other files
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const newAttachedFile: AttachedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl,
          };
          setAttachedFiles((prev) => [...prev, newAttachedFile]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }

    // Reset input value to allow re-selection
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => {
      const remaining = prev.filter((f) => f.id !== id);
      // If we removed the current primary attached image, update attachedImage state
      const remainingImage = remaining.find((f) => f.type.startsWith('image/'));
      setAttachedImage(remainingImage?.dataUrl || null);
      return remaining;
    });
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachedImage && attachedFiles.length === 0) return;
    if (isStreaming) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(
      inputText.trim(),
      attachedImage || undefined,
      attachedFiles.length > 0 ? attachedFiles : undefined,
      isWebSearchEnabled,
      isDeepResearchEnabled
    );

    setInputText('');
    setAttachedImage(null);
    setAttachedFiles([]);
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

  const getFileIcon = (file: AttachedFile) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-emerald-500" />;
    }
    if (
      file.name.match(/\.(js|ts|tsx|jsx|py|java|kt|gradle|xml|json|html|css)$/i) ||
      file.type.includes('javascript') ||
      file.type.includes('json')
    ) {
      return <FileCode className="w-4 h-4 text-sky-500" />;
    }
    if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|csv|log)$/i)) {
      return <FileText className="w-4 h-4 text-amber-500" />;
    }
    return <File className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="sticky bottom-0 z-10 w-full px-3 py-2 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-stone-200 dark:border-stone-800">
      <div className="max-w-3xl mx-auto">
        {/* Attached Files & Image Previews */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-2 p-1 max-h-36 overflow-y-auto">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="relative flex items-center space-x-2 pl-2 pr-7 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xs text-xs font-medium text-stone-700 dark:text-stone-200 group transition-all hover:border-emerald-500"
              >
                {file.dataUrl && file.type.startsWith('image/') ? (
                  <img
                    src={file.dataUrl}
                    alt={file.name}
                    className="w-7 h-7 object-cover rounded-md border border-stone-200 dark:border-stone-700 shrink-0"
                  />
                ) : (
                  <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-700/80 shrink-0">
                    {getFileIcon(file)}
                  </div>
                )}
                <div className="min-w-0 max-w-[130px] sm:max-w-[180px]">
                  <p className="truncate text-xs font-semibold">{file.name}</p>
                  <p className="text-[10px] text-stone-400 leading-none mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-full transition-colors"
                  title="Remove file"
                  id={`remove-file-${file.id}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quick Media Creation Chips & Mode Indicators */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5 px-0.5 text-xs">
          {/* Image Generator Chip */}
          <button
            type="button"
            onClick={() => {
              setInputText((prev) => (prev.trim() ? `${prev} (ছবি আঁকো)` : 'একটি সুন্দর ছবি আঁকো: '));
              textareaRef.current?.focus();
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-medium transition-colors cursor-pointer"
            title="Prompt to draw/generate image"
            id="btn-chip-draw-image"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-500" />
            <span>🎨 ছবি আঁকুন (Image)</span>
          </button>

          {/* Video Generator Chip */}
          <button
            type="button"
            onClick={() => {
              setInputText((prev) => (prev.trim() ? `${prev} (ভিডিও বানাও)` : 'একটি চমৎকার ভিডিও তৈরি করো: '));
              textareaRef.current?.focus();
            }}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-medium transition-colors cursor-pointer"
            title="Prompt to create video animation"
            id="btn-chip-create-video"
          >
            <Film className="w-3.5 h-3.5 text-purple-500" />
            <span>🎬 ভিডিও বানান (Video)</span>
          </button>

          {isListening && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-medium animate-pulse">
              <Mic className="w-3 h-3 text-rose-500" />
              <span>Listening... Speak prompt</span>
            </span>
          )}
          {isWebSearchEnabled && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 font-medium">
              <Globe className="w-3 h-3" />
              <span>Web Search</span>
            </span>
          )}
          {isDeepResearchEnabled && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-medium">
              <FlaskConical className="w-3 h-3" />
              <span>Deep Research</span>
            </span>
          )}
        </div>

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
                : attachedFiles.length > 0
                ? "Add a message about your attached file(s)..."
                : "Message ChatGPT..."
            }
            rows={1}
            className="w-full px-2 py-1 text-sm bg-transparent border-none text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-hidden resize-none max-h-40"
            id="input-chat-message"
          />

          {/* Bottom toolbar inside input box */}
          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-stone-100 dark:border-stone-700/50">
            <div className="flex items-center space-x-1 text-stone-400">
              {/* Any File Attachment Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                id="file-input-general"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200 text-stone-500 dark:text-stone-400 transition-colors flex items-center space-x-1"
                title="Attach file (PDF, TXT, Code, Images, etc.)"
                id="btn-attach-file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Image Upload Input */}
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                multiple
                className="hidden"
                id="file-input-image"
              />
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-200 text-stone-500 dark:text-stone-400 transition-colors"
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
                disabled={!inputText.trim() && !attachedImage && attachedFiles.length === 0}
                className={`p-2 rounded-xl text-white shadow-xs transition-colors ${
                  inputText.trim() || attachedImage || attachedFiles.length > 0
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

