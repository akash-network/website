import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const CompletedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
      className="fill-[#D1FAE5] dark:fill-[#065F46]"
    />
    <path
      d="M8 13L8.72288 14.5406C9.29577 15.7616 11.0061 15.832 11.6773 14.6621L15.5 8"
      className="stroke-[#065F46] dark:stroke-[#D1FAE5]"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InProgressIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 12C0 8.91325 1.16546 6.09871 3.08034 3.97241C5.27682 1.53343 8.45933 0 12 0C18.6274 0 24 5.37258 24 12C24 15.0073 22.8938 17.7562 21.066 19.8621C18.8658 22.397 15.6201 24 12 24C5.37258 24 0 18.6274 0 12Z"
      className="fill-[#FEF3C7] dark:fill-[#92400E]"
    />
    <g clipPath="url(#clip0_16_724)">
      <path
        d="M11.9999 5.33334V8.00001M11.9999 16V18.6667M7.28659 7.28668L9.17325 9.17334M14.8266 14.8267L16.7133 16.7133M5.33325 12H7.99992M15.9999 12H18.6666M7.28659 16.7133L9.17325 14.8267M14.8266 9.17334L16.7133 7.28668"
        className="stroke-[#92400E] dark:stroke-[#FEF3C7]"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_16_724">
        <rect width="16" height="16" fill="white" transform="translate(4 4)" />
      </clipPath>
    </defs>
  </svg>
);

const RoadmapTooltip = ({ isCompleted }: { isCompleted: boolean }) => {
  return (
    <HoverCard openDelay={500}>
      <HoverCardTrigger>
        {isCompleted ? <CompletedIcon /> : <InProgressIcon />}
      </HoverCardTrigger>
      <HoverCardContent align="start" className="p-3">
        <span className=" text-sm ">
          {isCompleted
            ? "This item is complete."
            : "This item is currently being developed."}
        </span>
      </HoverCardContent>
    </HoverCard>
  );
};

export default RoadmapTooltip;
