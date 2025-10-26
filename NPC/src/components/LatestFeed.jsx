
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, Bookmark, Star, BookOpenCheck, Settings2 } from 'lucide-react';

const sourceMapping = {
  'beacon.nerdguild.org': { name: 'The Beacon Project', path: '/projects/the-beacon-project' },
  'nerd.church': { name: 'Nerd Church', path: '/projects/nerd-church' },
  'rar.nerdguild.org': { name: 'Roots & Reach', path: '/projects/roots-and-reach' },
  'hieroscope.com': { name: 'Hieroscope', path: '/projects/hieroscope' },
};
const sources = Object.keys(sourceMapping);

export const LatestFeed = ({ userFeed = false, filter = 'all' }) => {
  const [posts, setPosts] = useState([]);
  const [userPostData, setUserPostData] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('newest');
  const [excludedSources, setExcludedSources] = useState([]);
  const [openAccordionId, setOpenAccordionId] = useState(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke('fetch-wordpress-posts');
    
    if (error) {
      console.error('Error fetching posts:', error);
      setError('Could not load the latest posts. Please try again later.');
      setPosts([]);
    } else {
      setPosts(data);
    }
    setLoading(false);
  }, []);

  const fetchUserPostData = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from('user_post_status').select('*').eq('user_id', user.id);
    if (!error) {
      const dataMap = new Map();
      data.forEach(item => dataMap.set(item.post_guid, item));
      setUserPostData(dataMap);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
    if (user) {
      fetchUserPostData();
    }
  }, [fetchPosts, user, fetchUserPostData]);

  const handleSourceToggle = (source) => {
    setExcludedSources(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
  };

  const handleInteraction = async (post, interactionType) => {
    if (!user) {
        toast({ 
            title: "Join Us!", 
            description: "Please log in or sign up to save posts.",
            action: (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => navigate('/login')}>Log In</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate('/signup')}>Sign Up</Button>
                </div>
            )
        });
        return;
    }

    const post_guid = `${post.source}::${post.id}`;
    const currentStatus = userPostData.get(post_guid) || {};
    const newStatus = { ...currentStatus, [interactionType]: !currentStatus[interactionType] };
    
    const { data, error } = await supabase.from('user_post_status').upsert({
        user_id: user.id,
        post_guid: post_guid,
        ...newStatus
    }, { onConflict: 'user_id, post_guid' }).select().single();

    if (error) {
        toast({ title: "Error", description: `Could not update post status. ${error.message}`, variant: "destructive" });
    } else {
        toast({ title: "Success", description: `Post status updated!` });
        setUserPostData(prev => new Map(prev).set(post_guid, data));
    }
  };

  const filteredAndSortedPosts = useMemo(() => {
    let items = posts.filter(post => !excludedSources.includes(post.source));

    if(userFeed) {
        if(filter === 'unread') {
            items = items.filter(post => !userPostData.get(`${post.source}::${post.id}`)?.is_read);
        } else if (filter === 'favorited') {
            items = items.filter(post => userPostData.get(`${post.source}::${post.id}`)?.is_favorited);
        } else if (filter === 'read_later') {
            items = items.filter(post => userPostData.get(`${post.source}::${post.id}`)?.is_read_later);
        }
    }

    return items.sort((a, b) => {
      if (sort === 'newest') return new Date(b.date) - new Date(a.date);
      if (sort === 'oldest') return new Date(a.date) - new Date(b.date);
      // 'featured' sorting logic can be added here if there's a featured flag
      return 0;
    });
  }, [posts, excludedSources, sort, userFeed, filter, userPostData]);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getSourceInfo = (source) => sourceMapping[source] || { name: source, path: '#' };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="featured" disabled>Featured</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto"><Settings2 className="mr-2 h-4 w-4"/>Filter Feeds</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
             <div className="grid gap-4">
              <div className="space-y-2"><h4 className="font-medium leading-none">Feeds</h4><p className="text-sm text-muted-foreground">Select which feeds to include.</p></div>
              <div className="grid gap-2">
                {sources.map(source => (
                  <div key={source} className="flex items-center space-x-2">
                    <Checkbox id={source} checked={!excludedSources.includes(source)} onCheckedChange={() => handleSourceToggle(source)} />
                    <Label htmlFor={source}>{sourceMapping[source].name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {loading && <div className="flex justify-center items-center h-40"><Loader2 className="h-12 w-12 animate-spin" /></div>}
      {error && !loading && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md"><p>{error}</p></div>}
      
      {!loading && !error && filteredAndSortedPosts.length > 0 && (
        <Accordion type="single" collapsible className="w-full" value={openAccordionId} onValueChange={setOpenAccordionId}>
          {filteredAndSortedPosts.map((post, index) => {
            const sourceInfo = getSourceInfo(post.source);
            const post_guid = `${post.source}::${post.id}`;
            const status = user ? userPostData.get(post_guid) || {} : {};
            const isAccordionOpen = openAccordionId === post_guid;

            return (
              <motion.div key={post_guid} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}>
                <AccordionItem value={post_guid} className="border rounded-lg mb-4 shadow-sm overflow-hidden">
                  <AccordionTrigger className="w-full text-left p-4 hover:bg-gray-50 focus:outline-none data-[state=open]:bg-gray-50 group">
                    <div className="flex-1 pr-4">
                      <div className="text-xs mb-2 text-gray-500 flex items-center">
                        <span>{formatDate(post.date)}</span>
                        <span className="mx-2">&bull;</span>
                        <Link to={sourceInfo.path} className="hover:underline focus:underline" onClick={(e) => e.stopPropagation()}>{sourceInfo.name}</Link>
                      </div>
                      <h3 className="text-lg font-semibold mb-1 leading-tight text-gray-900 group-hover:text-black">{post.title}</h3>
                      <p className={`text-sm leading-relaxed text-gray-700 ${isAccordionOpen ? '' : 'line-clamp-2'}`}>{post.excerpt}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 bg-white">
                    <div className="text-sm leading-relaxed text-gray-800 mb-4" dangerouslySetInnerHTML={{ __html: post.body }} />
                    <div className="flex flex-wrap items-center justify-end gap-4">
                        {user ? (
                             <div className="flex items-center gap-2">
                                <Button size="sm" variant={status.is_favorited ? "default" : "outline"} onClick={() => handleInteraction(post, 'is_favorited')}>
                                    <Star className={`mr-2 h-4 w-4 ${status.is_favorited ? 'text-yellow-400 fill-yellow-400' : ''}`} /> Favorite
                                </Button>
                                <Button size="sm" variant={status.is_read_later ? "default" : "outline"} onClick={() => handleInteraction(post, 'is_read_later')}>
                                    <Bookmark className={`mr-2 h-4 w-4 ${status.is_read_later ? 'fill-current' : ''}`} /> Read Later
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleInteraction(post, 'is_read')}>
                                    <BookOpenCheck className="mr-2 h-4 w-4" /> Mark Read
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="default" onClick={() => navigate('/login')}>
                                    Log In
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => navigate('/signup')}>
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            )
          })}
        </Accordion>
      )}
      
      {!loading && !error && filteredAndSortedPosts.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          <h3 className="text-xl font-semibold">No Posts Found</h3>
          <p>Try adjusting your filters or check back later!</p>
        </div>
      )}
    </div>
  );
};
