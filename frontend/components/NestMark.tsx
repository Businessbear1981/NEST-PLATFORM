import Image from "next/image";

export default function NestMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/nest-logo.png"
      alt="NEST"
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      priority
    />
  );
}

export function NestLockup({ size = 26 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Image
        src="/nest-logo.png"
        alt="NEST"
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
        priority
      />
      <span
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: size * 0.85,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: "#C4A048",
          lineHeight: 1,
        }}
      >
        NEST
      </span>
    </div>
  );
}
