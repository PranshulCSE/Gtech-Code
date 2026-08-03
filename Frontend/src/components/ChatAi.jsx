import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../../utils/axiosClient";
import { Send, Sparkles, Bot, MessageSquareText, Lightbulb } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setMessages([
            {
                role: 'model',
                content: problem
                    ? `I can help you reason about ${problem.title}, explain edge cases, or debug your approach.`
                    : 'Ask me for a hint, an explanation, or help debugging your approach.'
            }
        ]);
    }, [problem?._id, problem?.title]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        setIsSending(true);
        setMessages(prev => [...prev, { role: 'user', content: data.message }]);
        reset();

        try {
            const response = await axiosClient.post("/chat/ai", {
                message: data.message,
                problemTitle: problem?.title,
                problemDescription: problem?.description
            });


            setMessages(prev => [...prev, {
                role: 'model',
                content: response.data.message || response.data.content
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                content: "Sorry, I encountered an error"
            }]);
        } finally {
            setIsSending(false);
        }
    };

    const quickPrompts = [
        'Give me a hint without the full solution',
        'Explain the optimal approach',
        'What edge cases should I test?',
        'Help me debug my current code'
    ];

    return (
        <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 shadow-xl">
            <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-indigo-200">
                        <Bot size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-indigo-200">AI Instructor</p>
                        <h3 className="text-lg font-bold">Ask for hints, explanations, or debugging help</h3>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Sparkles size={12} /> Problem-aware</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><MessageSquareText size={12} /> Hint-first guidance</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1"><Lightbulb size={12} /> Edge cases</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                    >
                        <div className={`chat-bubble max-w-[85%] whitespace-pre-wrap leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-800 shadow-sm border border-slate-200'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-white/90 p-4 backdrop-blur">
                <div className="mb-3 flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                            onClick={() => setValue('message', prompt, { shouldDirty: true, shouldValidate: true })}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-inner">
                        <textarea
                            placeholder="Ask for a hint, explain a mistake, or request a dry run..."
                            className="min-h-[48px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                            rows={1}
                            {...register("message", { required: true, minLength: 2 })}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary rounded-xl px-4"
                            disabled={errors.message || isSending}
                        >
                            {isSending ? <span className="loading loading-spinner loading-xs" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChatAi;