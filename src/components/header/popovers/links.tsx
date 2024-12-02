import {
  BadgeCheck,
  BadgeHelp,
  CalendarHeart,
  Codesandbox,
  FileStack,
  HeartHandshake,
} from "lucide-react";

export const communityItems = [
  {
    icon: CalendarHeart,
    title: "Events",

    link: "/community/events/",
  },
  {
    icon: BadgeCheck,
    title: "Akash Insiders",

    link: "/community/akash-insiders/",
  },
  // {
  //   customIcon: (
  //     <svg
  //       width="24"
  //       height="25"
  //       viewBox="0 0 24 25"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M14.1488 9.97163V4.11153C14.1488 3.22151 13.4273 2.5 12.5373 2.5V2.5C11.6473 2.5 10.9258 3.22151 10.9258 4.11153V8.94611"
  //         stroke="currentColor"
  //         strokeWidth="1.5"
  //         stroke-linecap="round"
  //       />
  //       <path
  //         d="M16.346 13.341L18.5217 6.08862C18.7755 5.24265 18.2886 4.35248 17.4394 4.10984V4.10984C16.5943 3.8684 15.7142 4.3609 15.4779 5.20743L14.1484 9.97149"
  //         stroke="currentColor"
  //         strokeWidth="1.5"
  //         stroke-linecap="round"
  //       />
  //       <path
  //         d="M7.61935 9.74985L8.67489 12.0913C9.03961 12.9003 8.68159 13.852 7.87404 14.22C7.06183 14.5901 6.10347 14.2296 5.73663 13.4159L4.68109 11.0745C4.31637 10.2654 4.67439 9.31376 5.48193 8.94574C6.29415 8.57559 7.25251 8.93614 7.61935 9.74985Z"
  //         stroke="currentColor"
  //         strokeWidth="1.5"
  //         stroke-linecap="round"
  //       />
  //       <path
  //         d="M11.7192 12.7615V12.7615C11.9239 12.194 11.8998 11.5692 11.6518 11.0192L10.5787 8.63874C10.2181 7.83892 9.27613 7.48454 8.4778 7.84836V7.84836C7.66469 8.21892 7.31885 9.18832 7.71382 9.98986L7.84946 10.2651"
  //         stroke="currentColor"
  //         strokeWidth="1.5"
  //         stroke-linecap="round"
  //       />
  //       <path
  //         d="M13.8566 18.1767L14.3487 17.1927C14.3976 17.0947 14.3461 16.9763 14.241 16.9454L10.6903 15.9011C9.97853 15.6918 9.51797 15.0038 9.59563 14.266V14.266C9.68372 13.4292 10.4284 12.8188 11.2662 12.8968L16.0542 13.3422C16.0542 13.3422 19.8632 13.9282 18.5447 17.7372C17.2262 21.5463 16.7867 22.8648 13.8566 22.8648C11.9521 22.8648 9.16855 22.8648 9.16855 22.8648H8.87555C6.52912 22.8648 4.62697 20.9627 4.62697 18.6163V18.6163L4.48047 10.4121"
  //         stroke="currentColor"
  //         strokeWidth="1.5"
  //         stroke-linecap="round"
  //       />
  //     </svg>
  //   ),
  //   title: "Community Contributions",

  //   link: "/community/community-contributions/",
  // },
  {
    customIcon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3.5H4C3.44772 3.5 3 3.94772 3 4.5V9.5C3 10.0523 3.44772 10.5 4 10.5H9C9.55228 10.5 10 10.0523 10 9.5V4.5C10 3.94772 9.55228 3.5 9 3.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 3.5H15C14.4477 3.5 14 3.94772 14 4.5V9.5C14 10.0523 14.4477 10.5 15 10.5H20C20.5523 10.5 21 10.0523 21 9.5V4.5C21 3.94772 20.5523 3.5 20 3.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20 14.5H15C14.4477 14.5 14 14.9477 14 15.5V20.5C14 21.0523 14.4477 21.5 15 21.5H20C20.5523 21.5 21 21.0523 21 20.5V15.5C21 14.9477 20.5523 14.5 20 14.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9 14.5H4C3.44772 14.5 3 14.9477 3 15.5V20.5C3 21.0523 3.44772 21.5 4 21.5H9C9.55228 21.5 10 21.0523 10 20.5V15.5C10 14.9477 9.55228 14.5 9 14.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          cx="12"
          cy="12.5"
          r="7"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    title: "Akash Validators",

    link: "/community/akash-validators/",
  },
  {
    customIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="22px"
        height="16px"
        style={{
          shapeRendering: "geometricPrecision",
          textRendering: "geometricPrecision",
          imageRendering: "auto",
          fillRule: "evenodd",
          clipRule: "evenodd",
        }}
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <g>
          <path
            style={{ opacity: 0.744, fill: "#9ca2ae" }}
            d="M 8.5,-0.5 C 9.83333,-0.5 11.1667,-0.5 12.5,-0.5C 15.3037,1.4046 18.3037,3.07127 21.5,4.5C 21.5,7.16667 21.5,9.83333 21.5,12.5C 19.8829,11.4107 19.0496,9.74398 19,7.5C 18.0172,10.27 16.8506,12.9366 15.5,15.5C 12.1667,15.5 8.83333,15.5 5.5,15.5C 3.98672,13.4839 3.15339,11.1506 3,8.5C 1.88732,7.69499 0.72065,7.02832 -0.5,6.5C -0.5,5.83333 -0.5,5.16667 -0.5,4.5C 2.69626,3.07127 5.69626,1.4046 8.5,-0.5 Z M 8.5,2.5 C 19.1379,4.67647 19.1379,6.5098 8.5,8C 6.99842,7.41692 5.66508,6.58359 4.5,5.5C 5.9014,4.47934 7.23473,3.47934 8.5,2.5 Z M 5.5,9.5 C 8.67235,12.0858 11.839,12.0858 15,9.5C 15.2743,12.4872 13.7743,13.8205 10.5,13.5C 7.39663,13.7981 5.72996,12.4648 5.5,9.5 Z"
          />
        </g>
      </svg>
    ),
    title: "Akash EDU",

    link: "/community/community-akash-edu/",
  },
  {
    title: "Swag Shop",
    description: "A selection of Akash Network apparel and accessories",

    link: "https://shop.akash.network/",
    external: true,
  },
];

