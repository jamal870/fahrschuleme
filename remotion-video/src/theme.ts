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
  primary: "#e8501a",
  primaryDark: "#b53a10",
  ink: "#101418",
  paper: "#fafaf7",
  cream: "#f3ede3",
  accent: "#ffd9c7",
};
