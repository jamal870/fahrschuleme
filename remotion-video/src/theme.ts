import { loadFont as loadRajdhani } from "@remotion/google-fonts/Rajdhani";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";

export const rajdhani = loadRajdhani("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const dmSans = loadDMSans("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
}).fontFamily;

export const COLORS = {
  primary: "#1DC4F2",
  primaryDark: "#0A8FB8",
  ink: "#101418",
  paper: "#fafaf7",
  cream: "#eaf7fc",
  accent: "#c7ecf7",
};
