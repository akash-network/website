import { visit } from "unist-util-visit";

export function customAsidePlugin() {
  const variants = new Set([
    "note",
    "tip",
    "caution",
    "danger",
    "heading-banner",
    "call-to-action-banner",
    "button-group",
    "github-btn",
  ]);

  // All remark and rehype plugins return a separate function
  return function (tree, file) {
    console.log("tree", tree);
    visit(tree, (node, index, parent) => {
      if (!parent || index === null || node.type !== "containerDirective")
        return;

      const type = node.name;
      //

      if (!variants.has(type)) return;

      const data = node.data || (node.data = {});
      const attributes = node.attributes || {};

      data.hName = "div";

      switch (type) {
        case "note":
          data.hProperties = {
            class:
              "not-prose my-10 space-y-2 rounded-[4px] shadow-sm border-l-4 border-l-[#C1C8CD] bg-[#F1F0EF] dark:bg-background2 p-4 text-lg font-medium ",
          };

          console.log(node.children[0].children[0].value);

          data.hChildren = [
            {
              type: "element",
              tagName: "p",
              properties: {
                class:
                  "text-start text-base text-foreground flex items-center gap-x-2",
              },
              children: [
                {
                  type: "raw",
                  value: `
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      
                      stroke = "currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_2237_36992)">
                        <path
                          d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5Z"
                         
                          stroke-width="1.125"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M9 12V9"
                         
                          stroke-width="1.125"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                        <path
                          d="M9 6H9.0075"
                         
                          stroke-width="1.125"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2237_36992">
                          <rect width="18" height="18" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  `,
                },

                {
                  type: "text",
                  value: node.name.toUpperCase(),
                },
              ], // Change the text as needed
            },

            {
              type: "element",
              tagName: "p",
              properties: {
                class: "text-start text-base text-foreground",
              },
              children: [
                {
                  type: "text",
                  value: node.children[0].children[0].value,
                },
              ],

              // Change the text as needed
            },
          ];

          break;

        case "tip":
          data.hProperties = {
            class:
              "not-prose my-10 space-y-4 rounded-lg border-l-4 border-l-purple-500 bg-purple-100 px-5 py-5 text-lg font-medium",
          };
          break;

        case "caution":
          data.hProperties = {
            class:
              "not-prose my-10 space-y-4 rounded-lg border-l-4 border-l-yellow-500 bg-yellow-50 px-5 py-5 text-lg font-medium",
          };
          break;

        case "danger":
          data.hProperties = {
            class:
              "not-prose my-10  space-y-4 rounded-lg border-l-4 border-l-primary bg-primary/10 px-5 py-5 text-lg font-medium",
          };
          break;

        case "heading-banner":
          data.hProperties = {
            class:
              "not-prose flex flex-col items-center justify-center rounded-lg bg-[#FFDEDE] px-5 py-10 mt-8",
          };

          // Set hChildren to include the new h1 element
          data.hChildren = [
            {
              type: "element",
              tagName: "p",
              properties: {
                class: "text-center text-2xl font-bold text-foreground",
              },
              children: [
                { type: "text", value: node.children[0].children[0].value },
              ], // Change the text as needed
            },
          ];

          break;

        case "call-to-action-banner":
          data.hProperties = {
            class:
              "not-prose flex flex-col items-center justify-center rounded-lg bg-[#FFDEDE] px-5 py-10 mt-8",
          };

          // Set hChildren to include the new h1 element
          data.hChildren = [
            {
              type: "element",
              tagName: "p",
              properties: {
                class: "text-center text-2xl font-bold text-foreground",
              },
              children: [
                {
                  type: "text",
                  value: node.children[0].children[0].value
                    ? node.children[0].children[0].value
                    : "",
                },
              ], // Change the text as needed
            },
            // Create a link (a) element based on the buttonLink attribute
            {
              type: "element",
              tagName: "a",
              properties: {
                class:
                  "mt-6 flex w-[140px] items-center justify-center rounded-lg bg-primary py-2 font-bold text-primary-foreground cursor-pointer hover:bg-primary/90",

                href: node.children[0].children[1].url
                  ? node.children[0].children[1].url
                  : "",
              },
              children: [
                { type: "text", value: node.children[0].children[1].title },
              ],
            },
          ];

          break;

        case "two-button-group":
          data.hProperties = {
            class: "not-prose flex items-center justify-between mt-6 space-x-4",
          };

          const button1 = {
            url: node.children[0].children[0].url,
            title: node.children[0].children[0].title,
          };
          const button2 = {
            url: node.children[0].children[2].url,
            title: node.children[0].children[2].title,
          };

          data.hChildren = [
            {
              type: "element",
              tagName: "a",
              properties: {
                class:
                  "flex items-center justify-center rounded-lg bg-primary py-2 px-4  font-bold text-primary-foreground cursor-pointer hover:bg-primary/90 text-sm md:text-base",

                href: button1.url,
              },
              children: [{ type: "text", value: button1.title }],
            },

            {
              type: "element",
              tagName: "a",
              properties: {
                class:
                  "flex items-center justify-center rounded-lg bg-primary py-2 px-4 font-bold text-primary-foreground cursor-pointer text-sm md:text-base  hover:bg-primary/90",

                href: button2.url,
              },
              children: [{ type: "text", value: button2.title }],
            },
          ];

          break;

        case "github-btn":
          console.log(node);
          console.log(node.children[0].children[0].value);

          data.hChildren = [
            {
              type: "element",
              tagName: "a",
              properties: {
                href: node.children[0].children[0].url,
                class:
                  "not-prose flex items-center justify-center rounded-[6px] border  bg-background2 px-[17px] py-[9px] text-sm font-medium leading-[20px] text-foreground shadow-sm hover:bg-gray-100 w-fit",
              },
              children: [
                {
                  type: "raw",
                  value: `
                    <svg  class="mr-2 text-foreground"  width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3308 18.355V15.9633C13.3621 15.566 13.3084 15.1665 13.1733 14.7915C13.0382 14.4165 12.8249 14.0745 12.5475 13.7883C15.1641 13.4967 17.9141 12.505 17.9141 7.95501C17.9139 6.79153 17.4664 5.67268 16.6641 4.83001C17.044 3.8121 17.0171 2.68697 16.5891 1.68834C16.5891 1.68834 15.6058 1.39668 13.3308 2.92168C11.4208 2.40403 9.40745 2.40403 7.49746 2.92168C5.22246 1.39668 4.23913 1.68834 4.23913 1.68834C3.81111 2.68697 3.78425 3.8121 4.16413 4.83001C3.3559 5.67893 2.9079 6.8079 2.91413 7.98001C2.91413 12.4967 5.66413 13.4883 8.28079 13.8133C8.00662 14.0967 7.79518 14.4345 7.66022 14.8049C7.52525 15.1754 7.4698 15.5701 7.49746 15.9633V18.355" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M7.4974 16.6895C4.9974 17.5005 2.91406 16.6895 1.66406 14.1895" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    
                    `,
                },

                {
                  type: "text",
                  value: "View on GitHub",
                },
              ], // Change the text as needed
            },
          ];

          break;

        case "button-group":
          console.log(node);
          data.hProperties = {
            class: "not-prose flex items-center gap-x-10",
          };

          break;

        default:
          data.hProperties = {
            class:
              "not-prose my-10 space-y-4 rounded-lg border-l-4 border-l-[#C1C8CD] bg-[#F1F0EF] px-5 py-5 text-lg font-medium",
          };
          break;
      }
    });
  };
}
