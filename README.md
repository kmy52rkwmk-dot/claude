# Omar Alshaer — photo site

A one-page website for Engineer Omar Alshaer ([@3mar_alshaer](https://instagram.com/3mar_alshaer)):

- **Hero** with his name (English + Arabic), tagline, Instagram button and live stats
- **Work** — Omar's photo gallery. Every photo opens in a viewer with likes (double-tap works too) and comments
- **About** — a "spec sheet" with his general info and interests
- **Community** — anyone can upload a photo with their name and caption; others can like and comment
- **Connect** — big links to all his accounts
- **Owner login** (footer) — Omar can publish to Work and delete any post or comment
- Dark/light theme, works on phones, no build step — plain HTML, CSS and JavaScript

```
index.html          the page
css/style.css       all styling
js/config.js        ← edit this: name, bio, facts, social links, database keys
js/app.js           site logic
supabase/schema.sql database setup (run once)
images/             put Omar's profile photo here
```

## 1. Personalise it

Open `js/config.js` and fill in:

- `tagline`, `about` (bio paragraphs) and `facts` (Based in, Education, Camera …). Empty values are hidden.
- `avatar` — save Omar's profile photo as `images/omar.jpg` and set `avatar: "images/omar.jpg"`.
- `socials` — Instagram is already set. Add X, TikTok, Snapchat, LinkedIn, YouTube, WhatsApp or email and they appear automatically.
- Check `nameArabic` is spelled the way Omar writes it.

## 2. Preview (demo mode)

Double-click `index.html`. With no database keys the site runs in **demo mode**: it shows sample photos, and anything you post, like or comment is saved only in your own browser. Click **Owner login** in the footer to preview the owner tools.

## 3. Go live — so everyone shares the same posts and comments

The site uses [Supabase](https://supabase.com) (free tier is enough) to store posts, comments and photos.

1. Create a free account and a **New project**.
2. Open **SQL Editor → New query**, paste everything from `supabase/schema.sql`, and click **Run**.
3. **Authentication → Users → Add user**: create Omar's login (email + password, tick *Auto confirm*).
4. Back in the SQL Editor, run this with Omar's real email:
   ```sql
   insert into public.owners (email) values ('omar@example.com');
   ```
5. **Authentication → Sign In / Providers**: turn off **Allow new users to sign up** (only Omar needs an account).
6. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key** into `js/config.js`:
   ```js
   supabase: {
     url: "https://xxxx.supabase.co",
     anonKey: "eyJ... or sb_publishable_...",
   },
   ```
   The anon key is meant to be public — the database rules in `schema.sql` decide what visitors can do.
7. Reload the page: the demo banner is gone and the site is live. Omar signs in from **Owner login** and publishes his first photos from the panel that appears in **Work**.

## 4. Put it online

It's a static site, so any free host works:

- **Netlify Drop** — drag the whole folder onto <https://app.netlify.com/drop>. Done.
- **GitHub Pages** — push the folder to a repository → Settings → Pages → deploy from the main branch.
- **Vercel / Cloudflare Pages** — import the folder, no build command.

Then put the link in Omar's Instagram bio.

## What visitors can and can't do

| Action | Visitors | Omar (signed in) |
| --- | --- | --- |
| View photos & comments | ✅ | ✅ |
| Like a photo (once per browser) | ✅ | ✅ |
| Comment | ✅ with a name | ✅ with an **Owner** badge |
| Share to Community | ✅ | ✅ |
| Publish to Work | — | ✅ |
| Delete posts / comments | — | ✅ |

Uploads are resized in the browser (max 1800 px) before upload, and the storage bucket rejects anything over 5 MB or that isn't JPG/PNG/WEBP. Because anyone can post, Omar should check the Community section now and then and delete anything unwanted.
