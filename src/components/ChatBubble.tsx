import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Edit3,
  RotateCcw,
  Trash2,
  Bot,
  User,
  AlertCircle,
  ExternalLink,
  Globe,
  Volume2,
  VolumeX,
  Paperclip,
  FileText,
  FileCode,
  File,
  Image as ImageIcon,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChatMessage, AttachedFile } from '../types';
import { CodeBlock } from './CodeBlock';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ChatBubbleProps {
  message: ChatMessage;
  isLastUserMessage?: boolean;
  onEditMessage?: (id: string, newText: string) => void;
  onRegenerate?: () => void;
  onDeleteMessage?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'thumbs_up' | 'thumbs_down' | null) => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isLastUserMessage,
  onEditMessage,
  onRegenerate,
  onDeleteMessage,
  onFeedback,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [feedbackState, setFeedbackState] = useState<'thumbs_up' | 'thumbs_down' | null>(
    message.feedback || null
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

  const toggleFileExpansion = (fileId: string) => {
    setExpandedFiles((prev) => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const getFileIcon = (file: AttachedFile) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-emerald-400" />;
    }
    if (
      file.name.match(/\.(js|ts|tsx|jsx|py|java|kt|gradle|xml|json|html|css)$/i) ||
      file.type.includes('javascript') ||
      file.type.includes('json')
    ) {
      return <FileCode className="w-4 h-4 text-sky-400" />;
    }
    if (file.type.startsWith('text/') || file.name.match(/\.(txt|md|csv|log)$/i)) {
      return <FileText className="w-4 h-4 text-amber-400" />;
    }
    return <File className="w-4 h-4 text-purple-400" />;
  };

  useEffect(() => {
    setFeedbackState(message.feedback || null);
  }, [message.feedback]);

  // Clean up speech synthesis on unmount or message change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const isUser = message.role === 'user';

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();

      // Clean text for speech (replace code blocks with a brief descriptor)
      const speechContent = message.content
        .replace(/```[\s\S]*?```/g, ' Code snippet skipped. ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_~#]/g, '')
        .trim();

      if (!speechContent) return;

      const utterance = new SpeechSynthesisUtterance(speechContent);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleFeedbackToggle = (type: 'thumbs_up' | 'thumbs_down') => {
    const nextFeedback = feedbackState === type ? null : type;
    setFeedbackState(nextFeedback);
    if (onFeedback) {
      onFeedback(message.id, nextFeedback);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && onEditMessage) {
      onEditMessage(message.id, editText.trim());
      setIsEditing(false);
    }
  };

  // Helper parser for markdown code blocks & standard markdown text
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // Split by markdown code fences
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          val: content.substring(lastIndex, match.index),
        });
      }
      parts.push({
        type: 'code',
        language: match[1] || 'kotlin',
        code: match[2].trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        val: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-2 leading-relaxed text-sm">
        {parts.map((p, idx) => {
          if (p.type === 'code') {
            return <CodeBlock key={idx} language={p.language} code={p.code} />;
          }

          // Simple markdown line parsing for bold, lists, and headers
          const lines = p.val.split('\n');
          return (
            <div key={idx} className="space-y-1">
              {lines.map((line, lIdx) => {
                // Check for Markdown Image ![alt](url)
                const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
                if (imgMatch) {
                  const altText = imgMatch[1] || 'AI Generated Image';
                  const imgUrl = imgMatch[2];
                  return (
                    <div key={lIdx} className="my-3 p-2 bg-stone-100 dark:bg-stone-900/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 shadow-xs">
                      <div className="relative group overflow-hidden rounded-xl bg-stone-950">
                        <img
                          src={imgUrl}
                          alt={altText}
                          referrerPolicy="no-referrer"
                          className="w-full h-auto max-h-[450px] object-contain rounded-xl transition-transform duration-300 group-hover:scale-[1.01]"
                          onError={(e) => {
                            // Fallback image on error
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/800/800?seed=generated';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 px-1 text-xs text-stone-600 dark:text-stone-300">
                        <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">🎨 {altText}</span>
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="ai-generated-image.jpg"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ডাউনলোড (Download)</span>
                        </a>
                      </div>
                    </div>
                  );
                }

                // Check for HTML5 Video <video...><source src="url"...> or <video src="url">
                if (line.includes('<video') || line.includes('<source')) {
                  const srcMatch = line.match(/src=["'](.*?)["']/);
                  if (srcMatch) {
                    const videoSrc = srcMatch[1];
                    return (
                      <div key={lIdx} className="my-3 p-2 bg-stone-100 dark:bg-stone-900/80 rounded-2xl border border-stone-200 dark:border-stone-700/80 shadow-xs">
                        <div className="overflow-hidden rounded-xl bg-stone-950">
                          <video
                            controls
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full max-h-[420px] rounded-xl object-contain"
                          >
                            <source src={videoSrc} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-1 text-xs text-stone-600 dark:text-stone-300">
                          <span className="font-medium">🎬 AI Generated Video (1080p HD)</span>
                          <a
                            href={videoSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            download="ai-generated-video.mp4"
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium shadow-xs transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>ডাউনলোড (Download)</span>
                          </a>
                        </div>
                      </div>
                    );
                  }
                }

                if (line.startsWith('### ')) {
                  return (
                    <h3 key={lIdx} className="font-bold text-base mt-2 mb-1 text-stone-900 dark:text-stone-100">
                      {line.replace('### ', '')}
                    </h3>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={lIdx} className="font-bold text-lg mt-3 mb-1 text-stone-900 dark:text-stone-100">
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <div key={lIdx} className="flex items-start space-x-2 pl-2 my-0.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{renderInlineMarkdown(line.substring(2))}</span>
                    </div>
                  );
                }
                if (line.trim() === '') {
                  return <div key={lIdx} className="h-1" />;
                }
                return <p key={lIdx}>{renderInlineMarkdown(line)}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const renderInlineMarkdown = (text: string) => {
    // Bold regex **text**
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-stone-900 dark:text-stone-100">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 text-emerald-600 dark:text-emerald-400 rounded text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className={`group flex flex-col my-3 px-1 transition-all ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-start space-x-2 max-w-[92%] sm:max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 shadow-xs ${
            isUser
              ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Bubble Content */}
        <div
          className={`relative p-3.5 rounded-2xl shadow-xs transition-colors ${
            isUser
              ? 'bg-stone-800 dark:bg-stone-700 text-stone-100 rounded-tr-xs'
              : 'bg-white dark:bg-stone-800/90 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/60 rounded-tl-xs'
          }`}
        >
          {/* Image preview if user sent single image directly */}
          {message.imageUrl && (!message.attachedFiles || message.attachedFiles.length === 0) && (
            <div className="mb-2.5 overflow-hidden rounded-xl max-w-xs border border-stone-300 dark:border-stone-600">
              <img src={message.imageUrl} alt="Attachment" className="w-full h-auto object-cover max-h-60" />
            </div>
          )}

          {/* Render Attached Files Cards */}
          {message.attachedFiles && message.attachedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold opacity-80 mb-1">
                <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                <span>Attached Files ({message.attachedFiles.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {message.attachedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isUser
                        ? 'bg-stone-900/60 border-stone-700/80 text-stone-100'
                        : 'bg-stone-50 dark:bg-stone-900/70 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <div className="p-1.5 rounded-lg bg-stone-800/80 dark:bg-stone-800 shrink-0">
                          {getFileIcon(file)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs truncate">{file.name}</p>
                          <p className="text-[10px] opacity-60">{formatFileSize(file.size)}</p>
                        </div>
                      </div>

                      {/* File Action Controls */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {file.textContent && (
                          <button
                            type="button"
                            onClick={() => toggleFileExpansion(file.id)}
                            className="p-1.5 rounded-lg hover:bg-stone-700/50 text-xs font-medium flex items-center space-x-1 transition-colors"
                            title="Preview file content"
                          >
                            <span className="text-[11px] hidden sm:inline">
                              {expandedFiles[file.id] ? 'Hide Content' : 'View Content'}
                            </span>
                            {expandedFiles[file.id] ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {file.dataUrl && (
                          <a
                            href={file.dataUrl}
                            download={file.name}
                            className="p-1.5 rounded-lg hover:bg-stone-700/50 text-xs transition-colors"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Image Thumbnail inside attachment card */}
                    {file.dataUrl && file.type.startsWith('image/') && (
                      <div className="mt-2 overflow-hidden rounded-lg border border-stone-700/50 max-w-sm">
                        <img src={file.dataUrl} alt={file.name} className="w-full max-h-52 object-cover" />
                      </div>
                    )}

                    {/* Collapsible Text Content View */}
                    {file.textContent && expandedFiles[file.id] && (
                      <div className="mt-2.5 p-2 bg-stone-950/90 text-stone-200 rounded-lg text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap border border-stone-800">
                        <div className="text-[10px] text-stone-500 uppercase font-bold mb-1 pb-1 border-b border-stone-800">
                          {file.name} Preview
                        </div>
                        {file.textContent}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Edit Mode for User Message */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2 min-w-[260px]">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs bg-stone-900 text-stone-100 border border-emerald-500 rounded-lg focus:outline-hidden"
              />
              <div className="flex justify-end space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-stone-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  Save & Submit
                </button>
              </div>
            </form>
          ) : (
            <div>{renderFormattedContent(message.content)}</div>
          )}

          {/* Citations Box */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-stone-200 dark:border-stone-700/60 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                <Globe className="w-3.5 h-3.5 text-sky-500" />
                <span>Web Sources & Citations</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {message.citations.map((c, i) => (
                  <a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 hover:border-sky-500 transition-colors group/cite"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-sky-600 dark:text-sky-400 truncate text-[11px]">
                        [{i + 1}] {c.title}
                      </div>
                      {c.snippet && (
                        <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                          {c.snippet}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover/cite:text-sky-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Streaming Indicator */}
          {message.isStreaming && (
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-emerald-500 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Streaming response...</span>
            </div>
          )}

          {/* Error Indicator */}
          {message.error && (
            <div className="flex items-center space-x-1.5 mt-2 text-xs text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{message.error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Message Toolbar Actions */}
      {!isEditing && (
        <div
          className={`flex items-center space-x-1 mt-1 px-1 transition-opacity text-stone-400 text-xs ${
            feedbackState || isSpeaking ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${isUser ? 'mr-10' : 'ml-10'}`}
        >
          <button
            onClick={handleCopy}
            className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
            title="Copy Message"
            id={`copy-btn-${message.id}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {isUser && isLastUserMessage && onEditMessage && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
              title="Edit & Regenerate"
              id={`edit-btn-${message.id}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
              title="Regenerate Response"
              id={`regenerate-btn-${message.id}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Text-to-Speech (TTS) Read Aloud Button */}
          {!isUser && !message.isStreaming && (
            <button
              type="button"
              id={`tts-btn-${message.id}`}
              onClick={toggleSpeech}
              className={`p-1 rounded transition-colors ${
                isSpeaking
                  ? 'text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/60'
                  : 'hover:text-stone-700 dark:hover:text-stone-200'
              }`}
              title={isSpeaking ? 'Stop Reading Aloud' : 'Read Response Aloud (Text-to-Speech)'}
            >
              {isSpeaking ? (
                <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {/* Emoji Reaction Buttons for Assistant Messages */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center space-x-1 pl-1 ml-0.5 border-l border-stone-200 dark:border-stone-700/60">
              <button
                type="button"
                id={`reaction-thumbs-up-${message.id}`}
                onClick={() => handleFeedbackToggle('thumbs_up')}
                className={`p-1 px-1.5 text-xs rounded-md transition-all flex items-center space-x-1 ${
                  feedbackState === 'thumbs_up'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-400 dark:ring-emerald-600 font-medium shadow-xs scale-105'
                    : 'hover:bg-stone-200/60 dark:hover:bg-stone-700/60 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
                title={feedbackState === 'thumbs_up' ? 'Remove thumbs up reaction' : 'Helpful response (👍)'}
              >
                <span className="text-sm leading-none">👍</span>
              </button>
              <button
                type="button"
                id={`reaction-thumbs-down-${message.id}`}
                onClick={() => handleFeedbackToggle('thumbs_down')}
                className={`p-1 px-1.5 text-xs rounded-md transition-all flex items-center space-x-1 ${
                  feedbackState === 'thumbs_down'
                    ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 ring-1 ring-rose-400 dark:ring-rose-600 font-medium shadow-xs scale-105'
                    : 'hover:bg-stone-200/60 dark:hover:bg-stone-700/60 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                }`}
                title={feedbackState === 'thumbs_down' ? 'Remove thumbs down reaction' : 'Unhelpful response (👎)'}
              >
                <span className="text-sm leading-none">👎</span>
              </button>
            </div>
          )}

          {onDeleteMessage && (
            <button
              onClick={() => onDeleteMessage(message.id)}
              className="p-1 hover:text-rose-500 rounded transition-colors"
              title="Delete Message"
              id={`delete-btn-${message.id}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
