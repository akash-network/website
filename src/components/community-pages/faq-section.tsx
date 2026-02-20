import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";

const faqItems = [
    {
        question: "Do I have to contribute to join Akash Club?",
        answer:
            "No. We'd love every member to contribute, but we understand not everyone has the time. Everyone is welcome to join our events, learn alongside us, and connect with the core community without completing contribution missions.",
    },
    {
        question: "What if I'm not technical?",
        answer:
            "Perfect. We need content creators, community advocates, social media voices, and people who can explain Akash to non-technical audiences. Technical contributions are important, but so is everything else that drives adoption.",
    },
    {
        question: "Can I contribute if I'm not part of Akash Club?",
        answer: `Content contributions are reserved for Akash Insiders, who receive proper training before creating materials for the network. We induct new Insiders four times a year.\nClick here to join our start-list.\n\nTechnical contributions are open to all developers. We provide optional training modules to help you get up to speed and fill in any gaps you may have missed surrounding the Akash ecosystem.\n\nSocial campaigns (rewarded with Club Points) are open to all Club members through Discord.\nPoints can be redeemed to purchase additional raffle tickets, and/or cool Akash swag from the official shop.`,
    },
];

export function FAQSection() {
    return (
        <section className="px-6 py-20 md:px-10 md:py-[120px] lg:px-[400px]">
            <div className="mx-auto max-w-[913px]">
                <h2 className="mb-12 text-center text-2xl font-bold  md:text-[36px]">
                    Frequently asked questions
                </h2>
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, i) => (
                        <AccordionItem
                            key={i}
                            value={`faq-${i}`}
                            className="border-b border-[#e5e5e5] dark:border-defaultBorder"
                        >
                            <AccordionTrigger className="flex w-full cursor-pointer items-center justify-between py-4 text-left text-base font-medium  no-underline">
                                <span>{item.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 text-sm leading-5 text-[#737373] dark:text-para whitespace-pre-line">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}