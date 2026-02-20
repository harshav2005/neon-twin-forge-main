// src/pages/SurveyPage.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimeButton } from "@/components/ui/anime-button";
import { AnimeInput } from "@/components/ui/anime-input";
import { GlassCard } from "@/components/ui/glass-card";
import api from "@/services/api";

// --- 17 SECTIONS OF EXPANDED SURVEY QUESTIONS ---
const surveyStructure = [
    {
        title: "1. BASIC IDENTITY DETAILS", category: "Identity",
        questions: [
            { id: 'id_1', label: 'Full Name', type: 'text', required: true },
            { id: 'id_2', label: 'Nickname (if any)', type: 'text', required: false },
            { id: 'id_3', label: 'Age', type: 'number', required: true },
            { id: 'id_4', label: 'Gender', type: 'text', required: true },
            { id: 'id_5', label: 'City', type: 'text', required: true },
            { id: 'id_6', label: 'Relationship Status', type: 'text', required: false },
            { id: 'id_7', label: 'Date of Birth (YYYY-MM-DD)', type: 'text', required: true },
            { id: 'id_8', label: 'Nationality', type: 'text', required: true },
            { id: 'id_9', label: 'Education Level', type: 'text', required: true },
            { id: 'id_10', label: 'Current Industry/Field of Study', type: 'text', required: true },
            { id: 'id_11', label: 'Primary language spoken at home', type: 'text', required: true },
        ]
    },
    {
        title: "2. PHYSICAL & HEALTH PROFILE", category: "Health",
        questions: [
            { id: 'ph_1', label: 'Height (cm or inches)', type: 'text', required: false },
            { id: 'ph_2', label: 'Weight (kg or lbs)', type: 'number', required: false },
            { id: 'ph_3', label: 'Sleep Duration (hours/day)', type: 'number', required: true },
            { id: 'ph_4', label: 'Daily Energy Level (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'ph_5', label: 'Any long-term health conditions', type: 'text', required: false },
            { id: 'ph_6', label: 'Sleep Quality (Rating 1-5, 5 being best)', type: 'number', min: 1, max: 5, required: true },
            { id: 'ph_7', label: 'Physical Activity (Hours per week)', type: 'number', required: true },
            { id: 'ph_8', label: 'Caffeine/Stimulant consumption (Cups per day)', type: 'number', required: true },
            { id: 'ph_9', label: 'Mental alertness is highest (Morning/Afternoon/Evening)', type: 'text', required: true },
            { id: 'ph_10', label: 'How often do you eat meals alone (Days per week)?', type: 'number', required: true },
            { id: 'ph_11', label: 'Rate your typical stress level (1-10)', type: 'number', min: 1, max: 10, required: true },
        ]
    },
    {
        title: "3. DAILY ROUTINE & HABITS", category: "Routine",
        questions: [
            { id: 'dr_1', label: 'Morning routine description', type: 'textarea', required: true },
            { id: 'dr_2', label: 'Work/study hours per day', type: 'number', required: true },
            { id: 'dr_3', label: 'Procrastination level (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'dr_4', label: 'Weekend routine pattern', type: 'textarea', required: false },
            { id: 'dr_5', label: 'Social activity level (Low, Moderate, High)', type: 'text', required: true },
            { id: 'dr_6', label: 'Average screen time per day (hours)', type: 'number', required: true },
            { id: 'dr_7', label: 'Best productivity time (Morning / Afternoon / Night)', type: 'text', required: true },
            { id: 'dr_8', label: 'How structured is your weekly schedule (1=Chaos, 10=Rigid)?', type: 'number', min: 1, max: 10, required: true },
            { id: 'dr_9', label: 'Do you check your phone immediately upon waking (Yes/No)?', type: 'text', required: true },
            { id: 'dr_10', label: 'Favorite leisure activity that doesn\'t involve a screen', type: 'text', required: false },
            { id: 'dr_11', label: 'Average time spent socializing after work/study (Hours)', type: 'number', required: true },
        ]
    },
    {
        title: "4. PERSONALITY TRAITS (CORE TWIN BRAIN)", category: "Personality",
        questions: [
            { id: 'pt_1', label: 'Introvert ↔ Extrovert (1=Introvert, 10=Extrovert)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_2', label: 'Emotional ↔ Logical (1=Emotional, 10=Logical)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_3', label: 'Risk-Averse ↔ Risk-Taker (1=Averse, 10=Taker)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_4', label: 'Fast decision maker ↔ Over-thinker (1=Fast, 10=Over-thinker)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_5', label: 'How would close friends describe your personality?', type: 'textarea', required: true },
            { id: 'pt_6', label: 'Detail-Oriented ↔ Big-Picture Focused (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_7', label: 'Optimistic ↔ Pessimistic (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_8', label: 'Flexible ↔ Stubborn (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_9', label: 'Creative ↔ Practical (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_10', label: 'How often do you seek novelty or change (1—10)?', type: 'number', min: 1, max: 10, required: true },
            { id: 'pt_11', label: 'How quickly do you trust strangers (1—10)?', type: 'number', min: 1, max: 10, required: true },
        ]
    },
    {
        title: "5. EMOTIONAL & PSYCHOLOGICAL PROFILE", category: "Emotional",
        questions: [
            { id: 'em_1', label: 'What stresses you the most?', type: 'textarea', required: true },
            { id: 'em_2', label: 'How do you react to failure?', type: 'text', required: true },
            { id: 'em_3', label: 'How long to recover from setbacks (hours/days)?', type: 'text', required: true },
            { id: 'em_4', label: 'Anger control level (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'em_5', label: 'What motivates you the most?', type: 'text', required: true },
            { id: 'em_6', label: 'Primary source of daily energy', type: 'text', placeholder: 'People/Solitude/Goal achievement', required: true },
            { id: 'em_7', label: 'Feeling when someone cancels plans last minute', type: 'text', required: true },
            { id: 'em_8', label: 'What is your primary coping mechanism for stress?', type: 'textarea', required: true },
            { id: 'em_9', label: 'How often do you reflect on your feelings (Daily/Weekly/Rarely)?', type: 'text', required: true },
            { id: 'em_10', label: 'What demotivates you instantly?', type: 'text', required: true },
        ]
    },
    {
        title: "6. DECISION MAKING STYLE", category: "Decision",
        questions: [
            { id: 'dm_1', label: 'Do you decide based primarily on?', type: 'text', placeholder: 'Logic/Emotions/Gut feeling', required: true },
            { id: 'dm_2', label: 'When making big decisions, you:', type: 'text', placeholder: 'Decide quickly/Take days/Overthink for weeks', required: true },
            { id: 'dm_3', label: 'When stuck, you prefer:', type: 'text', placeholder: 'Safe option/High-risk high-reward', required: true },
            { id: 'dm_4', label: 'What information do you prioritize? (Data / Social Impact / Speed)', type: 'text', required: true },
            { id: 'dm_5', label: 'Do you regret decisions often (Yes/No)?', type: 'text', required: true },
            { id: 'dm_6', label: 'How much do deadlines influence decision speed (1—10)?', type: 'number', min: 1, max: 10, required: true },
            { id: 'dm_7', label: 'How often do you regret major financial decisions (Never/Sometimes/Often)?', type: 'text', required: false },
        ]
    },
    {
        title: "7. COMMUNICATION STYLE", category: "Communication",
        questions: [
            { id: 'co_1', label: 'Your communication tone (Polite/Direct/Soft/Dominating)', type: 'text', required: true },
            { id: 'co_2', label: 'Do you prefer talking or texting?', type: 'text', required: true },
            { id: 'co_3', label: 'Do you avoid conflicts or face them?', type: 'text', required: true },
            { id: 'co_4', label: 'Preferred level of detail (Brief / Detailed)', type: 'text', required: true },
            { id: 'co_5', label: 'When communicating bad news, are you (Direct / Softened)?', type: 'text', required: true },
            { id: 'co_6', label: 'Do you use emojis/sarcasm frequently (Yes/No)?', type: 'text', required: true },
            { id: 'co_7', label: 'How important is clarity versus tactfulness (1—10, 10=Clarity)?', type: 'number', min: 1, max: 10, required: true },
        ]
    },
    {
        title: "8. SKILLS & ABILITIES", category: "Skills",
        questions: [
            { id: 'sk_1', label: 'Technical skills (list)', type: 'text', required: false },
            { id: 'sk_2', label: 'Soft skills (list)', type: 'text', required: true },
            { id: 'sk_3', label: 'Leadership ability (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sk_4', label: 'Problem-solving ability (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sk_5', label: 'Learning speed (Slow/Medium/Fast)', type: 'text', required: true },
            { id: 'sk_6', label: 'Time Management skills (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sk_7', label: 'Technical skills (Specific software/languages, list them)', type: 'textarea', required: true },
            { id: 'sk_8', label: 'Public speaking confidence (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sk_9', label: 'Adaptability/Flexibility score (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sk_10', label: 'How quickly do you learn complex concepts (1—10)?', type: 'number', min: 1, max: 10, required: true },
        ]
    },
    {
        title: "9. EDUCATION & CAREER GOALS", category: "Career",
        questions: [
            { id: 'cg_1', label: 'Highest qualification', type: 'text', required: true },
            { id: 'cg_2', label: 'Current role', type: 'text', required: true },
            { id: 'cg_3', label: 'Dream job', type: 'text', required: false },
            { id: 'cg_4', label: 'Income target (5 yrs)', type: 'text', required: false },
            { id: 'cg_5', label: 'Willingness to take career risks (Yes/No)', type: 'text', required: true },
            { id: 'cg_6', label: 'Do you prefer (Job / Business / Freelancing)?', type: 'text', required: true },
            { id: 'cg_7', label: 'Willingness to relocate for career (Yes/No)', type: 'text', required: true },
            { id: 'cg_8', label: 'What aspect of your career brings the most satisfaction?', type: 'textarea', required: true },
            { id: 'cg_9', label: 'Do you value money or impact more in a job (1—10, 10=Impact)?', type: 'number', min: 1, max: 10, required: true },
        ]
    },
    {
        title: "10. FINANCIAL BEHAVIOR", category: "Financial",
        questions: [
            { id: 'fi_1', label: 'Monthly income range', type: 'text', required: false },
            { id: 'fi_2', label: 'Savings habit (Poor, Average, Excellent)', type: 'text', required: true },
            { id: 'fi_3', label: 'Spending style (Careful / Impulsive)', type: 'text', required: true },
            { id: 'fi_4', label: 'Financial risk tolerance (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'fi_5', label: 'Investment knowledge (Beginner / Intermediate / Advanced)', type: 'text', required: true },
            { id: 'fi_6', label: 'Debt status (Yes/No)', type: 'text', required: true },
            { id: 'fi_7', label: 'Spending driven by (Need / Desire / Investment)?', type: 'text', required: true },
            { id: 'fi_8', label: 'How often do you track expenses (Weekly/Monthly/Never)?', type: 'text', required: true },
        ]
    },
    {
        title: "11. SOCIAL & RELATIONSHIP PATTERN", category: "Social",
        questions: [
            { id: 'so_1', label: 'Number of close friends', type: 'number', required: false },
            { id: 'so_2', label: 'Trust level in people (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'so_3', label: 'Relationship priority in life (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'so_4', label: 'Family influence in decisions (Low, Moderate, High)', type: 'text', required: true },
            { id: 'so_5', label: 'How you handle conflicts (Avoid, Mediate, Confront)', type: 'text', required: true },
            { id: 'so_6', label: 'How often do you initiate social plans (1—10)?', type: 'number', min: 1, max: 10, required: true },
            { id: 'so_7', label: 'Do you prefer group settings or one-on-one time?', type: 'text', required: true },
        ]
    },
    {
        title: "12. MORALS, VALUES & BELIEFS", category: "Morals",
        questions: [
            { id: 'mo_1', label: 'What values do you never compromise on? (List 3)', type: 'textarea', required: true },
            { id: 'mo_2', label: 'Is success more important than happiness (Yes/No)?', type: 'text', required: true },
            { id: 'mo_3', label: 'How important is money vs peace (1—10, 10=Peace)', type: 'number', min: 1, max: 10, required: true },
            { id: 'mo_4', label: 'Would you sacrifice comfort for purpose (Yes/No)?', type: 'text', required: true },
            { id: 'mo_5', label: 'Do you believe people are inherently good or bad (1—10, 10=Good)?', type: 'number', min: 1, max: 10, required: true },
        ]
    },
    {
        title: "13. FEARS, WEAKNESSES & LIMITATIONS", category: "Weakness",
        questions: [
            { id: 'wk_1', label: 'Biggest fear', type: 'text', required: true },
            { id: 'wk_2', label: 'Biggest weakness', type: 'text', required: true },
            { id: 'wk_3', label: 'What makes you give up?', type: 'text', required: true },
            { id: 'wk_4', label: 'What situation makes you feel most confused?', type: 'text', required: true },
            { id: 'wk_5', label: 'What drains your energy the most?', type: 'text', required: true },
            { id: 'wk_6', label: 'How do you handle uncertainty (Embrace/Avoid/Plan excessively)?', type: 'text', required: true },
            { id: 'wk_7', label: 'Are you naturally disciplined or need external accountability?', type: 'text', required: true },
        ]
    },
    {
        title: "14. DREAMS, DESIRES & LIFE VISION", category: "Vision",
        questions: [
            { id: 'vs_1', label: 'Biggest life dream', type: 'text', required: true },
            { id: 'vs_2', label: 'Meaning of success to you', type: 'text', required: true },
            { id: 'vs_3', label: 'Your version of a perfect life', type: 'textarea', required: true },
            { id: 'vs_4', label: 'What do you want to be remembered for?', type: 'text', required: true },
            { id: 'vs_5', label: 'Your version of a perfect day (Describe briefly)', type: 'textarea', required: true },
            { id: 'vs_6', label: 'If money were not an issue, what would you spend most time doing?', type: 'textarea', required: true },
            { id: 'vs_7', label: 'Long-term goal focused on personal growth', type: 'textarea', required: true },
        ]
    },
    {
        title: "15. FAILURE HISTORY & TRAUMA (Optional)", category: "Failure",
        questions: [
            { id: 'fa_1', label: 'Biggest failure in life', type: 'textarea', required: false },
            { id: 'fa_2', label: 'Lesson learned from it', type: 'textarea', required: false },
            { id: 'fa_3', label: 'Any regret that still affects your decisions (Yes/No)?', type: 'text', required: false },
            { id: 'fa_4', label: 'How did your biggest failure change your approach to risk?', type: 'textarea', required: false },
            { id: 'fa_5', label: 'What is one past decision you still regret?', type: 'textarea', required: false },
        ]
    },
    {
        title: "16. MEMORY & FILE UPLOAD SECTION (Text Only)", category: "Memory",
        questions: [
            { id: 'me_1', label: 'Personal journal summary/excerpt', type: 'textarea', required: false },
            { id: 'me_2', label: 'Motivational notes/quotes', type: 'textarea', required: false },
            { id: 'me_3', label: 'Dream visualization notes', type: 'textarea', required: false },
            { id: 'me_4', label: 'Summary of any daily affirmations or mantras you use', type: 'textarea', required: false },
            { id: 'me_5', label: 'Any recurring thoughts or obsessions (Briefly describe)', type: 'textarea', required: false },
        ]
    },
    {
        title: "17. SELF-RATING SUMMARY", category: "SelfRating",
        questions: [
            { id: 'sr_1', label: 'Overall confidence (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sr_2', label: 'Emotional intelligence (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sr_3', label: 'Logical intelligence (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sr_4', label: 'Stress tolerance (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sr_5', label: 'Decision stability (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sr_6', label: 'Social intelligence (1—10)', type: 'number', min: 1, max: 10, required: true },
            { id: 'sr_7', label: 'Adaptability score (1—10)', type: 'number', min: 1, max: 10, required: true },
        ]
    },
];

export default function SurveyPage() {
    const navigate = useNavigate();
    const [responses, setResponses] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (id: string, value: string | number) => {
        // Basic validation for number types
        if (typeof value === 'string' && value.trim() === '') {
            setResponses(prev => ({ ...prev, [id]: '' }));
            return;
        }

        setResponses(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check for required questions
        const requiredQuestions = surveyStructure.flatMap(s => s.questions.filter(q => q.required));
        const answeredCount = requiredQuestions.filter(q => responses[q.id] !== undefined && responses[q.id] !== '').length;

        if (answeredCount < requiredQuestions.length) {
            alert(`Please answer all ${requiredQuestions.length} required questions before submitting.`);
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            const res = await api.post("/survey/submit", { responses });

            if (res.status === 200 || res.status === 201) {
                alert("Survey successfully submitted! Welcome to your Digital Twin.");
                navigate("/dashboard");
            } else {
                alert(`Submission failed: ${res.data.error}`);
            }
        } catch (error) {
            alert("Network error: Could not submit survey.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Total required count check for display purposes
    const totalRequiredCount = surveyStructure.flatMap(s => s.questions.filter(q => q.required)).length;
    const answeredRequiredCount = surveyStructure.flatMap(s => s.questions.filter(q => q.required)).filter(q => responses[q.id] !== undefined && responses[q.id] !== '').length;


    return (
        <div className="min-h-screen bg-background pt-16">
            <main className="container mx-auto px-4 py-12">

                {/* --- GO BACK BUTTON / HOME LINK --- */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
                {/* --------------------------------- */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        <span className="neon-text">Initial Twin Setup</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        This required survey builds the foundation of your Digital Twin's personality and knowledge base.
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <GlassCard className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
                        {surveyStructure.map((section, sectionIndex) => (
                            <div key={section.title} className="space-y-4">
                                <h2 className="text-xl font-display font-semibold text-primary/80 border-b border-border/50 pb-2">
                                    {section.title}
                                    {section.questions.some(q => !q.required) && (
                                        <span className="text-sm text-muted-foreground ml-2">(Some optional fields)</span>
                                    )}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {section.questions.map((q) => (
                                        <div key={q.id}>
                                            <AnimeInput
                                                label={`${q.label}${q.required ? ' *' : ''}`}
                                                type={q.type}
                                                // Handle Textarea or regular Input
                                                {...(q.type === 'textarea' ? { as: 'textarea', rows: 3 } : {})}
                                                // Handle number constraints
                                                {...(q.type === 'number' && q.min !== undefined ? { min: q.min } : {})}
                                                {...(q.type === 'number' && q.max !== undefined ? { max: q.max } : {})}

                                                placeholder={`Enter ${q.label}`}
                                                onChange={(e) => handleInputChange(q.id, e.target.value)}
                                                required={q.required}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-6 text-center">
                            <p className="text-sm text-muted-foreground mb-3">
                                {answeredRequiredCount} / {totalRequiredCount} required questions answered
                            </p>
                            <AnimeButton
                                type="submit"
                                variant="neon"
                                size="lg"
                                className="w-full sm:w-1/2"
                                disabled={isSubmitting || answeredRequiredCount < totalRequiredCount}
                            >
                                {isSubmitting ? (
                                    <motion.div
                                        className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                ) : (
                                    <>
                                        Submit & Launch Twin <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </AnimeButton>
                        </div>
                    </GlassCard>
                </form>
            </main>
        </div>
    );
}