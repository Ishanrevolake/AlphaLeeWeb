import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const packages = [
  {
    id: "consult-inperson", category: "One-Off", letter: "IC", title: "In-Person Consultation", subtitle: "Face-To-Face Fitness Guidance", price_lkr: 15000, footer_text: "Personalised Guidance", detail_subtitle: "A personalised consultation for clients who prefer direct interaction and coaching.", example: "Ideal for goals, nutrition, training challenges and plateaus", features: ["One-on-one consultation", "Personalised recommendations", "Training and nutrition guidance", "Clear next steps based on your goals"], sort_order: 90,
  },
  {
    id: "consult-online", category: "One-Off", letter: "OC", title: "Online Consultation", subtitle: "Expert Guidance From Anywhere", price_lkr: 10500, footer_text: "Personalised Guidance", detail_subtitle: "A convenient option for personalised advice through an online consultation.", example: "Ideal for training, nutrition, goal setting and progress reviews", features: ["One-on-one online consultation", "Personalised recommendations", "Training and nutrition guidance", "Actionable steps to move forward"], sort_order: 100,
  },
  {
    id: "programme-review", category: "One-Off", letter: "PR", title: "Training Programme Review", subtitle: "Programme Assessment", price_lkr: 5500, footer_text: "Professional Assessment", detail_subtitle: "Get expert feedback on your current workout programme without needing a completely new programme.", example: "Find out whether your programme is structured correctly", features: ["Exercise selection review", "Training volume assessment", "Training frequency review", "Programme structure analysis", "Progression recommendations", "Areas for improvement"], sort_order: 110,
  },
  {
    id: "technique-single", category: "One-Off", letter: "SR", title: "Single Exercise Review", subtitle: "Review One Exercise", price_lkr: 2500, footer_text: "Video Technique Review", detail_subtitle: "Perfect if you need professional feedback on one specific movement.", example: "Focused technique feedback for one exercise", features: ["Video technique assessment", "Feedback on execution", "Key corrections and recommendations"], sort_order: 120,
  },
  {
    id: "technique-full", category: "One-Off", letter: "FR", title: "Full Technique Review", subtitle: "Review Up To 10 Exercises", price_lkr: 7500, footer_text: "Complete Technique Review", detail_subtitle: "Ideal for a more complete assessment of your training technique.", example: "Professional feedback for up to 10 exercises", features: ["Review of up to 10 exercises", "Technique feedback for each movement", "Corrections and coaching cues", "Recommendations to improve performance and safety"], sort_order: 130,
  },
].map((item) => ({
  ...item,
  old_price_text: null,
  strike_old_price: false,
  is_popular: false,
  is_active: true,
}));

const { error } = await supabase.from("packages").upsert(packages, { onConflict: "id" });
if (error) throw error;

const ids = packages.map(({ id }) => id);
const { data, error: verifyError } = await supabase
  .from("packages")
  .select("id,title,price_lkr,is_active,sort_order")
  .in("id", ids)
  .order("sort_order");

if (verifyError) throw verifyError;
if (data.length !== packages.length) throw new Error(`Expected ${packages.length} rows, found ${data.length}.`);

console.log(JSON.stringify(data, null, 2));
