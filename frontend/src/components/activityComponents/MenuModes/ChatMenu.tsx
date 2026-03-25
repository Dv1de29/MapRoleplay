import React, { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../../store/GameStore';
import '../../../styles/ChatMenu.css';
import { requestAIMove } from '../../../ai-worker/aiService';



/////this gives me the flag for modern countries
import { GB, RO } from 'country-flag-icons/react/3x2'





interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
}

function ChatMenu() {
    const empires = useGameStore((state) => state.empires);
    const localPlayerEmpireId = useGameStore.getState().getLocalPlayerEmpireId();

    // Get a list of OTHER empires to chat with
    const otherEmpires = Object.values(empires).filter(e => e.id !== localPlayerEmpireId);

    // Default to the first available other empire
    const [activeChatId, setActiveChatId] = useState<string | null>(otherEmpires.length > 0 ? otherEmpires[0].id : null);

    // Mock message store keyed by empire ID
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
    const [inputText, setInputText] = useState("");
    const [isAITyping, setIsAITyping] = useState(false);

    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChatId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeChatId || !localPlayerEmpireId) return;

        const messageText = inputText.trim();
        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            senderId: localPlayerEmpireId,
            text: messageText,
            timestamp: new Date()
        };

        setMessages(prev => {
            const chatHistory = prev[activeChatId] || [];
            return {
                ...prev,
                [activeChatId]: [...chatHistory, newMessage]
            }
        });

        setInputText("");

        const currentActiveEmpire = empires[activeChatId];
        if (currentActiveEmpire?.isAI) {
            setIsAITyping(true);
            try {
                const prompt = `You are the leader of ${currentActiveEmpire.name}. A foreign nation just messaged you: "${messageText}". Reply in character as your nation's leader. Keep it under 2 sentences. Your response MUST be plain text, do NOT use JSON or markdown.`;
                const responseText = await requestAIMove(prompt);
                
                const aiMessage: ChatMessage = {
                    id: Math.random().toString(36).substr(2, 9),
                    senderId: activeChatId,
                    text: responseText,
                    timestamp: new Date()
                };

                setMessages(prev => {
                    const chatHistory = prev[activeChatId] || [];
                    return {
                        ...prev,
                        [activeChatId]: [...chatHistory, aiMessage]
                    }
                });
            } catch (error) {
                console.error("AI response failed:", error);
            } finally {
                setIsAITyping(false);
            }
        }
    };

    const activeEmpire = activeChatId ? empires[activeChatId] : null;
    const currentChatHistory = activeChatId ? (messages[activeChatId] || []) : [];

    const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.deltaY !== 0) {
            e.currentTarget.scrollBy({
                left: e.deltaY * 1,
                behavior: 'smooth'
            });
            e.preventDefault(); // Prevent page scrolling while panning
        }
    };

    return (
        <div className="chat-menu-container">
            {/* Empire Selector Row */}
            <div className="chat-selector-row" onWheel={handleWheelScroll}>
                {otherEmpires.length === 0 ? (
                    <div style={{ padding: '0 10px', fontSize: '0.8rem', opacity: 0.5 }}>Waiting for other empires...</div>
                ) : (
                    otherEmpires.map(empire => (
                        <div
                            key={empire.id}
                            className={`chat-avatar ${empire.id === activeChatId ? 'active' : ''}`}
                            style={{ backgroundColor: empire.color }}
                            onClick={() => setActiveChatId(empire.id)}
                            title={empire.name}
                        >
                            {empire.name.charAt(0).toUpperCase()}
                        </div>
                    ))
                )}
            </div>

            {/* Chat Area */}
            {activeChatId ? (
                <div className="chat-messages-area">
                    <div className="chat-header">
                        <span style={{ color: activeEmpire?.color, fontWeight: 'bold', textShadow: '0px 0px 4px rgba(0,0,0,0.8)' }}>
                            Chat with {activeEmpire?.name}
                        </span>
                    </div>
                    <div className="chat-history">
                        {currentChatHistory.length === 0 ? (
                            <div className="chat-empty-state">No messages yet. Send a diplomatic envoy!</div>
                        ) : (
                            currentChatHistory.map(msg => {
                                const isLocal = msg.senderId === localPlayerEmpireId;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`chat-bubble-wrapper ${isLocal ? 'local' : 'remote'}`}
                                    >
                                        <div
                                            className={`chat-bubble ${isLocal ? 'local' : 'remote'}`}
                                            style={!isLocal ? { borderLeftColor: activeEmpire?.color } : {}}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        {isAITyping && (
                            <div className="chat-bubble-wrapper remote">
                                <div className="chat-bubble remote" style={{ fontStyle: "italic", opacity: 0.7, borderLeftColor: activeEmpire?.color }}>
                                    {activeEmpire?.name} is typing...
                                </div>
                            </div>
                        )}
                        <div ref={endOfMessagesRef} />
                    </div>

                    {/* Input Area */}
                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit" className="chat-send-btn" disabled={!inputText.trim()} title="Send">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="chat-empty-state" style={{ flex: 1 }}>
                    {otherEmpires.length === 0 ? "No other empires to chat with." : "Select an empire to start chatting."}
                </div>
            )}
        </div>
    )
}

export default ChatMenu;