export const developmentItems = [
  {
    icon: HeartHandshake,
    title: "Get Involved",

    link: "/development/welcome/",
  },
  {
    customIcon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 19.9516L12 13.3428M12 13.3428L12 3.49999M12 13.3428L3 19.9516"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M20.4375 17.2097L21 19.9516L18.1875 20.5"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9.75 5.69354L12 3.49999L14.25 5.69354"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5.8125 20.5L3 19.9516L3.5625 17.2097"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    title: "Product Strategy",

    link: "/development/product-strategy/",
  },
  {
    customIcon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M16 22C19.3137 22 22 19.3137 22 16C22 12.6863 19.3137 10 16 10C12.6863 10 10 12.6863 10 16C10 19.3137 12.6863 22 16 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 22C11.3137 22 14 19.3137 14 16C14 12.6863 11.3137 10 8 10C4.68629 10 2 12.6863 2 16C2 19.3137 4.68629 22 8 22Z"
          stroke="currentColor"
          strokeWidth="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    title: "Current Groups",

    link: "/development/current-groups/",
  },
  {
    customIcon: (
      <svg
        width="24"
        height="25"
        viewBox="0 0 24 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 21.5H5C3.89543 21.5 3 20.6046 3 19.5V5.5C3 4.39543 3.89543 3.5 5 3.5H19C20.1046 3.5 21 4.39543 21 5.5V19.5C21 20.6046 20.1046 21.5 19 21.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3 15.5H9.4C9.73137 15.5 10.0053 15.7783 10.1504 16.0762C10.3564 16.4991 10.8442 17 12 17C13.1558 17 13.6436 16.4991 13.8496 16.0762C13.9947 15.7783 14.2686 15.5 14.6 15.5H21"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M3 7.5H21" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 11.5H21" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Funding Programs",

    link: "/development/funding-program/",
  },
  {
    title: "Product & Engineering Roadmap",
    description:
      "View all current technical efforts happening on the Akash Network",

    link: "https://github.com/orgs/akash-network/projects/5",
    external: true,
  },
];

export const networkItems = [
  {
    icon: BadgeHelp,
    title: "About Akash",
    description: "Discover how Akash works",
    link: "/about/general-information/",
  },
  {
    icon: Codesandbox,
    title: "Providers",
    description: "Your customers' data will be safe and secure",
    link: "/about/providers/",
  },
  {
    customIcon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M18.09 13.63C19.0353 13.2776 19.8765 12.6925 20.5358 11.9288C21.195 11.1651 21.6511 10.2476 21.8617 9.26093C22.0724 8.2743 22.0309 7.25048 21.741 6.28415C21.4512 5.31782 20.9223 4.44018 20.2034 3.73239C19.4845 3.0246 18.5987 2.50951 17.628 2.23477C16.6572 1.96003 15.6329 1.9345 14.6497 2.16054C13.6665 2.38658 12.7561 2.8569 12.0028 3.528C11.2495 4.1991 10.6776 5.04931 10.34 6M14 16C14 12.6863 11.3137 10 8 10C4.68629 10 2 12.6863 2 16C2 19.3137 4.68629 22 8 22C11.3137 22 14 19.3137 14 16Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    title: "AKT Token",
    description: "Understand the role of AKT token",
    link: "/token/",
  },
];

export const ecosystemNavItems = [
  {
    customIcon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16.0614 10.4037L14 17L10 17L7.93865 10.4037C7.35085 8.52273 7.72417 6.47307 8.93738 4.92015L11.5272 1.6052C11.7674 1.29772 12.2326 1.29772 12.4728 1.6052L15.0626 4.92015C16.2758 6.47307 16.6491 8.52273 16.0614 10.4037Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 20C10 22 12 23 12 23C12 23 14 22 14 20"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8.5 12.5C5 15 7 19 7 19L10 17"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15.9316 12.5C19.4316 15 17.4316 19 17.4316 19L14.4316 17"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9C14 10.1046 13.1046 11 12 11Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    title: "Deployed on Akash",

    link: "/ecosystem/deployed-on-akash/",
  },
  {
    customIcon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3H20C21.1046 3 22 3.89543 22 5V13"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
        <path
          d="M22 17.2798C22 17.8812 21.7625 18.4588 21.3383 18.8861C20.3619 19.8701 19.415 20.8961 18.4021 21.8443C18.17 22.0585 17.8017 22.0507 17.5795 21.8268L14.6615 18.8861C13.7795 17.9972 13.7795 16.5623 14.6615 15.6734C15.5522 14.7758 17.0032 14.7758 17.8938 15.6734L17.9999 15.7803L18.1059 15.6734C18.533 15.2429 19.1146 15 19.7221 15C20.3297 15 20.9113 15.2428 21.3383 15.6734C21.7625 16.1007 22 16.6784 22 17.2798Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
        <path
          d="M2 7L22 7"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5 5.01L5.01 4.99889"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M8 5.01L8.01 4.99889"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M11 5.01L11.01 4.99889"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    title: "Tools",

    link: "/ecosystem/akash-tools/",
  },

  {
    icon: FileStack,
    title: "Case Studies",

    link: "/blog/case-studies/1",
    external: true,
  },
];
