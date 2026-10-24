/* ==========================================================================
   SITE SETTINGS — edit this file to personalise the site.
   Everything here appears on the page. Leave a value "" to hide it.
   ========================================================================== */
window.SITE_CONFIG = {
  name: "Omar Alshaer",
  nameArabic: "عمر الشاعر",
  title: "Engineer",
  tagline:
    "Engineer by profession, photographer by passion. Sharing the world as I see it — one frame at a time.",

  // Profile photo: put a file in the images/ folder and write e.g. "images/omar.jpg".
  // Leave empty to show his initials instead.
  avatar: "",

  // About section — one string per paragraph.
  about: [
    "I'm Omar — an engineer who notices the lines, light and structure hiding in everyday scenes. Photography is how I slow down and keep the moments worth remembering.",
    "This site is home for my photos and for everyone who enjoys them. Leave a comment, or share a shot of your own in the community section.",
  ],

  // The "spec sheet" rows in the About section. Empty values are hidden.
  facts: [
    { label: "Profession", value: "Engineer" },
    { label: "Passion", value: "Photography" },
    { label: "Based in", value: "" },
    { label: "Education", value: "" },
    { label: "Camera", value: "" },
  ],

  interests: ["Photography", "Engineering", "Design", "Light & composition"],

  // Usernames (without @) or full links. Empty = hidden.
  socials: {
    instagram: "3mar_alshaer",
    x: "",
    tiktok: "",
    snapchat: "",
    linkedin: "", // full URL, e.g. "https://www.linkedin.com/in/..."
    youtube: "", // full URL
    whatsapp: "", // international number, e.g. "96891234567"
    email: "",
  },

  // Go live: paste the Supabase project URL and anon (publishable) key here — see README.md.
  // While these are empty the site runs in DEMO MODE: posts and comments stay in this browser only.
  supabase: {
    url: "",
    anonKey: "",
  },
};
