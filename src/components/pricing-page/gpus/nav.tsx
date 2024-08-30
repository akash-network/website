import Tag from "./tag";

const Nav = ({ pathName }: any) => {
  return (
    <>
      <div className="sidebar-scroll flex items-center gap-[10px] overflow-x-auto py-2 md:gap-[10px] md:overflow-x-hidden lg:justify-center">
        <div>
          <Tag
            href="/ecosystem/showcase/latest"
            active={pathName[2] === "showcase"}
          >
            Showcase
          </Tag>
        </div>

        <div>
          <Tag
            href="/ecosystem/akash-tools/latest"
            active={pathName[2] === "akash-tools"}
          >
            Tools
          </Tag>
        </div>

        <div>
          <Tag
            href="/ecosystem/deployed-on-akash/latest"
            active={pathName[2] === "deployed-on-akash"}
          >
            Deployed on Akash
          </Tag>
        </div>

        <div>
          <Tag href="/ecosystem/providers" active={pathName[2] === "providers"}>
            Akash Providers
          </Tag>
        </div>
      </div>
    </>
  );
};

export default Nav;
