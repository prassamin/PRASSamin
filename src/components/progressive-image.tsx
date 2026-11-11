"use client";

import * as React from "react";
import NextImage, { type ImageProps as NextImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@heroui/react";

export type ImageSrc = NextImageProps["src"];

export interface ImageProps extends Omit<
  NextImageProps,
  "src" | "alt" | "width" | "height"
> {
  src: ImageSrc;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: number | string;
  showSkeleton?: boolean;
  progressive?: boolean;
  mode?: "progressive" | "normal" | string;
}

export type ProgressiveImageProps = ImageProps;

// Global session cache of URLs that have successfully loaded.
// A Set<string> takes negligible memory and eliminates re-blur on navigation.
const loadedImageCache = new Set<string>();

function getSrcKey(src: ImageSrc): string {
  if (typeof src === "string") return src;
  if (src && typeof src === "object" && "src" in src) return src.src;
  return "";
}

export const ProgressiveImage = React.forwardRef<HTMLImageElement, ImageProps>(
  function Image(
    {
      src,
      alt,
      fallbackSrc,
      className,
      containerClassName,
      style,
      aspectRatio,
      showSkeleton = true,
      progressive = true,
      mode,
      onLoad,
      onError,
      fill,
      width,
      height,
      sizes,
      priority,
      ...restProps
    },
    ref,
  ) {
    const isFill = fill ?? (!width && !height);
    const isProgressive =
      mode !== undefined ? mode === "progressive" : progressive;

    const srcKey = getSrcKey(src);
    const [currentSrc, setCurrentSrc] = React.useState<ImageSrc>(src);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(() => {
      return loadedImageCache.has(srcKey);
    });
    const [hasError, setHasError] = React.useState<boolean>(false);

    // Sync when src prop changes
    React.useEffect(() => {
      const newKey = getSrcKey(src);
      setCurrentSrc(src);
      setHasError(false);
      setIsLoaded(loadedImageCache.has(newKey));
    }, [src]);

    const handleLoad = React.useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        const key = getSrcKey(currentSrc);
        if (key) {
          loadedImageCache.add(key);
        }
        setIsLoaded(true);
        onLoad?.(e);
      },
      [currentSrc, onLoad],
    );

    const handleError = React.useCallback(
      (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        } else {
          setHasError(true);
        }
        onError?.(e);
      },
      [fallbackSrc, currentSrc, onError],
    );

    // Error State Fallback UI
    if (hasError) {
      return (
        <div
          role="img"
          aria-label={alt || "Image failed to load"}
          className={cn(
            "relative flex flex-col items-center justify-center bg-neutral-900/60 border border-neutral-800 text-neutral-500 rounded-lg p-4 text-center overflow-hidden",
            isFill && "absolute inset-0 w-full h-full",
            containerClassName,
            className,
          )}
          style={{
            ...(aspectRatio ? { aspectRatio: String(aspectRatio) } : {}),
            ...style,
          }}
        >
          <ImageOff className="size-6 mb-1.5 opacity-60 stroke-[1.5]" />
          <span className="text-xs line-clamp-1 max-w-[90%] text-neutral-400">
            {alt || "Image unavailable"}
          </span>
        </div>
      );
    }

    const containerStyle: React.CSSProperties = {
      ...(aspectRatio ? { aspectRatio: String(aspectRatio) } : {}),
      ...style,
    };

    const isContained = isFill || aspectRatio !== undefined;

    const imageElement = (
      <NextImage
        ref={ref}
        src={currentSrc}
        alt={alt}
        fill={isFill}
        width={!isFill ? width : undefined}
        height={!isFill ? height : undefined}
        sizes={
          sizes ??
          (isFill
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            : undefined)
        }
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-all duration-500 ease-out",
          isProgressive && !isLoaded
            ? "scale-105 blur-lg opacity-70"
            : "scale-100 blur-0 opacity-100",
          isFill ? "absolute inset-0 h-full w-full object-cover" : "",
          className,
        )}
        {...restProps}
      />
    );

    if (isContained || showSkeleton) {
      return (
        <div
          className={cn(
            "relative overflow-hidden isolate",
            isFill ? "w-full h-full" : "inline-block",
            containerClassName,
          )}
          style={containerStyle}
        >
          {/* Skeleton Shimmer Placeholder while downloading */}
          {showSkeleton && !isLoaded && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 bg-neutral-900/80 animate-pulse"
            />
          )}

          {imageElement}
        </div>
      );
    }

    return imageElement;
  },
);