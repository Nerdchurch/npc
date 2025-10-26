
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription, SheetClose,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ArrowUpDown, History, Trash2, Edit, MessageSquare, Loader2, Send, CheckSquare, XSquare, PlusCircle, X } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DashboardPageContent } from '@/pages/DashboardPage';


const ConversationSheet = ({ conversation, username, onConversationUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: true });
        
        if (error) {
            toast({ title: "Error fetching messages", description: error.message, variant: 'destructive' });
        } else {
            setMessages(data);
            const unreadMessages = data.filter(m => m.status === 'unread' && m.sender_role === 'member');
            if(unreadMessages.length > 0) {
                const updates = unreadMessages.map(m => supabase.from('messages').update({ status: 'read' }).eq('id', m.id));
                await Promise.all(updates);
                if (onConversationUpdate) onConversationUpdate(conversation.id, 'read');
            } else {
                 // If no unread messages, ensure the parent status is up-to-date
                const lastMessage = data[data.length - 1];
                if (lastMessage && onConversationUpdate) {
                    onConversationUpdate(conversation.id, lastMessage.status);
                }
            }
        }
        setLoading(false);
    }, [conversation.id, toast, onConversationUpdate]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);
    
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        setIsSending(true);

        const senderRole = profile?.role === 'mou' ? 'mou' : 'staff';

        const { data, error } = await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            sender_role: senderRole,
            content: newMessage,
            status: 'replied'
        }).select().single();

        if (error) {
            toast({ title: 'Failed to send message', description: error.message, variant: 'destructive' });
        } else {
            setMessages(prev => [...prev, data]);
            setNewMessage('');
            if(onConversationUpdate) onConversationUpdate(conversation.id, 'replied', data.content);
        }
        setIsSending(false);
    };

    return (
        <SheetContent className="w-full sm:max-w-md flex flex-col">
            <SheetHeader>
                <SheetTitle>Conversation with {username}</SheetTitle>
            </SheetHeader>
            <div className="flex-grow overflow-y-auto my-4 space-y-4 pr-2">
                {loading ? <Loader2 className="mx-auto my-8 h-8 w-8 animate-spin" /> : 
                messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_role !== 'member' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs ${msg.sender_role !== 'member' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-4 border-t flex gap-2">
                <Textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a reply..." rows={2} className="resize-none"/>
                <Button onClick={handleSendMessage} disabled={isSending} size="icon">{isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4"/>}</Button>
            </div>
        </SheetContent>
    );
};

const MemberHistorySheet = ({ member }) => {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchActivity = async () => {
            if (!member.user_id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const { data, error } = await supabase.rpc('get_user_activity', { p_user_id: member.user_id });
            if (error) {
                toast({ title: 'Error fetching activity', description: error.message, variant: 'destructive' });
            } else {
                setActivity(data);
            }
            setLoading(false);
        };
        fetchActivity();
    }, [member.user_id, toast]);

    const renderActivityItem = (item) => {
        switch (item.activity_type) {
            case 'message':
                return (
                    <div className="flex items-start gap-3">
                        <MessageSquare className="h-4 w-4 mt-1 text-gray-500"/>
                        <div className="flex-1">
                            <p className="text-sm text-gray-800">Sent a message: <span className="italic">"{item.content}"</span></p>
                            <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                );
            // Future activity types can be added here
            default:
                return null;
        }
    }

    return (
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Activity for {member.username}</SheetTitle>
                <SheetDescription>A log of recent actions taken by this member.</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
                {loading ? <Loader2 className="h-8 w-8 animate-spin text-gray-500"/> :
                 activity.length > 0 ? (
                    <div className="space-y-4">
                        {activity.map((item, index) => (
                            <div key={index}>{renderActivityItem(item)}</div>
                        ))}
                    </div>
                 ) : <p className="text-sm text-gray-500">No activity recorded for this member yet.</p>
                }
            </div>
        </SheetContent>
    );
};


const EditProfileSheet = ({ submission, onProfileUpdate }) => {
    const [formData, setFormData] = useState({
        username: submission.username || '',
        full_name: submission.full_name || '',
        phone: submission.phone || '',
        email: submission.email || '',
        pronouns: submission.pronouns || '',
        social_links: submission.social_links || '',
        interests: submission.interests || '',
        message: submission.message || '',
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        const { data, error } = await supabase
            .from('submissions')
            .update(formData)
            .eq('id', submission.id)
            .select()
            .single();

        if (error) {
            toast({ title: 'Error updating profile', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Profile Updated', description: `Details for ${data.username} have been saved.` });
            onProfileUpdate(data);
        }
        setIsUpdating(false);
    };

    return (
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto flex flex-col">
            <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
                <SheetDescription>Editing profile for <span className="font-bold">{submission.username}</span>.</SheetDescription>
            </SheetHeader>
            <div className="py-6 flex-grow space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="username">Username</Label><Input id="username" name="username" value={formData.username} onChange={handleChange} /></div>
                    <div><Label htmlFor="full_name">Full Name</Label><Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} /></div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} /></div>
                </div>
                <div><Label htmlFor="pronouns">Pronouns</Label><Input id="pronouns" name="pronouns" value={formData.pronouns} onChange={handleChange} /></div>
                <div><Label htmlFor="social_links">Social Links</Label><Input id="social_links" name="social_links" value={formData.social_links} onChange={handleChange} /></div>
                <div><Label htmlFor="interests">Interests</Label><Input id="interests" name="interests" value={formData.interests} onChange={handleChange} /></div>
                <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" value={formData.message} onChange={handleChange} /></div>
            </div>
            <SheetFooter className="mt-auto pt-4 border-t">
                <SheetClose asChild>
                    <Button variant="outline">Cancel</Button>
                </SheetClose>
                <SheetClose asChild>
                    <Button onClick={handleUpdate} disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
                </SheetClose>
            </SheetFooter>
        </SheetContent>
    );
};

const SubmissionDetails = ({ submission, onStatusChange, onDelete, onProfileUpdate }) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const { profile } = useAuth();

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdating(true);
    const { data: profileData, error: profileError } = await supabase.from('profiles').select('username').eq('id', profile.id).single();
    if(profileError) {
        toast({ title: 'Error fetching your profile', description: profileError.message, variant: 'destructive' });
        setIsUpdating(false);
        return;
    }

    const { error } = await supabase
      .from('submissions')
      .update({ status: newStatus, status_changed_by_username: profileData?.username })
      .eq('id', submission.id);
    
    if (error) {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Submission ${newStatus}!`, description: `The submission for ${submission.username} has been updated.` });
      onStatusChange(submission.id, newStatus, profileData?.username);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    const { error } = await supabase.from('submissions').delete().eq('id', submission.id);
    if (error) {
        toast({ title: 'Error deleting submission', description: error.message, variant: 'destructive' });
    } else {
        toast({ title: 'Submission Deleted', description: `The submission for ${submission.username} has been permanently deleted.` });
        onDelete(submission.id);
    }
    setIsUpdating(false);
  };

  const DetailItem = ({ label, value }) => value ? (
    <div className="grid grid-cols-3 gap-2 py-2">
      <dt className="font-semibold text-gray-600">{label}</dt>
      <dd className="col-span-2 text-gray-800 break-words">{value}</dd>
    </div>
  ) : null;

  const actionButtons = [
    { label: 'Approve', status: 'approved', variant: 'outline', className: "border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700" },
    { label: 'Deny', status: 'denied', variant: 'destructive' },
    { label: 'Ban', status: 'banned', variant: 'destructive', className: "bg-red-800 hover:bg-red-900" },
    { label: 'Waitlist', status: 'waitlisted', variant: 'secondary' }
  ];

  return (
    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto flex flex-col">
      <SheetHeader>
        <div className="flex justify-between items-center">
            <div>
                <SheetTitle>Submission Details</SheetTitle>
                <SheetDescription>Reviewing submission for <span className="font-bold">{submission.username}</span>.</SheetDescription>
            </div>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                </SheetTrigger>
                <EditProfileSheet submission={submission} onProfileUpdate={onProfileUpdate} />
            </Sheet>
        </div>
      </SheetHeader>
      <div className="py-6 flex-grow">
        <dl>
          <DetailItem label="Full Name" value={submission.full_name} /> <Separator />
          <DetailItem label="Email" value={submission.email} /> <Separator />
          <DetailItem label="Phone" value={submission.phone} /> <Separator />
          <DetailItem label="Birthday" value={submission.birthday ? new Date(submission.birthday).toLocaleDateString() : 'N/A'} /> <Separator />
          <DetailItem label="Pronouns" value={submission.pronouns} /> <Separator />
          <DetailItem label="Social Links" value={submission.social_links} /> <Separator />
          <DetailItem label="Interests" value={submission.interests} /> <Separator />
          <div className="py-2">
            <dt className="font-semibold text-gray-600 mb-2">Message</dt>
            <dd className="col-span-2 text-gray-800 bg-gray-50 p-3 rounded-md border max-h-48 overflow-y-auto">{submission.message || 'No message provided.'}</dd>
          </div>
        </dl>
      </div>
      <SheetFooter className="mt-auto pt-4 border-t flex justify-between items-center">
        {profile?.role === 'mou' && (
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-5 w-5" /></Button></AlertDialogTrigger>
                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the submission. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><SheetClose asChild><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></SheetClose></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>
        )}
        <div className="flex flex-wrap gap-2 justify-end">
          {actionButtons.map(action => (
             <SheetClose asChild key={action.status}><Button variant={action.variant} className={action.className} onClick={() => handleUpdateStatus(action.status)} disabled={isUpdating || submission.status === action.status}>{action.label}</Button></SheetClose>
          ))}
        </div>
      </SheetFooter>
    </SheetContent>
  );
};

const SubmissionsTab = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
  const { toast } = useToast();

  const handleStatusChange = useCallback((submissionId, newStatus, changedBy) => {
    setSubmissions(currentSubmissions =>
      currentSubmissions.map(sub =>
        sub.id === submissionId ? { ...sub, status: newStatus, status_changed_by_username: changedBy } : sub
      )
    );
  }, []);

  const handleDelete = useCallback((submissionId) => {
    setSubmissions(currentSubmissions => currentSubmissions.filter(sub => sub.id !== submissionId));
  }, []);

  const handleProfileUpdate = useCallback((updatedSubmission) => {
    setSubmissions(currentSubmissions =>
        currentSubmissions.map(sub =>
            sub.id === updatedSubmission.id ? { ...sub, ...updatedSubmission } : sub
        )
    );
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select(`*`)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({ title: 'Error fetching submissions', description: error.message, variant: 'destructive' });
      } else {
        setSubmissions(data);
      }
      setLoading(false);
    };
    fetchSubmissions();
  }, [toast]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const addFilter = (field, value) => {
    setFilters(prev => [...prev, { id: Date.now(), field, value, operator: 'contains' }]);
  };
  
  const removeFilter = (id) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };
  
  const updateFilter = (id, newFilter) => {
      setFilters(prev => prev.map(f => f.id === id ? {...f, ...newFilter} : f));
  };

  const filteredAndSortedSubmissions = useMemo(() => {
    let sortableItems = [...submissions];

    if (globalSearch) {
        const lowercasedSearch = globalSearch.toLowerCase();
        sortableItems = sortableItems.filter(item => 
            Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowercasedSearch)
            )
        );
    }
    
    if (filters.length > 0) {
        sortableItems = sortableItems.filter(item => {
            return filters.every(filter => {
                const itemValue = item[filter.field];
                const filterValue = filter.value;
                if (itemValue === null || itemValue === undefined) return false;

                const lowerItemValue = String(itemValue).toLowerCase();
                const lowerFilterValue = String(filterValue).toLowerCase();
                
                switch(filter.operator) {
                    case 'contains': return lowerItemValue.includes(lowerFilterValue);
                    case 'equals': return lowerItemValue === lowerFilterValue;
                    case 'not_contains': return !lowerItemValue.includes(lowerFilterValue);
                    default: return true;
                }
            });
        });
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [submissions, globalSearch, filters, sortConfig]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'waitlisted': return 'outline';
      case 'denied': return 'destructive';
      case 'banned': return 'destructive';
      case 'approved': return 'default';
      default: return 'secondary';
    }
  };
  
  const filterableFields = [
      { value: 'username', label: 'Username' },
      { value: 'full_name', label: 'Full Name' },
      { value: 'email', label: 'Email' },
      { value: 'status', label: 'Status' },
      { value: 'interests', label: 'Interests' },
      { value: 'newsletter', label: 'Newsletter' },
  ];

  return (
    <>
      <div className="flex flex-col gap-4 mb-6">
        <Input placeholder="Search all fields..." value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} className="max-w-md"/>
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">Filters:</span>
            {filters.map(filter => (
                <div key={filter.id} className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
                     <span className="text-xs font-semibold">{filterableFields.find(f => f.value === filter.field)?.label || filter.field}</span>
                     <span className="text-xs text-gray-500">{filter.operator}</span>
                     <span className="text-xs font-semibold">"{filter.value}"</span>
                     <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeFilter(filter.id)}><X className="h-3 w-3"/></Button>
                </div>
            ))}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Add Filter</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <AddFilterPopover fields={filterableFields} onAddFilter={addFilter} />
                </PopoverContent>
            </Popover>
        </div>
      </div>

      <div className="border border-black rounded-lg overflow-hidden">
        <Sheet>
            <Table><TableHeader><TableRow className="bg-gray-50"><TableHead><Button variant="ghost" onClick={() => requestSort('username')}>Username <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead><TableHead>Status</TableHead><TableHead>Newsletter</TableHead><TableHead><Button variant="ghost" onClick={() => requestSort('created_at')}>Submitted <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead><TableHead>Last Action By</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
                {loading ? ( <TableRow><TableCell colSpan={6} className="text-center h-24">Loading...</TableCell></TableRow> ) : 
                filteredAndSortedSubmissions.length === 0 ? ( <TableRow><TableCell colSpan={6} className="text-center h-24">No matching submissions found.</TableCell></TableRow> ) : 
                (filteredAndSortedSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                          {submission.username}
                          <br/><span className="text-xs text-gray-500">{submission.email}</span>
                      </TableCell>
                      <TableCell><Badge variant={getStatusVariant(submission.status)} className={submission.status === 'banned' ? 'bg-red-800 text-white' : ''}>{submission.status}</Badge></TableCell>
                      <TableCell className="text-center">
                        {submission.newsletter ? <CheckSquare className="h-5 w-5 text-green-600" /> : <XSquare className="h-5 w-5 text-gray-400" />}
                      </TableCell>
                      <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{submission.status_changed_by_username || 'N/A'}</TableCell>
                      <TableCell>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm">View</Button>
                          </SheetTrigger>
                          <SubmissionDetails submission={submission} onStatusChange={handleStatusChange} onDelete={handleDelete} onProfileUpdate={handleProfileUpdate} />
                      </TableCell>
                    </TableRow>
                )))}
            </TableBody>
            </Table>
        </Sheet>
      </div>
    </>
  );
};

const AddFilterPopover = ({ fields, onAddFilter }) => {
    const [field, setField] = useState(fields[0].value);
    const [value, setValue] = useState('');

    const handleAdd = () => {
        if(field && value) {
            onAddFilter(field, value);
            setValue('');
        }
    }
    return (
        <div className="space-y-4">
            <h4 className="font-medium leading-none">Add Filter</h4>
            <div className="grid gap-2">
                <Label htmlFor="filter-field">Field</Label>
                <Select value={field} onValueChange={setField}>
                    <SelectTrigger id="filter-field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {fields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="filter-value">Value</Label>
                <Input id="filter-value" value={value} onChange={e => setValue(e.target.value)} />
            </div>
            <Button onClick={handleAdd} className="w-full">Add</Button>
        </div>
    );
};

const ConversationsTab = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const handleConversationUpdate = useCallback((convoId, newStatus, newContent) => {
        setConversations(currentConvos => 
            currentConvos.map(c => 
                c.id === convoId ? { 
                    ...c, 
                    status: newStatus, 
                    last_message_content: newContent !== undefined ? newContent : c.last_message_content
                } : c
            )
        );
    }, []);

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            let { data, error } = await supabase.rpc('get_conversations_with_details');
            
            if (error) {
                toast({ title: "Error fetching conversations", description: error.message, variant: 'destructive'});
            } else {
                 const sortedData = data.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
                setConversations(sortedData);
            }
            setLoading(false);
        };
        fetchConversations();
    }, [toast]);
    
    const getStatusVariant = (status) => {
        switch (status) {
          case 'unread': return 'destructive';
          case 'read': return 'secondary';
          case 'replied': return 'default';
          default: return 'secondary';
        }
    };
    
    return (
        <div className="border border-black rounded-lg overflow-hidden">
            <Sheet>
                <Table>
                    <TableHeader><TableRow className="bg-gray-50"><TableHead>User</TableHead><TableHead>Last Message</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                         {loading ? ( <TableRow><TableCell colSpan={4} className="text-center h-24">Loading conversations...</TableCell></TableRow> ) :
                         conversations.length === 0 ? (<TableRow><TableCell colSpan={4} className="text-center h-24">No conversations yet.</TableCell></TableRow>) :
                         (conversations.map(convo => (
                             <TableRow key={convo.id}>
                                 <TableCell className="font-medium">{convo.username}</TableCell>
                                 <TableCell className="max-w-sm truncate">{convo.last_message_content}</TableCell>
                                 <TableCell><Badge variant={getStatusVariant(convo.status)}>{convo.status}</Badge></TableCell>
                                 <TableCell>
                                    <SheetTrigger asChild>
                                        <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4"/> View</Button>
                                    </SheetTrigger>
                                    <ConversationSheet conversation={convo} username={convo.username} onConversationUpdate={handleConversationUpdate} />
                                 </TableCell>
                             </TableRow>
                         )))}
                    </TableBody>
                </Table>
            </Sheet>
        </div>
    );
};

const MembersTab = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'ascending' });
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('submissions')
        .select(`*`)
        .eq('status', 'approved')
        .order('username', { ascending: true });
      
      if (error) {
        toast({ title: 'Error fetching members', description: error.message, variant: 'destructive' });
      } else {
        setMembers(data);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [toast]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedMembers = useMemo(() => {
    let sortableItems = [...members];
    if (searchTerm) {
        sortableItems = sortableItems.filter(member => 
            member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [members, searchTerm, sortConfig]);
  
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input placeholder="Search by username or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm"/>
      </div>
      <div className="border border-black rounded-lg overflow-hidden">
        <Sheet>
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50">
                        <TableHead><Button variant="ghost" onClick={() => requestSort('username')}>Username <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                        <TableHead><Button variant="ghost" onClick={() => requestSort('full_name')}>Full Name <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                        <TableHead><Button variant="ghost" onClick={() => requestSort('email')}>Email <ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? ( <TableRow><TableCell colSpan={4} className="text-center h-24">Loading members...</TableCell></TableRow> ) : 
                    filteredAndSortedMembers.length === 0 ? ( <TableRow><TableCell colSpan={4} className="text-center h-24">No members found.</TableCell></TableRow> ) : 
                    (filteredAndSortedMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.username}</TableCell>
                          <TableCell>{member.full_name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm"><History className="mr-2 h-4 w-4"/> History</Button>
                            </SheetTrigger>
                            <MemberHistorySheet member={member} />
                          </TableCell>
                        </TableRow>
                    )))}
                </TableBody>
            </Table>
        </Sheet>
      </div>
    </>
  );
};


export const StaffDashboardPageContent = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <Tabs defaultValue="submissions">
        <TabsList className="mb-4">
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="members">Approved Members</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>
         <TabsContent value="members">
            <h2 className="text-3xl font-bold mb-4">Approved Members</h2>
            <MembersTab />
        </TabsContent>
        <TabsContent value="submissions">
            <h2 className="text-3xl font-bold mb-4">Membership Submissions</h2>
            <SubmissionsTab />
        </TabsContent>
        <TabsContent value="conversations">
            <h2 className="text-3xl font-bold mb-4">User Conversations</h2>
            <ConversationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StaffDashboard = () => {
    const { profile, loading } = useAuth();
    const [view, setView] = useState('staff');

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-white"><div className="text-xl font-semibold">Loading...</div></div>;
    }

    if (!profile || profile.role !== 'staff') {
        return <Navigate to="/dashboard" replace />;
    }

    const renderContent = () => {
        switch(view) {
            case 'staff':
                return <StaffDashboardPageContent />;
            case 'member':
                return <DashboardPageContent />;
            default:
                return <StaffDashboardPageContent />;
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Helmet>
                <title>Staff Dashboard | NPC</title>
                <meta name="description" content="View and manage community submissions for NPC." />
            </Helmet>
            <Header />
            <main className="flex-grow bg-white py-12 px-4 sm:px-6 lg:px-8">
                 <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold">Staff Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="dashboard-view" className="font-bold">Dashboard View:</Label>
                            <Select value={view} onValueChange={setView}>
                                <SelectTrigger id="dashboard-view" className="w-[180px] border-black bg-white">
                                    <SelectValue placeholder="Select a view" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="member">My Member View</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                {renderContent()}
            </main>
            <Footer />
        </div>
    );
};
export default StaffDashboard;
