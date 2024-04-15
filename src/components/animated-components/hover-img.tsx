import clsx from "clsx";
import React, { useEffect, useState } from "react";

const HoverImage = ({
  children,
  img,
}: {
  children: React.ReactNode;
  img: string;
}) => {
  const [hover, setHover] = React.useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);
  return (
    <div className="relative mt-4">
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
      </div>
      <img
        src={img}
        className={clsx(
          "fixed  z-[2] h-44 w-44 transform rounded-full object-cover transition-transform  duration-500",
          hover ? "scale-100 blur-0 filter " : "scale-0 blur-sm filter",
        )}
        style={{ left: position.x - 300, top: position.y - 50 }}
      />
    </div>
  );
};

export default HoverImage;
