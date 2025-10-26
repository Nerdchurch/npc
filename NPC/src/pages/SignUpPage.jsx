
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';
import { buttondownService } from '@/lib/buttondownService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, UploadCloud, FileText, Trash2, Eye, EyeOff } from 'lucide-react';

const SignUpPage = () => {
    const { signUp, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        birthday: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        pronouns: '',
        socialLinks: '',
        interests: '',
        message: '',
        newsletter: false,
    });
    
    const [age, setAge] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);


    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);
    
    useEffect(() => {
        if (!formData.birthday) {
            setAge(null);
            return;
        }
        
        const birthDate = new Date(formData.birthday);
        if (isNaN(birthDate.getTime())) {
            setAge(null);
            return;
        }

        const today = new Date('2025-10-25');
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }
        setAge(calculatedAge >= 0 ? calculatedAge : null);

    }, [formData.birthday]);

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

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.username) newErrors.username = 'Username is required';
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email address is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.birthday) newErrors.birthday = 'Birthday is required';
        else if (age === null || age < 13) newErrors.birthday = 'You must be at least 13 years old';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };
    
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 3) {
            setIsSubmitting(true);
            
            let resume_url = null;
            if (resumeFile) {
                setIsUploading(true);
                const fileExt = resumeFile.name.split('.').pop();
                const fileName = `${formData.username}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(fileName, resumeFile);
                
                setIsUploading(false);
                if (uploadError) {
                    toast({ variant: "destructive", title: "Resume Upload Failed", description: uploadError.message });
                    setIsSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
                resume_url = urlData.publicUrl;
            }

            const { error: signUpError } = await signUp(formData.email, formData.password, {
                data: {
                    full_name: formData.fullName,
                    username: formData.username,
                }
            });

            if (!signUpError) {
                // Handle newsletter subscription to Buttondown
                if (formData.newsletter) {
                    try {
                        const newsletterResult = await buttondownService.handleSubscription({
                            email: formData.email,
                            name: formData.fullName,
                            subscribe: true,
                            metadata: {
                                source: 'signup_form',
                                interests: formData.interests,
                                pronouns: formData.pronouns
                            }
                        });

                        if (!newsletterResult.success) {
                            console.warn('Newsletter subscription failed:', newsletterResult.error);
                            // Don't block signup if newsletter fails
                            toast({
                                title: "Note",
                                description: "Account created successfully, but newsletter subscription had an issue. You can update preferences later.",
                                variant: "default"
                            });
                        }
                    } catch (error) {
                        console.error('Newsletter subscription error:', error);
                        // Don't block signup if newsletter fails
                    }
                }

                const { error: submissionError } = await supabase.from('submissions').insert({
                    username: formData.username,
                    full_name: formData.fullName,
                    birthday: formData.birthday,
                    phone: formData.phone,
                    email: formData.email,
                    pronouns: formData.pronouns,
                    social_links: formData.socialLinks,
                    interests: formData.interests,
                    message: formData.message,
                    newsletter: formData.newsletter,
                    resume_url,
                    status: 'pending'
                });
                
                if (submissionError) {
                    toast({ variant: "destructive", title: "Submission Failed", description: submissionError.message });
                } else {
                    if (formData.newsletter) {
                        toast({
                            title: "Success!",
                            description: "Account created and subscribed to newsletter successfully!"
                        });
                    }
                    navigate('/pending');
                }
            }
            setIsSubmitting(false);
        }
    };

    const MotionDiv = ({ children }) => (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            {children}
        </motion.div>
    );

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <MotionDiv>
                        <h2 className="text-2xl font-bold text-center mb-2">Create Your Account</h2>
                        <p className="text-center text-gray-500 mb-8">Let's start with the basics.</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="username">Username</Label><Input id="username" name="username" value={formData.username} onChange={handleChange} required className={errors.username ? 'border-red-500' : ''} /><AnimatePresence>{errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}</AnimatePresence></div>
                                <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={errors.fullName ? 'border-red-500' : ''} /><AnimatePresence>{errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}</AnimatePresence></div>
                            </div>
                            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={errors.email ? 'border-red-500' : ''} /><AnimatePresence>{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}</AnimatePresence></div>
                            <div className="relative"><Label htmlFor="password">Password</Label><Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required className={errors.password ? 'border-red-500' : ''} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button><AnimatePresence>{errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}</AnimatePresence></div>
                            <div className="relative"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required className={errors.confirmPassword ? 'border-red-500' : ''} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-gray-400">{showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button><AnimatePresence>{errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}</AnimatePresence></div>
                        </div>
                    </MotionDiv>
                );
            case 2:
                return (
                    <MotionDiv>
                        <h2 className="text-2xl font-bold text-center mb-2">Tell Us More</h2>
                        <p className="text-center text-gray-500 mb-8">A few more details to complete your profile.</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="birthday">Birthday (YYYY-MM-DD)</Label>
                                    <Input id="birthday" name="birthday" type="text" placeholder="YYYY-MM-DD" value={formData.birthday} onChange={handleChange} required className={errors.birthday ? 'border-red-500' : ''} />
                                    <AnimatePresence>
                                        {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
                                        {age !== null && <p className="text-sm mt-2 text-gray-600 font-bold">Age: {age}</p>}
                                    </AnimatePresence>
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className={errors.phone ? 'border-red-500' : ''} />
                                    <AnimatePresence>{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}</AnimatePresence>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><Label htmlFor="pronouns">Pronouns</Label><Input id="pronouns" name="pronouns" value={formData.pronouns} onChange={handleChange} /></div>
                                <div><Label htmlFor="socialLinks">Social Links</Label><Input id="socialLinks" name="socialLinks" value={formData.socialLinks} onChange={handleChange} /></div>
                            </div>
                        </div>
                    </MotionDiv>
                );
            case 3:
                return (
                    <MotionDiv>
                        <h2 className="text-2xl font-bold text-center mb-2">Final Touches</h2>
                        <p className="text-center text-gray-500 mb-8">Share a bit about yourself and your interests.</p>
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="resume">Resume (Optional)</Label>
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
                            <div><Label htmlFor="interests">Interest Areas</Label><Input id="interests" name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Community Building, Event Planning, Content Creation" /></div>
                            <div><Label htmlFor="message">Message</Label><Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Tell us why you'd like to join." /></div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="newsletter" name="newsletter" checked={formData.newsletter} onCheckedChange={(checked) => setFormData(p => ({...p, newsletter: checked}))} />
                                <Label htmlFor="newsletter" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Sign up for our newsletter
                                </Label>
                            </div>
                        </div>
                    </MotionDiv>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Helmet>
                <title>Get Involved | NPC Community</title>
                <meta name="description" content="Sign up to become a member of the NPC community." />
            </Helmet>
            <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl">
                    <Link to="/" className="absolute top-8 left-8 text-xl font-bold tracking-tighter hover:opacity-75 transition-opacity">NPC</Link>
                    <div className="relative overflow-hidden border-2 border-black shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                            <motion.div 
                                className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                                animate={{ width: `${(step / 3) * 100}%` }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="p-12 space-y-8">
                            <AnimatePresence mode="wait">
                                {renderStep()}
                            </AnimatePresence>
                            <div className="flex justify-between items-center pt-8 border-t-2 border-dashed">
                                {step > 1 ? (
                                    <Button type="button" variant="outline" onClick={prevStep} className="border-black">Back</Button>
                                ) : <div/>}

                                {step < 3 ? (
                                    <Button type="button" onClick={nextStep} className="border-2 border-black bg-white text-black hover:bg-black hover:text-white">Next Step</Button>
                                ) : (
                                    <Button type="submit" disabled={isSubmitting} className="border-2 border-black bg-white text-black hover:bg-black hover:text-white">
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Complete Application'}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                     <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-black hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default SignUpPage;
