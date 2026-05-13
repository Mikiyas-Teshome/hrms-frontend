'use client';

import * as React from 'react';
import { Files, Filter, BarChart3, ChevronDown } from 'lucide-react';
import { AssistantInput } from '@/components/dashboard/assistant/assistant-input';
import { 
  UserMessage, 
  AssistantMessage, 
  DiscoverySuggestions 
} from '@/components/dashboard/assistant/assistant-chat';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import Image from 'next/image';

type Message = {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
  filters?: { label: string; rounded?: boolean }[];
  followUps?: { icon: React.ReactNode; label: string }[];
};

export default function AssistantPage() {
    const [prompt, setPrompt] = React.useState('');
    const [isThinking, setIsThinking] = React.useState(false);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [status, setStatus] = React.useState<'discovery' | 'conversation'>('discovery');
    const [showScrollDown, setShowScrollDown] = React.useState(false);

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const { state, isMobile } = useSidebar();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Sidebar width calculation based on shadcn/ui sidebar.tsx
    const sidebarWidth = isMobile ? '0px' : state === 'expanded' ? '256px' : '48px';

    // Auto-scroll to bottom on new messages
    React.useEffect(() => {
        const mainContainer = document.getElementById('dashboard-main');
        if (mainContainer) {
            mainContainer.scrollTop = mainContainer.scrollHeight;
        }
    }, [messages, isThinking]);

    // Scroll detection for "Scroll to bottom" button
    React.useEffect(() => {
        const mainContainer = document.getElementById('dashboard-main');
        if (!mainContainer) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = mainContainer;
            // Show button if not near the bottom
            const isNearBottom = scrollHeight - scrollTop <= clientHeight + 150;
            setShowScrollDown(!isNearBottom && status === 'conversation');
        };

        mainContainer.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => mainContainer.removeEventListener('scroll', handleScroll);
    }, [status, messages]);

    const scrollToBottom = () => {
        const mainContainer = document.getElementById('dashboard-main');
        if (mainContainer) {
            mainContainer.scrollTo({
                top: mainContainer.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    const handleSend = async (text: string = prompt) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: text,
            filters: [
                { label: 'Full org.', rounded: false },
                { label: 'Mar 20, 2026- Mar 21, 2026', rounded: true },
            ],
        };

        setMessages((prev) => [...prev, userMsg]);
        setPrompt('');
        setStatus('conversation');
        setIsThinking(true);

        // Mock bot response
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content:
                    'You currently have 124 active employees. That’s 92% of your total workforce. 8 employees are on leave and 3 are inactive.',
                followUps: [
                    { icon: <Files size={16} />, label: 'View active employees' },
                    { icon: <Filter size={16} />, label: 'Filter by department' },
                    { icon: <BarChart3 size={16} />, label: 'See attendance overview' },
                ],
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsThinking(false);
        }, 2000);
    };

    const handleStop = () => {
        setIsThinking(false);
        // In a real app, abort the API call here
    };

    if (!mounted) return null;

    return (
        <div className="flex flex-col bg-background relative">
            {/* Scrollable Message Area */}
            <div
                ref={scrollRef}
                className={cn(
                    'flex-1 flex flex-col items-center px-4 md:px-6 no-scrollbar',
                    status === 'discovery' ? 'pt-[10%] justify-center' : 'pt-6 pb-50 md:pb-45',
                )}
            >
                {status === 'discovery' ? (
                    <div className="flex flex-col items-center space-y-6 w-full max-w-175">
                        {/* Header Area (Finden-style) */}
                        <div className="flex flex-col items-center">
                            <Image
                                src={'/assets/assistantSvg.svg'}
                                width={50}
                                height={50}
                                alt="assistant url"
                                className="object-cover "
                            />
                            <h3 className="text-2xl leading-8 font-semibold text-foreground text-center">
                                How can i help you?
                            </h3>
                        </div>

                        {/* Input and Suggestions (Centered in discovery) */}
                        <div className="flex flex-col items-center gap-4.5 w-full">
                            <AssistantInput
                                value={prompt}
                                onChange={setPrompt}
                                onSend={() => handleSend()}
                                onStop={handleStop}
                                isThinking={isThinking}
                                isActive={false}
                            />
                            <DiscoverySuggestions onSelect={handleSend} />
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-175 flex flex-col gap-2.5">
                        {messages.map((msg) => (
                            <React.Fragment key={msg.id}>
                                {msg.type === 'user' ? (
                                    <UserMessage content={msg.content} filters={msg.filters} />
                                ) : (
                                    <AssistantMessage
                                        content={msg.content}
                                        followUps={msg.followUps}
                                    />
                                )}
                            </React.Fragment>
                        ))}

                        {isThinking && <AssistantMessage isThinking={true} />}
                    </div>
                )}
            </div>

            {/* Sticky Bottom Input Area (Finden-style fixed positioning) */}
            {status === 'conversation' && (
                <div
                    className="fixed bottom-0 z-30 p-4 md:p-6 pb-6 md:pb-8 bg-linear-to-t from-background via-background/80 to-transparent flex flex-col items-center justify-end pointer-events-none transition-all duration-200 ease-linear"
                    style={{
                        left: isMobile ? '0' : sidebarWidth,
                        width: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`,
                    }}
                >
                    <div className="pointer-events-auto w-full max-w-175 flex flex-col items-end">
                        {showScrollDown && (
                            <button
                                onClick={scrollToBottom}
                                className="mb-4 w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:border-primary/30 text-muted-foreground hover:text-primary transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                            >
                                <ChevronDown size={20} />
                            </button>
                        )}
                        <AssistantInput
                            value={prompt}
                            onChange={setPrompt}
                            onSend={() => handleSend()}
                            onStop={handleStop}
                            isThinking={isThinking}
                            isActive={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
