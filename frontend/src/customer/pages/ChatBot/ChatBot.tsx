import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/Store";
import { askProductQuestion, chatBot } from "../../../redux/Customer/AiChatBotSlice";
import { IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PromptMessage from "./PromptMessage";
import ResponseMessage from "./ResponseMessage";
import CloseIcon from '@mui/icons-material/Close';

interface ChatBotProps {
    handleClose: (e: any) => void;
    productId?: string;
}

const ChatBot = ({ handleClose, productId }: ChatBotProps) => {
    const dispatch = useAppDispatch();
    const [prompt, setPrompt] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const user = useAppSelector(state => state.user);

    const aiChatBot = useAppSelector(state => state.aiChatBot);

    const handleGivePrompt = (e: any) => {
        if (e) e.stopPropagation();
        if (!prompt.trim() || aiChatBot.loading) return;

        if (productId) {
            dispatch(askProductQuestion({
                productId, 
                question: prompt
            }));
        } else {
            dispatch(chatBot({
                prompt: prompt,
                productId: null,
                userId: user.user?._id || null
            }));
        }

        setPrompt("");
    };

    const handlePromptChange = (e: any) => {
        setPrompt(e.target.value);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            const container = chatContainerRef.current.parentElement;
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        }
    }, [aiChatBot.messages, aiChatBot.loading]);

    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col w-[calc(100vw-32px)] lg:w-[400px] h-[500px] lg:h-[600px] max-h-[70vh] lg:max-h-[85vh] border border-gray-200 z-50">
            {/* Header */}
            <div className="h-[60px] shrink-0 flex justify-between items-center px-4 bg-white border-b border-gray-100 shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <span className="text-xl font-black tracking-tighter text-[#FF5A00]">Near</span>
                        <span className="text-xl font-extrabold tracking-tight text-gray-800 ml-1">Look</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 border-l border-gray-300 pl-2 ml-1">AI Assistant</p>
                </div>
                <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary', bgcolor: '#f3f4f6' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            {/* Chat Area */}
            <div className="flex-grow p-4 flex flex-col overflow-y-auto bg-gray-50 custom-scrollbar gap-4">
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 self-start max-w-[85%] border border-gray-100">
                    👋 Welcome to Near Look AI Assistant! 
                    <br/><br/>
                    {productId 
                        ? `I can answer specific questions about this product. What would you like to know?` 
                        : "I can help you with your cart, order history, and find products. How can I assist you today?"}
                </div>

                {aiChatBot.messages.map((item: any, index: number) =>
                    item.role === "user" ? (
                        <div className="self-end max-w-[85%]" key={index}>
                            <PromptMessage message={item.message} index={index} />
                        </div>
                    ) : (
                        <div className="self-start max-w-[85%]" key={index}>
                            <ResponseMessage message={item.message} />
                        </div>
                    )
                )}
                
                {aiChatBot.loading && (
                    <div className="self-start max-w-[85%] bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-500 border border-gray-100 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                )}
                {/* Invisible element to scroll to */}
                <div ref={chatContainerRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="h-[70px] shrink-0 flex items-center px-4 border-t border-gray-200 bg-white">
                <div className="flex items-center w-full bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 focus-within:border-[#FF5A00] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#FF5A00]/20 transition-all shadow-inner">
                    <input
                        onChange={handlePromptChange}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleGivePrompt(e) }}
                        value={prompt}
                        type="text"
                        placeholder="Type your message..."
                        className="flex-grow bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-500 py-2 h-full"
                    />
                    <IconButton
                        onClick={handleGivePrompt}
                        disabled={aiChatBot.loading || !prompt.trim()}
                        sx={{ 
                            bgcolor: prompt.trim() ? '#FF5A00' : '#d1d5db', 
                            color: 'white',
                            width: 32,
                            height: 32,
                            ml: 1,
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: prompt.trim() ? '#ea580c' : '#d1d5db' },
                            '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
                        }}
                    >
                        {aiChatBot.loading 
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 
                            : <SendIcon sx={{ fontSize: 16, ml: '2px' }} />
                        }
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;