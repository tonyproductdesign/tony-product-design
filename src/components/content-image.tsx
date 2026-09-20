import { useState, type ImgHTMLAttributes } from "react";
import { imageUrl, asset } from "@/lib/utils";

type ContentImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet" | "onError" | "children"> & {
  src: string;
  mobileSrc?: string;
  mobileMedia?: string;
};

/** A changed source remounts only the image, clearing any previous failure. */
export function ContentImage(props: ContentImageProps) {
  return <ImageView key={`${props.src}\n${props.mobileSrc || ""}`} {...props} />;
}

/** Shared local/HTTPS image handling, with a single non-recursive fallback. */
function ImageView({ src, mobileSrc, mobileMedia = "(max-width: 600px)", alt = "", ...props }: ContentImageProps) {
  const resolved = imageUrl(src);
  const mobile = mobileSrc ? imageUrl(mobileSrc) : "";
  const [failed, setFailed] = useState(false);
  const image = <img
    {...props}
    src={failed ? asset("images/product-placeholder.svg") : resolved}
    alt={alt}
    referrerPolicy="no-referrer"
    data-image-fallback={failed ? "true" : undefined}
    onError={() => { if (!failed) setFailed(true); }}
  />;
  // Remove responsive sources after an error, otherwise the browser could keep
  // choosing a broken <source> instead of the img fallback.
  return mobile ? <picture>{!failed && <source media={mobileMedia} srcSet={mobile} />}{image}</picture> : image;
}
