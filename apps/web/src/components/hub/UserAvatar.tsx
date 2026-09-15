import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: 28 | 32 | 40 | 48 | 56;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "—";
}

export function UserAvatar({ className, name, size = 32, src }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  const style = { width: size, height: size };

  if (src && !failed) {
    return (
      <img
        alt={name}
        className={cn("shrink-0 rounded-[3px] object-cover", className)}
        height={size}
        onError={() => setFailed(true)}
        src={src}
        style={style}
        width={size}
      />
    );
  }

  return (
    <span
      aria-label={name}
      className={cn(
        "grid shrink-0 place-items-center rounded-[3px] bg-gradient-to-br from-primary-deep to-primary-vivid text-[11px] font-semibold text-primary-foreground dark:from-primary dark:to-primary",
        className,
      )}
      role="img"
      style={style}
    >
      {getInitials(name)}
    </span>
  );
}
