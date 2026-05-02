# Steps Guidance — Website user guide

This document explains **what you can do on the website** and **how to do it**. It is meant for students, staff, and trainers—no technical setup.

---

## Contents

1. [What this website is](#1-what-this-website-is)
2. [Signing in](#2-signing-in)
3. [What students can do](#3-what-students-can-do)
4. [What admins can do](#4-what-admins-can-do)
5. [Question types (for reference)](#5-question-types-for-reference)
6. [Quick reminders](#6-quick-reminders)

---

## 1. What this website is

**Steps Guidance** is an online **career discovery** tool. Students answer a structured questionnaire; the system analyses their answers and shows a **personal report** (scores, traits, career fit ideas, and an AI-written summary).

---

## 2. Signing in

### Open the site

Use the web address your organisation gives you.  
If you are not signed in, you will land on the **login** page.

### Choose your role

At the top of the login form, pick one:

| Toggle | Who uses it |
|--------|-------------|
| **Student** | Students taking the assessment |
| **Admin** | Staff managing accounts, questions, and viewing results |

### Student login

1. Select **Student**.
2. Enter your **email** and **password**.
3. Submit the form.

**Note:** In normal (live) mode, the email must be a **Gmail address** (`@gmail.com`). If you see an error about the email format, check spelling and that it ends with `@gmail.com`.

After login, students go straight to the **assessment** (or to **results** if they already finished once—retakes are blocked once completed).

### Admin login

1. Select **Admin**.
2. Enter your **username** and **password** (as set up by your organisation—not always an email).
3. Submit the form.

After login, admins see the **admin dashboard** (overview and menu).

### After sign-in

- Visiting the home page while signed in sends you to the right place automatically: **students** → assessment (or results); **admins** → admin area.

---

## 3. What students can do

### 3.1 Take the career assessment

| Step | What to do |
|------|------------|
| 1 | After login, you are on the **Career Discovery Assessment** screen. |
| 2 | Read each **question** and the **section label** (letters A–G show which part of the survey you are in). |
| 3 | Tap or click **one answer** for that question (sometimes you can type extra text if “your own answer” is offered on that option). |
| 4 | Use **Next** to continue, or **Previous** to go back. |
| 5 | On the **last question**, use **Submit assessment** instead of Next. |
| 6 | Wait on the “analysing…” screen while your report is prepared (this can take up to about a minute). |
| 7 | When it finishes, you are taken to your **results**. |

**Progress:** A bar at the top shows how far you are through all questions.

**Saving your work:** Progress is saved along the way where the system allows. If you interrupted earlier, you may be asked **Resume** or **Start fresh** when you return—choose what fits you.

### 3.2 View your results

After a successful submit, you stay on the **results** page. It typically includes:

- **AI Readiness** and a short profile hint  
- **Trait** scores and a simple chart  
- **Section scores** across the survey  
- **Career fit** (main matches and other notes)  
- An **AI advisor** style summary in plain language  

If you try to open the assessment again after you have **already completed** it, the site will usually send you back to **results** only.

### 3.3 What students do *not* do on this site

Students **do not**:

- Add or remove other users  
- Edit the question bank  
- Download the **PDF** copy of the dashboard (that is an **admin** tool in this product)  
- Retake the full assessment after it is marked complete (unless an admin changes your account outside this guide)  

---

## 4. What admins can do

The admin area uses a **sidebar menu**. Below is what each part is for and how to use it.

---

### 4.1 Overview

**Purpose:** A quick look at recent student activity and readiness.

**Typical actions:**

- Scan the list or cards of students shown there.  
- If a **PDF** button appears for a student who has completed the test, you can use it to download a **formatted report** for that person.

---

### 4.2 Manage users (students)

**Purpose:** Create student accounts and maintain the student list.

**Add a new student**

1. Open **Manage users** (or similar label in the sidebar).  
2. Fill in **name**, **email**, and **temporary password** (or permanent—per your policy).  
3. Save / create.  

**Email rule:** New students should use a **`@gmail.com`** address where the system requires it.

**Remove a student**

1. Find the student in the table.  
2. Use **delete / remove** (and confirm if a dialog appears).  

This usually removes their account and tied assessment data **permanently**—only do this when intended.

**Download PDF**

- For students who have **finished** the assessment, use the **PDF** action in the row to save their report file.

---

### 4.3 Question bank

**Purpose:** Own the master list of assessment questions students see.

**View questions**

- Questions are grouped by **section (A–G)**. Expand a section to see all items in order.

**Add a question**

1. Open **Add question** (or equivalent).  
2. Choose **Section** (A–G), **layer** (survey depth tag), **type** (see [§5](#5-question-types-for-reference)), and type the **question text**.  
3. Add **options**: each row needs visible **labels** (and optional internal IDs). You need **at least two** options per question.  
4. Optionally turn on **“allow user’s own answer”** for one option (e.g. “Other”) and add a hint text if you like.  
5. Save.

**Important:** New questions are placed **at the end of that section**, not necessarily at the end of the entire survey. Sections stay in **A→G order** overall.

**Delete a question**

- Use the trash / delete control on that question card and confirm.  
- Removing an option inside a question may be limited so the question always keeps at least two choices.

---

### 4.4 Open a student’s full result

**Purpose:** See the same style of dashboard a student sees, for support or review.

**How**

1. From **Overview** or **Manage users**, open the student you need (e.g. “View result” or their name).  
2. Review the full layout.  
3. Use **Download PDF** on that screen if you need a file copy.

---

### 4.5 System status

**Purpose:** Check whether core services (database, AI, API) look healthy.

**How**

- Open **System status** and read the green/red or ok/fail style messages.  
- Use this when something “won’t load” or results stay stuck—your technical contact will also use this page.

---

## 5. Question types (for reference)

When you **create** a question, you pick a **type** label. For **students**, all types work the same way on screen: they **choose one option** from the list (including “scale” style questions, which are written as several labeled steps, e.g. 1–5).

| Type in the form | Meaning in practice |
|------------------|---------------------|
| **Multiple choice** | Pick one standard option. |
| **Forced choice** | Pick one from two (or more) contrasting options. |
| **Scale** | Pick one point on a scale you defined as separate options (not a drag slider). |

Students always move **one question at a time** until submit.

---

## 6. Quick reminders

| For students | For admins |
|--------------|------------|
| Use **@gmail.com** when the site asks for Gmail. | Use the **Question bank** to control what students see; changes apply on their **next** load of the assessment. |
| Finish with **Submit** on the last question. | **PDF** is available from admin views for students who **completed** the test. |
| If you already finished, you may only see **results**. | Deleting a user or question is **permanent**—confirm before removing. |
| Use **Resume** if you paused mid‑quiz and the site offers it. | New questions slot **after others in the same section (A–G)**. |

---

**End of guide. For installing or deploying the software, see `frontend/README.md` and `backend/README.md`.**
