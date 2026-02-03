"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X, Send, AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslation } from "@/lib/hooks/useTranslation"
import ReactMarkdown from 'react-markdown'
import { cn } from "@/lib/utils"

// Message interface for type safety
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Function to convert URLs and phone numbers to markdown links
const convertTextToLinks = (text: string): string => {
  // URL pattern: matches http://, https://, www., and common domains
  const urlPattern = /(https?:\/\/[^\s\)]+|www\.[^\s\)]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s\)]*)/g;
  
  // Phone number pattern: matches international format (+XX...) and local formats
  const phonePattern = /(\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
  
  // Helper to check if text at a given position is inside a markdown link
  const isInsideMarkdownLink = (text: string, pos: number): boolean => {
    // Look backwards for the opening bracket and parenthesis pattern
    let bracketCount = 0;
    let parenCount = 0;
    let foundBracket = false;
    
    for (let i = pos - 1; i >= 0; i--) {
      if (text[i] === ')') {
        parenCount++;
      } else if (text[i] === '(' && parenCount > 0) {
        parenCount--;
        if (parenCount === 0 && foundBracket) {
          return true; // We're inside a markdown link
        }
      } else if (text[i] === ']') {
        bracketCount++;
      } else if (text[i] === '[' && bracketCount > 0) {
        bracketCount--;
        foundBracket = true;
      } else if (text[i] === ' ' || text[i] === '\n') {
        break; // Stop at whitespace
      }
    }
    return false;
  };
  
  let processedText = text;
  
  // Convert URLs to markdown links
  // Callback signature: (match, p1, offset, string) where p1 is the capturing group
  processedText = processedText.replace(urlPattern, (match, url, offset) => {
    // Check if this URL is already inside a markdown link
    if (offset !== undefined && isInsideMarkdownLink(processedText, offset)) {
      return match;
    }
    
    // Use the captured group or the full match
    const actualUrl = url || match;
    
    // Add protocol if missing
    const fullUrl = actualUrl.startsWith('http') ? actualUrl : `https://${actualUrl}`;
    return `[${actualUrl}](${fullUrl})`;
  });
  
  // Convert phone numbers to tel: links
  // Callback signature: (match, p1, offset, string) where p1 is the capturing group
  processedText = processedText.replace(phonePattern, (match, phone, offset) => {
    // Check if this phone is already inside a markdown link
    if (offset !== undefined && isInsideMarkdownLink(processedText, offset)) {
      return match;
    }
    
    // Use the captured group or the full match
    const actualPhone = phone || match;
    
    // Remove spaces, dashes, and parentheses for tel: link
    const telNumber = actualPhone.replace(/[\s\-\(\)]/g, '');
    return `[${actualPhone}](tel:${telNumber})`;
  });
  
  return processedText;
};

// Helper function to create markdown link components configuration
const createMarkdownComponents = (role: 'user' | 'assistant' = 'assistant') => ({
  a: ({ node, ...props }: any) => {
    const href = props.href || '';
    const isPhoneLink = href.startsWith('tel:');
    return (
      <a 
        {...props} 
        target={isPhoneLink ? undefined : "_blank"}
        rel={isPhoneLink ? undefined : "noopener noreferrer"}
        className={cn(
          role === "user" 
            ? "text-white underline hover:text-blue-200" 
            : "text-primary underline hover:text-primary/80",
          "cursor-pointer"
        )}
      />
    );
  }
});

// Safe UUID generator with fallback
function generateUUID(): string {
  // Try to use crypto.randomUUID() if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  
  // Fallback: Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function FloatingLogoButton() {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  
  // Chat state management
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Ref for chat scroll container and input
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isChatOpen])

  // Send message function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      id: generateUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)
    setError(null)

    try {
      // Prepare conversation history (last 10 message pairs)
      const history = messages.slice(-20).map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get response' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: generateUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp || new Date())
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Retry last message
  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
      if (lastUserMessage) {
        setMessage(lastUserMessage.content)
        setError(null)
      }
    }
  }

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('default', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <>
      {!isChatOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 group">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-primary/20 overflow-hidden"
            aria-label={t('chat.aria.openChat')}
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image
              src="/logo.webp"
              alt="Acquamarina Logo"
              width={96}
              height={96}
              className="w-full h-full object-contain p-1"
            />
          </button>

          {/* Tooltip: always visible on md+ (web), hover-based on mobile */}
          <div
            className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg whitespace-nowrap transition-all duration-300 ${
              isHovered && !isChatOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            } md:opacity-100 md:translate-y-0 md:pointer-events-auto`}
          >
            {t('chat.tooltip')}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
          </div>
        </div>
      )}

      <div
        className={`fixed z-[60] transition-all duration-300 ease-out ${
          isChatOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        } ${
          isMobile 
            ? 'inset-x-4 top-4 bottom-24'
            : 'right-8 bottom-8 w-[min(420px,calc(100vw-4rem))] h-[min(600px,calc(100vh-8rem))]'
        }`}
      >
        <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl border border-primary/10 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white px-4 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden flex-shrink-0 p-0.5">
                <Image
                  src="/logo.webp"
                  alt="Acquamarina"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base md:text-lg truncate">{t('chat.header.title')}</h3>
                <p className="text-xs text-white/80 truncate">{t('chat.header.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsChatOpen(false)
              }}
              className="w-11 h-11 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center flex-shrink-0 -mr-1 touch-manipulation"
              aria-label={t('chat.aria.closeChat')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto overscroll-contain p-4 bg-gradient-to-b from-gray-50 to-white"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y'
            }}
          >
            <div className="space-y-4 pb-2">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                    <Image
                      src="/logo.webp"
                      alt="Acquamarina"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 max-w-[80%]">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <ReactMarkdown components={createMarkdownComponents('assistant')}>
                        {convertTextToLinks(t('chat.welcome.greeting'))}
                      </ReactMarkdown>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed mt-2">
                      <ReactMarkdown components={createMarkdownComponents('assistant')}>
                        {convertTextToLinks(t('chat.welcome.question'))}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* Message History */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                      <Image
                        src="/logo.webp"
                        alt="Acquamarina"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-white border border-gray-100 rounded-tl-sm'
                      }`}
                    >
                      <div className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'user' ? 'text-white' : 'text-gray-700'
                      }`}>
                        <ReactMarkdown components={createMarkdownComponents(msg.role)}>
                          {convertTextToLinks(msg.content)}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <span className={`text-xs text-gray-400 mt-1 px-2 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5">
                    <Image
                      src="/logo.webp"
                      alt="Acquamarina"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 bg-red-50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-red-100">
                    <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 p-3 md:p-4 bg-white flex-shrink-0 safe-area-inset-bottom">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('chat.input.placeholder')}
                disabled={isLoading}
                enterKeyHint="send"
                className="flex-1 min-w-0 px-4 py-3 rounded-full border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                onClick={(e) => {
                  if (!message.trim() || isLoading) {
                    e.preventDefault()
                    return
                  }
                }}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 active:bg-primary/80 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex-shrink-0 touch-manipulation"
                aria-label={t('chat.aria.sendMessage')}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
