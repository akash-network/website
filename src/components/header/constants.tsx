import { ChartBarIcon, ChevronDownIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import { Logo } from "./icons";

const networkItems = [
  {
    title: "About Akash",
    description: "Discover the story behind Akash and how it works",
    link: "/about/general-information/",
    icon: <InformationCircleIcon />,
  },
  {
    title: "Akash Stats",
    description:
      "Get insights into the latest statistics about the Akash Network",
    link: "https://stats.akash.network/",
    icon: <ChartBarIcon />,
  },
  {
    title: "AKT Token",
    description: "Understand the role of the $AKT token in the Akash ecosystem",
    link: "/token",
    icon: <Logo />,
  },
];

export { networkItems }
