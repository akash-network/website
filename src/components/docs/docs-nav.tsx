import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDoubleDownIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Switch } from "../ui/switch";

export function DocsNav({ docsNav = [], pathName = [] }: any) {
  const Dropdown = (
    navItem: any,
    pathName: any,
    depth: any,
    index?: any,
    docsLength?: any,
  ) => {
    return (
      <div
        className={
          index === 0
            ? ""
            : depth && index === 0
            ? ""
            : depth === 0
            ? "mt-5"
            : ""
        }
      >
        {depth === 0 ? (
          <div>
            <p className="pl-2  text-sm font-bold" hidden={index === 0}>
              {navItem.label}
            </p>

            {navItem.subItems && (
              <div
                className={`${
                  index < docsLength - 1 ? "mb-4" : ""
                } mt-4 space-y-2`}
              >
                {navItem.subItems.map((subItem: any, index: any) => (
                  <React.Fragment key={subItem.link}>
                    {subItem.subItems.length > 0 ? (
                      <div>
                        {Dropdown(
                          subItem,
                          pathName,
                          depth + 1,
                          index,
                          docsLength,
                        )}
                      </div>
                    ) : (
                      <a
                        href={subItem.link}
                        className={`${
                          pathName.split("/")[3 + depth] ===
                            subItem.link.split("/")[3 + depth] &&
                          navItem.link.split("/")[2] === pathName.split("/")[2]
                            ? "bg-[#F4F1F1] text-primary dark:bg-background2 dark:text-white"
                            : ""
                        } flex w-full cursor-pointer items-center justify-between gap-x-2  rounded-[4px]  px-2 py-1 text-sm font-medium text-para hover:dark:bg-background2 hover:dark:text-white`}
                      >
                        {subItem.label}
                      </a>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={`space-y-2 ${depth > 1 ? "pl-5" : "pl-2"} `}>
            <Collapsible
              defaultOpen={
                pathName.split("/")[2 + depth] ===
                  navItem.link.split("/")[2 + depth] &&
                navItem.link.split("/")[2] === pathName.split("/")[2]
              }
            >
              <CollapsibleTrigger className="w-full">
                <div
                  className={`flex w-full cursor-pointer items-center justify-between gap-x-2   ${
                    depth > 0 ? "pl-0 pr-2" : "px-2"
                  }   py-1 text-sm font-medium`}
                >
                  <p className="flex-1 text-left">{navItem.label}</p>
                  <ChevronDownIcon className=" w-4 text-para" />
                </div>
              </CollapsibleTrigger>

              {navItem.subItems && (
                <CollapsibleContent className="mt-2 space-y-2">
                  {navItem.subItems.map((subItem: any, index: any) => (
                    <React.Fragment key={subItem.link}>
                      {subItem.subItems.length > 0 ? (
                        <>{Dropdown(subItem, pathName, depth + 1)}</>
                      ) : (
                        <a
                          href={subItem.link}
                          className={`${
                            pathName.split("/")[3 + depth] ===
                              subItem.link.split("/")[3 + depth] &&
                            navItem.link.split("/")[2] ===
                              pathName.split("/")[2]
                              ? "bg-[#F4F1F1] text-primary dark:bg-background2 dark:text-white"
                              : ""
                          } flex w-full cursor-pointer items-center justify-between gap-x-2  rounded-[4px]  py-1 pl-5 pr-2 text-sm font-medium text-para  hover:bg-[#F4F1F1] hover:text-primary hover:dark:bg-background2 hover:dark:text-white`}
                        >
                          {subItem.label}
                        </a>
                      )}
                    </React.Fragment>
                  ))}
                </CollapsibleContent>
              )}
            </Collapsible>
          </div>
        )}
      </div>
    );
  };

  const paths = pathName.split("/");
  console.log(docsNav);

  return (
    <>
      <nav className="divide-y">
        <>
          {docsNav
            .filter((navItem: any) => navItem.link === `/docs/docs/`)
            .map((navItem: any, index: any) => (
              <div key={navItem.link}>
                {Dropdown(navItem, pathName, 0, index, docsNav.length)}
              </div>
            ))}
        </>
      </nav>
    </>
  );
}
