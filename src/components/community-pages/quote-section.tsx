export function QuoteSection() {
    return (
        <section className="border-y border-[#e4e4e7] dark:border-defaultBorder bg-[#fafafa] dark:bg-background2 px-6 py-20 md:px-10 md:py-[120px]">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
                <blockquote className="text-center font-instrument italic leading-relaxed text-[#111827] dark:text-foreground text-[32px] lg:text-[48px] lg:leading-[1.3]">
                    "Bull market, bear market, it doesn&apos;t matter.
                    495 open-source contributors averaging 67 commits per week build Akash regardless of market conditions. Akash is the People&apos;s Supercloud and I&apos;m credibly proud of the $AKT community."
                </blockquote>
                <div className="flex flex-col items-center">
                    <p className="text-lg font-semibold text-[#111827] dark:text-foreground">Greg Osuri</p>
                    <p className="text-center text-sm md:text-base text-[#71717a] dark:text-para">
                        Founder of Akash
                        <br />
                        Overclock Labs CEO
                    </p>
                </div>
            </div>
        </section>
    );
}