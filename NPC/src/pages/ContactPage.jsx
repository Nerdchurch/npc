
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UploadCloud, FileText, Trash2 } from 'lucide-react';

const ContactPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        pronouns: '',
        socialLinks: '',
        interests: '',
        message: '',
        newsletter: false,
    });
    
    const [resumeFile, setResumeFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFile(file);
        }
    };
    
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            
            let resume_url = null;
            if (resumeFile) {
                setIsUploading(true);
                const fileExt = resumeFile.name.split('.').pop();
                const fileName = `${formData.username || 'contact'}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(fileName, resumeFile);
                
                setIsUploading(false);
                if (uploadError) {
                    toast({ variant: "destructive", title: "File Upload Failed", description: uploadError.message });
                    setIsSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
                resume_url = urlData.publicUrl;
            }

            const { error: submissionError } = await supabase.from('submissions').insert({
                username: formData.username || 'N/A',
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                pronouns: formData.pronouns,
                social_links: formData.socialLinks,
                interests: formData.interests,
                message: formData.message,
                newsletter: formData.newsletter,
                resume_url,
                status: 'contact_inquiry'
            });
            
            if (submissionError) {
                toast({ variant: "destructive", title: "Submission Failed", description: submissionError.message });
            } else {
                toast({ title: "Message Sent!", description: "Thank you for reaching out. We'll be in touch soon." });
                navigate('/');
            }
            
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | NPC Community</title>
                <meta name="description" content="Get in touch with the NPC team for partnerships, questions, or resource suggestions." />
            </Helmet>
            <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl">
                    <Link to="/" className="absolute top-8 left-8 text-xl font-bold tracking-tighter hover:opacity-75 transition-opacity">NPC</Link>
                    <div className="relative overflow-hidden border-2 border-black shadow-lg">
                        <form onSubmit={handleSubmit} className="p-12 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            >
                                <h2 className="text-2xl font-bold text-center mb-2">Get In Touch</h2>
                                <p className="text-center text-gray-500 mb-8">Have a question, a resource to share, or want to partner? Drop us a line.</p>
                                <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={errors.fullName ? 'border-red-500' : ''} /><AnimatePresence>{errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}</AnimatePresence></div>
                                        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={errors.email ? 'border-red-500' : ''} /><AnimatePresence>{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</AnimatePresence></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><Label htmlFor="username">Username (Optional)</Label><Input id="username" name="username" value={formData.username} onChange={handleChange} /></div>
                                        <div><Label htmlFor="phone">Phone (Optional)</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} /></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div><Label htmlFor="pronouns">Pronouns (Optional)</Label><Input id="pronouns" name="pronouns" value={formData.pronouns} onChange={handleChange} /></div>
                                        <div><Label htmlFor="socialLinks">Social Links (Optional)</Label><Input id="socialLinks" name="socialLinks" value={formData.socialLinks} onChange={handleChange} /></div>
                                    </div>
                                    <div>
                                        <Label htmlFor="resume">Attach a File (Optional)</Label>
                                        <div 
                                            className="mt-2 flex justify-center items-center w-full h-40 px-6 pt-5 pb-6 border-2 border-black border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('resume-upload').click()}
                                        >
                                            <div className="space-y-1 text-center">
                                                <AnimatePresence>
                                                {resumeFile ? (
                                                    <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}} className="flex flex-col items-center gap-2">
                                                        <FileText className="h-12 w-12 text-black" />
                                                        <span className="font-medium text-black">{resumeFile.name}</span>
                                                        <Button variant="destructive" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                                                        </Button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div initial={{scale:0.5, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.5, opacity:0}} className="flex flex-col items-center">
                                                        <UploadCloud className="h-12 w-12 text-gray-400" />
                                                        <p className="text-sm text-gray-500">
                                                            <span className="font-semibold text-black">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>
                                                    </motion.div>
                                                )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        <input id="resume-upload" name="resume" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                    </div>
                                    <div><Label htmlFor="interests">Interest Areas (Optional)</Label><Input id="interests" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Partnership, Volunteering, Resource Suggestion" /></div>
                                    <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="How can we help?" required/></div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="newsletter" name="newsletter" checked={formData.newsletter} onCheckedChange={(checked) => setFormData(p => ({...p, newsletter: checked}))} />
                                        <Label htmlFor="newsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Sign up for our newsletter
                                        </Label>
                                    </div>
                                </div>
                            </motion.div>
                            <div className="flex justify-end items-center pt-8 border-t-2 border-dashed">
                                <Button type="submit" disabled={isSubmitting} className="border-2 border-black bg-white text-black hover:bg-black hover:text-white">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : 'Send Message'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage;
