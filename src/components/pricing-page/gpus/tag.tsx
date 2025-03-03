const Tag = ({ children, className, href, active }: any) => {
  return (
    <a
      href={href}
      className={`
  ${className}
  ${active ? `!border-primary text-primary` : ` text-sortText`}
  cursor-pointer whitespace-nowrap rounded-[6px] border   bg-background2  px-[11px] py-[7px] text-xs font-normal  leading-normal  shadow-sm hover:border-primary  hover:text-primary md:px-[13px] md:py-[9px] md:text-sm`}
    >
      {children}
    </a>
  );
};

export default Tag;
