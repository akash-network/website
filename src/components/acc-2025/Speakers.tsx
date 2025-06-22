const speakers = [
  {
    name: "Greg Osuri",
    title: "CEO Overclock Labs",
    company: "Founder of Akash Network",
    image: "/images/acc-2025/speakers/greg.png",
  },
  {
    name: "Haseeb Qureshi",
    title: "Founder and Managing Partner Dragonfly",
    image: "/images/acc-2025/speakers/haseeb.png",
  },
  {
    name: "Illia Polosukhin",
    title: "Co-Founder",
    company: "Near Protocol ",
    image: "/images/acc-2025/speakers/Illia.png",
  },
  {
    name: "Javier Villamizar",
    title: "Operating Partner",
    company: "SoftBank Investment Advisers",
    image: "/images/acc-2025/speakers/javier.png",
  },
  {
    name: "Jake Brukhman",
    title: "Founder and CEO",
    company: "CoinFund",
    image: "/images/acc-2025/speakers/jake.png",
  },
  {
    name: "Chad Fowler",
    title: "CTO & General Partner",
    company: "Blueyard Capital",
    image: "/images/acc-2025/speakers/chad.png",
  },
  {
    name: "Benjamin Parr",
    title: "CoFounder",
    company: "YesNoError, Theory Forge Ventures",
    image: "/images/acc-2025/speakers/benjamin.png",
  },
  {
    name: "Mahesh Ramakrishnan",
    title: "Founder",
    company: "EV3",
    image: "/images/acc-2025/speakers/mahesh.png",
  },
  {
    name: "Bidhan Roy",
    title: "Founder and CEO",
    company: "Bagel",
    image: "/images/acc-2025/speakers/bidhan.png",
  },
  {
    name: "Abhay Kumar",
    title: "Head of Protocol",
    company: "Helium",
    image: "/images/acc-2025/speakers/abhay.png",
  },
  {
    name: "Casey Caruso",
    title: "Investor",
    company: "Topology Ventures",
    image: "/images/acc-2025/speakers/casey.png",
  },
  {
    name: "Dillon Rolnick",
    title: "COO",
    company: "Nous Research ",
    image: "/images/acc-2025/speakers/dillon.png",
  },
  {
    name: "Nirmal Krishnan",
    title: "CEO",
    company: "Chakra Labs",
    image: "/images/acc-2025/speakers/nirmal.png",
  },

  {
    name: "Brayden Levangie",
    title: "Founder and CEO",
    company: "Levangie Laboratories",
    image: "/images/acc-2025/speakers/Brayden.png",
  },
  {
    name: "Maja Vujinovic",
    title: "CEO",
    company: "OGROUP",
    image: "/images/acc-2025/speakers/maja.png",
  },
  {
    name: "Mark Palmer",
    title: "Managing Director/Senior ",
    company: "Equity Research Analyst <br/> The Benchmark Company",
    image: "/images/acc-2025/speakers/mark.png",
  },
  {
    name: "Manouk Termaaten",
    title: "Founder and CEO",
    company: "Vertical Studio BV",
    image: "/images/acc-2025/speakers/manouk.png",
  },
  {
    name: "Nick Wen",
    title: "Dev Lead",
    company: "FLock.io",
    image: "/images/acc-2025/speakers/nick.png",
  },
  {
    name: "Jason Badeaux",
    title: "Cofounder and CEO",
    company: "Daylight",
    image: "/images/acc-2025/speakers/Jason.png",
  },
  {
    name: "Tommy Eastman",
    title: "Research Lead",
    company: "Plaintext Capital",
    image: "/images/acc-2025/speakers/tommy.png",
  },
  {
    name: "Zack Abrams",
    title: "AI Video Creator",
    company: "",
    image: "/images/acc-2025/speakers/zack.png",
  },
  {
    name: "Arel Avellino",
    title: "CEO",
    company: "Passage",
    image: "/images/acc-2025/speakers/arel.png",
  },
  {
    name: "Lex Avellino",
    title: "Founder and CCO",
    company: "Passage",
    image: "/images/acc-2025/speakers/lex.png",
  },
  {
    name: "Daniel Keller",
    title: "Founder and CEO",
    company: "InFlux Technologies",
    image: "/images/acc-2025/speakers/daniel.png",
  },
  {
    name: "Conor Moore",
    title: "Co-Founder & COO",
    company: "Permian Labs",
    image: "/images/acc-2025/speakers/conor.png",
  },
];

const SpeakersContent = () => {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:gap-x-5 md:gap-y-12 lg:grid-cols-4">
      {speakers.map((speaker) => (
        <div className="flex flex-col gap-2 md:gap-3">
          <img
            src={speaker.image}
            alt={speaker.name}
            className=" aspect-[16/13.3] w-full bg-[#363636] object-cover"
          />
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium !leading-[1.2] text-foreground md:text-xl">
              {speaker.name}
            </p>
            <div className="flex flex-col ">
              <p className="text-xs font-medium !leading-[1.2] text-[#909090]  md:text-lg">
                {speaker.title}
              </p>
              {speaker.company && (
                <p
                  dangerouslySetInnerHTML={{ __html: speaker.company }}
                  className="text-xs font-medium !leading-[1.2] text-[#909090] md:text-lg"
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpeakersContent;
