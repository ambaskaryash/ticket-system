import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, FadeInStagger } from '../components/FadeIn';

const INITIAL_FAQS = [
  {
    category: 'General Account',
    items: [
      {
        q: 'How do I reset my password?',
        a: "If you've forgotten your password, click the 'Forgot Password' link on the student portal login page. An email will be sent to you with instructions to reset it. If you don't receive an email within 5 minutes, please submit a ticket.",
      },
      {
        q: 'How do I update my profile information?',
        a: "Log in to the student portal, click your avatar in the top right corner, and select 'Profile Settings'. From there, you can update your contact details, preferred name, and communication preferences.",
      },
      {
        q: 'Can I change my registered email address?',
        a: "For security reasons, changing your primary registered email requires administrator approval. Please submit a support ticket via this portal and select the 'Critical' priority to expedite the request.",
      },
    ]
  },
  {
    category: 'Course & Batches',
    items: [
      {
        q: 'How do I request a batch timing change?',
        a: "Batch change requests are evaluated based on availability. Submit a ticket specifying your current batch, the course you are enrolled in, and your preferred new timing. Allow up to 48 hours for the coordination team to process the request.",
      },
      {
        q: "What if I miss a live session?",
        a: "All live sessions are recorded and uploaded to the Learning Management System (LMS) within 12 hours of the class finishing. Navigate to the 'Recordings' tab in your course dashboard to access them.",
      },
      {
        q: 'Are certificates provided upon completion?',
        a: "Yes, verified certificates are issued automatically upon passing the final assessment and maintaining at least 85% attendance. Certificates are verifiable via block-chain based links available in your dashboard.",
      },
    ]
  },
  {
    category: 'Technical Support',
    items: [
      {
        q: 'The LMS portal is not loading for me.',
        a: "First, try clearing your browser cache and cookies, or opening the portal in Incognito/Private mode. We recommend using Google Chrome or Mozilla Firefox. If the issue persists, submit a ticket with a screenshot of any error messages.",
      },
      {
        q: 'I cannot access my course materials.',
        a: "Course materials unlock based on your enrollment date and payment status. Ensure your enrollment is fully processed. If it has been more than 24 hours since payment, please submit a ticket for our technical team.",
      },
    ]
  }
];

function AccordionItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-6 first:pt-0 last:pb-0">
      <dt>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex w-full items-start justify-between text-left text-neutral-950 transition-colors focus:outline-none"
        >
          <span className="text-base/7 font-semibold group-hover:text-blue-600 transition-colors">
            {question}
          </span>
          <span className="ml-6 flex h-7 items-center">
            <svg
              className={`size-6 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      </dt>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.dd
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-2 text-base/7 text-neutral-600 pr-12">
              {answer}
            </p>
          </motion.dd>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter FAQs based on search string
  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return INITIAL_FAQS;
    const query = searchQuery.toLowerCase();

    return INITIAL_FAQS.map(category => {
      const filteredItems = category.items.filter(item => 
        item.q.toLowerCase().includes(query) || 
        item.a.toLowerCase().includes(query)
      );
      return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white text-neutral-950">
      {/* Search Header */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#2563eb] to-[#bfdbfe] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        <div className="mx-auto max-w-2xl py-16 sm:py-24 animate-fade-in text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-6xl text-neutral-950">
            How can we help?
          </h1>
          <p className="mt-6 text-lg/8 text-neutral-600">
            Search our knowledge base for quick answers to common questions about your account, courses, and technical issues.
          </p>

          <div className="mt-10 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="size-5 text-neutral-400 group-focus-within:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-full border-0 py-3.5 pl-11 pr-4 text-neutral-950 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm/6 transition-all bg-white/80 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24 sm:pb-32">
        {filteredFaqs.length === 0 ? (
          <FadeIn>
            <div className="text-center py-20">
              <span className="flex size-16 mx-auto items-center justify-center rounded-full bg-neutral-100 mb-4">
                <svg className="size-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <h3 className="font-display text-lg font-semibold text-neutral-950">No results found</h3>
              <p className="mt-1 text-sm text-neutral-600">We couldn't find any articles matching "{searchQuery}".</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 font-semibold text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Clear search
              </button>
            </div>
          </FadeIn>
        ) : (
          <FadeInStagger className="mx-auto max-w-4xl divide-y divide-neutral-950/10">
            {filteredFaqs.map((category) => (
              <FadeIn key={category.category} className="py-10 first:pt-0">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950 mb-8">
                  {category.category}
                </h2>
                <dl className="divide-y divide-neutral-950/10">
                  {category.items.map((faq) => (
                    <AccordionItem key={faq.q} question={faq.q} answer={faq.a} />
                  ))}
                </dl>
              </FadeIn>
            ))}
          </FadeInStagger>
        )}

        {/* Still Need Help Banner CTA */}
        <FadeIn className="mx-auto max-w-4xl mt-16 sm:mt-24">
          <div className="relative isolate overflow-hidden bg-neutral-950 px-6 py-12 rounded-3xl sm:px-12 sm:py-16 lg:flex lg:items-center lg:gap-x-12">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.neutral.800),theme(colors.neutral.950))] opacity-50" />
            <div className="flex-1 max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Still need help?
              </h2>
              <p className="mt-4 text-neutral-300 text-sm/6">
                Can't find the answer you're looking for? Our support team is ready to help you with your specific issues.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-x-4 lg:mt-0 lg:shrink-0">
              <Link
                to="/submit"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 shadow-sm hover:bg-neutral-100 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Submit a Ticket
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
