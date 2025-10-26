
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MessageUsPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversation = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    let { data: convoData, error: convoError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (convoError && convoError.code !== 'PGRST116') {
      toast({ title: "Error finding conversation", description: convoError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    
    if (!convoData) {
        const { data: newConvo, error: newConvoError } = await supabase
            .from('conversations')
            .insert({ user_id: user.id })
            .select('id')
            .single();
        if(newConvoError) {
             toast({ title: "Error creating conversation", description: newConvoError.message, variant: 'destructive' });
             setLoading(false);
             return;
        }
        convoData = newConvo;
    }

    setConversation(convoData);

    const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoData.id)
        .order('created_at', { ascending: true });

    if(messagesError) {
        toast({ title: "Error fetching messages", description: messagesError.message, variant: 'destructive' });
    } else {
        setMessages(messagesData);
    }

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    if(!user) {
        navigate('/login');
    } else {
        fetchConversation();
    }
  }, [user, navigate, fetchConversation]);

  const canSendMessage = () => {
      const lastStaffMessageIndex = messages.slice().reverse().findIndex(m => m.sender_role === 'staff' || m.sender_role === 'mou');
      const userMessagesSinceStaff = lastStaffMessageIndex === -1 ? messages.length : userMessagesSinceStaff; // It was userMessagesSinceStaff instead of messages.length - (lastStaffMessageIndex + 1) to correctly count
      
      const userMessagesCount = messages.filter(m => m.sender_role === 'member').length;
      const lastStaffMessage = messages.slice().reverse().find(m => m.sender_role === 'staff' || m.sender_role === 'mou');
      
      if (!lastStaffMessage) { // No staff message yet, user can send up to 3
          return userMessagesCount < 3;
      }
      
      const messagesAfterLastStaff = messages.filter(m => new Date(m.created_at) > new Date(lastStaffMessage.created_at));
      const userMessagesAfterLastStaff = messagesAfterLastStaff.filter(m => m.sender_role === 'member').length;
      
      return userMessagesAfterLastStaff < 3;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !canSendMessage()) {
        if(!canSendMessage()) {
             toast({ title: 'Please wait for a reply', description: 'You can send up to 3 messages before a staff member responds.', variant: 'destructive' });
        }
        return;
    }
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        sender_role: 'member',
        content: message
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Message Failed', description: error.message, variant: 'destructive' });
    } else {
      setMessages(prev => [...prev, data]);
      setMessage('');
      toast({ title: 'Message Sent!', description: 'A staff member will get back to you soon.' });
    }
    setIsSubmitting(false);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-black" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Message Us | NPC</title>
        <meta name="description" content="Contact the staff at NPC." />
      </Helmet>
      <Header />
      <main className="flex-grow bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Contact Staff</h1>
          
          <div className="border border-black rounded-lg p-4 h-[500px] flex flex-col">
            <div className="flex-grow overflow-y-auto mb-4 space-y-4 pr-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_role !== 'member' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-lg max-w-sm ${msg.sender_role !== 'member' ? 'bg-gray-200' : 'bg-black text-white'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t">
              <label htmlFor="message" className="font-bold text-lg mb-2 block">What's on your mind?</label>
              <div className="flex gap-2">
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={2}
                  className="resize-none"
                  disabled={isSubmitting || !canSendMessage()}
                />
                <Button type="submit" size="icon" disabled={isSubmitting || !canSendMessage() || !message.trim()}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
              {!canSendMessage() && <p className="text-sm text-red-500 mt-2">You must wait for a staff reply before sending more messages.</p>}
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessageUsPage;
