import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { rajdhani, dmSans, COLORS } from "./theme";

// ---------- Reusable helpers ----------

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const angle = 135 + t * 30;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, ${COLORS.cream} 0%, ${COLORS.paper} 60%, ${COLORS.accent} 100%)`,
      }}
    />
  );
};

const FloatingBlob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const f = frame + delay;
  const ox = Math.sin(f / 60) * 40;
  const oy = Math.cos(f / 75) * 30;
  return (
    <div
      style={{
        position: "absolute",
        left: x + ox,
        top: y + oy,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(80px)",
        opacity: 0.35,
      }}
    />
  );
};

const Ambient: React.FC = () => (
  <AbsoluteFill>
    <FloatingBlob x={-150} y={200} size={500} color={COLORS.primary} />
    <FloatingBlob x={700} y={1500} size={600} color={COLORS.primaryDark} delay={120} />
    <FloatingBlob x={300} y={900} size={400} color={COLORS.accent} delay={60} />
  </AbsoluteFill>
);

// iPhone-style frame around a screenshot
const PhoneFrame: React.FC<{
  src: string;
  scrollY?: number;
  scaleIn?: boolean;
}> = ({ src, scrollY = 0, scaleIn = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = scaleIn
    ? spring({ frame, fps, config: { damping: 22, stiffness: 90 } })
    : 1;
  const scale = interpolate(s, [0, 1], [0.92, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width: 760,
        height: 1560,
        borderRadius: 90,
        background: "#0b0b0d",
        padding: 18,
        boxShadow:
          "0 60px 120px -30px rgba(16,20,24,0.45), 0 30px 60px -20px rgba(232,80,26,0.25)",
        transform: `scale(${scale})`,
        opacity,
        position: "relative",
      }}
    >
      {/* notch */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 36,
          background: "#0b0b0d",
          borderRadius: 24,
          zIndex: 5,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 74,
          overflow: "hidden",
          background: COLORS.paper,
          position: "relative",
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            display: "block",
            transform: `translateY(${-scrollY}px)`,
          }}
        />
      </div>
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame - delay, [0, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: dmSans,
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: COLORS.primary,
        opacity: o,
        transform: `translateY(${y}px)`,
      }}
    >
      {children}
    </div>
  );
};

const Headline: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({
  children,
  delay = 0,
  size = 110,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
  const y = interpolate(s, [0, 1], [40, 0]);
  const o = interpolate(s, [0, 0.6], [0, 1]);
  return (
    <div
      style={{
        fontFamily: rajdhani,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 0.95,
        letterSpacing: "-0.02em",
        color: COLORS.ink,
        opacity: o,
        transform: `translateY(${y}px)`,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
};

const StepBadge: React.FC<{ n: number; label: string; delay?: number }> = ({
  n,
  label,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
  const scale = interpolate(s, [0, 1], [0.6, 1]);
  const o = interpolate(s, [0, 0.5], [0, 1]);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 22,
        background: COLORS.ink,
        color: COLORS.paper,
        padding: "20px 36px 20px 20px",
        borderRadius: 999,
        transform: `scale(${scale})`,
        opacity: o,
        boxShadow: "0 20px 50px -20px rgba(16,20,24,0.5)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: COLORS.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: rajdhani,
          fontWeight: 700,
          fontSize: 40,
          color: COLORS.paper,
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: dmSans,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------- Scenes ----------

// Scene 1: Hook (0–6s = 180f)
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const py = interpolate(frame, [0, 180], [0, -30]);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <Kicker>Fahrschule me · Wettingen</Kicker>
        <Headline>
          Motorrad-<br />Schein.<br />
          <span style={{ color: COLORS.primary }}>In 60 Sek</span> erklärt.
        </Headline>
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
        <div style={{ transform: `translateY(${300 + py}px)` }}>
          <PhoneFrame src={staticFile("screens/01-hero.png")} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 2: Step 1 — Grundkurs (6–22s = 480f)
const SceneGrundkurs: React.FC = () => {
  const frame = useCurrentFrame();
  // Phase A: 0-150f show course list; Phase B: 150-300f show selected; Phase C: 300-480f form mock
  const showA = frame < 170;
  const showB = frame >= 140 && frame < 320;
  const showC = frame >= 300;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <StepBadge n={1} label="Grundkurs buchen" />
        <Headline size={84} delay={6}>
          3 Teile.<br /><span style={{ color: COLORS.primary }}>Richtige Reihenfolge.</span>
        </Headline>
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 30 }}>
        {showA && (
          <div style={{ transform: "translateY(240px)" }}>
            <PhoneFrame src={staticFile("screens/02-mgk-teil1.png")} />
          </div>
        )}
        {showB && !showC && (
          <div style={{ transform: "translateY(240px)" }}>
            <PhoneFrame src={staticFile("screens/03-mgk-selected.png")} scaleIn={false} />
          </div>
        )}
        {showC && (
          <div style={{ transform: "translateY(240px)" }}>
            <FormMock />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const FormMock: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20, stiffness: 100 } });
  const scale = interpolate(s, [0, 1], [0.92, 1]);
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  // typed character animation
  const name = "Lukas Müller";
  const email = "lukas@example.ch";
  const phone = "+41 79 555 12 34";
  const typed = (s: string, start: number) => {
    const n = Math.max(0, Math.min(s.length, Math.floor((frame - start) / 1.5)));
    return s.slice(0, n);
  };
  const payOn = frame > 130;
  return (
    <div
      style={{
        width: 760,
        height: 1560,
        borderRadius: 90,
        background: "#0b0b0d",
        padding: 18,
        boxShadow:
          "0 60px 120px -30px rgba(16,20,24,0.45), 0 30px 60px -20px rgba(232,80,26,0.25)",
        transform: `scale(${scale})`,
        opacity,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 28,
          left: "50%",
          transform: "translateX(-50%)",
          width: 220,
          height: 36,
          background: "#0b0b0d",
          borderRadius: 24,
          zIndex: 5,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 74,
          background: COLORS.paper,
          padding: "120px 50px 60px",
          fontFamily: dmSans,
        }}
      >
        <div style={{ fontFamily: rajdhani, fontWeight: 700, fontSize: 44, color: COLORS.ink, marginBottom: 8 }}>
          DEINE DATEN
        </div>
        <div style={{ height: 4, width: 100, background: COLORS.primary, marginBottom: 40 }} />

        <FormField label="Name" value={typed(name, 0)} />
        <FormField label="E-Mail" value={typed(email, 30)} />
        <FormField label="Telefon" value={typed(phone, 65)} />

        <div
          style={{
            marginTop: 70,
            padding: "28px 32px",
            background: payOn ? COLORS.primary : "#e7e2d6",
            borderRadius: 14,
            color: payOn ? COLORS.paper : COLORS.ink,
            fontWeight: 700,
            fontSize: 30,
            textAlign: "center",
            letterSpacing: 1,
            transition: "all 0.2s",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
          }}
        >
          {payOn ? "✓ MIT STRIPE BEZAHLEN" : "WEITER"}
        </div>

        <div style={{ marginTop: 36, fontSize: 22, color: "#7a7468", textAlign: "center" }}>
          CHF 160.00 · Samstag 10.08.2026
        </div>
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ fontSize: 20, color: "#7a7468", marginBottom: 8, letterSpacing: 1 }}>{label}</div>
    <div
      style={{
        background: "#fff",
        border: "2px solid #e7e2d6",
        borderRadius: 10,
        padding: "20px 22px",
        fontSize: 30,
        fontWeight: 500,
        color: COLORS.ink,
        minHeight: 36,
      }}
    >
      {value}
      <span style={{ opacity: value.length < 16 ? 1 : 0, color: COLORS.primary }}>|</span>
    </div>
  </div>
);

// Scene 3: Step 2 — Fahrstunden (22–40s = 540f)
const SceneFahrstunden: React.FC = () => {
  const frame = useCurrentFrame();
  const showA = frame < 200;
  const showB = frame >= 180 && frame < 360;
  const showC = frame >= 340;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <StepBadge n={2} label="Fahrstunden" />
        <Headline size={84} delay={6}>
          Termin wählen.<br /><span style={{ color: COLORS.primary }}>Sofort bestätigt.</span>
        </Headline>
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 30 }}>
        {showA && (
          <div style={{ transform: "translateY(240px)" }}>
            <PhoneFrame src={staticFile("screens/04-fahrstunden-hero.png")} />
          </div>
        )}
        {showB && !showC && (
          <div style={{ transform: "translateY(240px)" }}>
            <PhoneFrame src={staticFile("screens/05-preise.png")} scaleIn={false} />
          </div>
        )}
        {showC && (
          <div style={{ transform: "translateY(240px)" }}>
            <PhoneFrame src={staticFile("screens/06-bestaetigung.png")} scaleIn={false} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 4: Outro (40–50s = 300f)
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 100 } });
  const scale = interpolate(s, [0, 1], [0.8, 1]);
  const o = interpolate(s, [0, 0.6], [0, 1]);

  const urlPulse = 1 + Math.sin(frame / 14) * 0.02;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: o,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 60,
        }}
      >
        <div
          style={{
            fontFamily: rajdhani,
            fontWeight: 700,
            fontSize: 180,
            color: COLORS.ink,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            textAlign: "center",
          }}
        >
          FAHRSCHULE{" "}
          <span
            style={{
              fontFamily: '"Brush Script MT", cursive',
              fontStyle: "italic",
              color: COLORS.primary,
              fontWeight: 500,
            }}
          >
            me
          </span>
        </div>
        <div
          style={{
            width: 280,
            height: 6,
            background: COLORS.primary,
            borderRadius: 4,
          }}
        />
        <div
          style={{
            fontFamily: dmSans,
            fontWeight: 700,
            fontSize: 56,
            color: COLORS.ink,
            transform: `scale(${urlPulse})`,
          }}
        >
          fahrschule-me.ch
        </div>
        <Kicker delay={30}>Jetzt online buchen</Kicker>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Main composition ----------

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Backdrop />
      <Ambient />

      <Audio src={staticFile("audio/vo.mp3")} volume={0.95} />

      <Sequence from={0} durationInFrames={180}>
        <SceneHook />
      </Sequence>
      <Sequence from={180} durationInFrames={510}>
        <SceneGrundkurs />
      </Sequence>
      <Sequence from={690} durationInFrames={510}>
        <SceneFahrstunden />
      </Sequence>
      <Sequence from={1200} durationInFrames={300}>
        <SceneOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
