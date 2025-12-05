import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function CopyButton({
  text,
  className = "",
  size = "md",
  showLabel = true,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1.5 rounded-md font-medium
        text-gray-600 transition-all duration-200
        hover:bg-gray-100 hover:text-gray-900
        dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200
        ${sizeClasses[size]} ${className}
      `}
      title={copied ? "Copied!" : "Copy to clipboard"}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
    >
      {copied ? (
        <>
          <Check className={`${iconSizes[size]} text-green-600 dark:text-green-400`} />
          {showLabel && <span>Copied!</span>}
        </>
      ) : (
        <>
          <Copy className={iconSizes[size]} />
          {showLabel && <span>Copy</span>}
        </>
      )}
    </button>
  );
}

// Component to wrap any content with a copy button
export function CopyableBlock({
  children,
  textToCopy,
  className = "",
}: {
  children: React.ReactNode;
  textToCopy: string;
  className?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <CopyButton text={textToCopy} showLabel={false} size="sm" />
      </div>
      {children}
    </div>
  );
}

