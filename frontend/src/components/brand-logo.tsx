import Image, { getImageProps } from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  variant?: "default" | "header";
};

const logoSizes = "(max-width: 640px) 180px, 300px";

export default function BrandLogo({
  className,
  variant = "default",
}: BrandLogoProps) {
  if (variant === "header") {
    return (
      <Image
        alt="Venda Cantada - CAOA"
        className={cn("block h-full w-full object-contain", className)}
        height={294}
        priority
        sizes={logoSizes}
        src="/images/logo-header-white-green.png"
        width={827}
      />
    );
  }

  const { props: darkLogoProps } = getImageProps({
    alt: "",
    height: 533,
    quality: 70,
    sizes: logoSizes,
    src: "/images/logo-dark.png",
    width: 800,
  });
  const { props: lightLogoProps } = getImageProps({
    alt: "Venda Cantada - CAOA",
    height: 533,
    priority: true,
    quality: 70,
    sizes: logoSizes,
    src: "/images/logo-light.png",
    width: 800,
  });

  return (
    <picture className={cn("block h-full w-full", className)}>
      <source
        media="(prefers-color-scheme: dark)"
        sizes={logoSizes}
        srcSet={darkLogoProps.srcSet}
      />
      <img
        {...lightLogoProps}
        alt="Venda Cantada - CAOA"
        className={cn(
          "block h-full w-full object-contain dark:brightness-0 dark:invert",
          className,
        )}
        fetchPriority="high"
      />
    </picture>
  );
}
