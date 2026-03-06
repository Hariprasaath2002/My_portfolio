# Hariprasaath J — Portfolio

Personal portfolio for Hariprasaath J, Backend Developer at Tata Consultancy Services.

**Stack:** Pure HTML · CSS · Vanilla JS · WebGL2 · EmailJS

---

## 📁 Project Structure

```
portfolio/
├── index.html          ← Main page
├── css/
│   └── style.css       ← All styles (edit :root for colors)
├── js/
│   └── main.js         ← All scripts
├── assets/             ← Put extra images/icons here
├── photo.jpg           ← YOUR PHOTO — add this!
├── .gitignore
└── README.md
```

---

## 🖼 Adding Your Photo

1. Name your photo **`photo.jpg`**  
2. Drop it in the root folder (same level as `index.html`)  
3. Open in browser — done

> Using `.png`? Find the 2 occurrences of `src="photo.jpg"` in `index.html` and change to `src="photo.png"`

---

## 🛠 Run Locally

Install the **Live Server** extension in VS Code, then right-click `index.html` → **Open with Live Server**

---

## 📧 Contact Form (EmailJS)

1. Sign up free at [emailjs.com](https://emailjs.com)
2. Add Gmail as a service → copy **Service ID**
3. Create a template with `from_name`, `from_email`, `subject`, `message` → copy **Template ID**
4. Account → copy **Public Key**
5. Open `js/main.js`, find and replace these 3 values near the top:

```js
var EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
var EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
```

---

## 🚀 Host on GitHub Pages (Free)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git push -u origin main
```

Then: **GitHub repo → Settings → Pages → Branch: main → / (root) → Save**

Your site goes live at: `https://YOUR_USERNAME.github.io/portfolio`

---

## 🎨 Customise Colors

Open `css/style.css` and edit the `:root` block at the top:

```css
:root {
  --accent:  #38bdf8;   /* sky blue — change to any color */
  --green:   #34d399;   /* dot & active badge color */
  --bg:      #141418;   /* page background */
}
```
