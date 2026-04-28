# 📍 FINDING myapp DATABASE IN pgAdmin - EXACT STEPS

## STEP 1: Make sure pgAdmin is open
Go to: **http://localhost:5050**

Should see pgAdmin interface

---

## STEP 2: Look at LEFT SIDE (very important)

You should see on the **left side** a panel with:
```
🏠 Dashboard

📦 Servers
  └── PostgreSQL
       ├── Databases
       ├── Login/Group Roles
       └── etc...
```

---

## STEP 3: Click the ARROW next to "Servers"

If you don't see it expanded, click the **▶ arrow** next to "Servers" to expand it

You should now see:
```
📦 Servers
  ▼ PostgreSQL
    ├── Databases
    ├── Login/Group Roles
    └── Tablespaces
```

---

## STEP 4: Click the ARROW next to "PostgreSQL"

Click the **▶ arrow** next to "PostgreSQL" to expand it

You should see:
```
📦 Servers
  ▼ PostgreSQL
    ▼ Databases
      ├── myapp        ← THIS ONE!
      ├── postgres
      └── template0
    ├── Login/Group Roles
    └── Tablespaces
```

---

## STEP 5: Find "myapp"

Under **Databases**, you should see:
- **myapp** ← Click this one

---

## STEP 6: Right-click on "myapp"

Right-click on **myapp** database

You should see a **context menu** with options:
```
Create
  ├── Schema
  ├── Database
  └── etc...

Query Tool          ← This one!
Execute Script
Create Script
Backup
Restore
etc...
```

---

## STEP 7: Click "Query Tool"

Click on **Query Tool** from the menu

A **new window** should open with a text editor area

---

## ✅ THEN YOU'RE READY!

Once Query Tool opens:
1. Paste the SQL content
2. Press F5 to execute
3. Done!

---

## 🔍 CAN'T FIND IT? Try this:

### If LEFT sidebar is not visible:
- Look for a **➤ button** (menu icon) on the left
- Click it to show the sidebar

### If you don't see "PostgreSQL":
- Click **Dashboard** at top
- Then click **Servers** menu
- Should expand to show PostgreSQL

### If still stuck:
- Close pgAdmin: http://localhost:5050/logout
- Reopen: http://localhost:5050
- Try again from Step 2

---

## 📸 VISUAL LAYOUT

```
┌─────────────────────────────────────────────┐
│ pgAdmin Interface                           │
├──────────────┬──────────────────────────────┤
│              │                              │
│  LEFT SIDE   │     MAIN AREA                │
│  (Sidebar)   │     (Shows query tool)       │
│              │                              │
│  ├─ Servers  │                              │
│  │ └─ Postgr │                              │
│  │   ├─ Data │                              │
│  │   │ └─ my │     [Text editor for SQL]    │
│  │   │  app  │                              │
│  └─ ...      │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

---

## 🆘 STILL CAN'T FIND IT?

**Tell me:**
1. What do you see in the LEFT sidebar?
2. Do you see "Servers"?
3. Do you see "PostgreSQL"?
4. Do you see "Databases"?

Try to describe what you see and I'll guide you from there!

---

**Key thing:** Look for the LEFT sidebar panel with tree structure (►, ▼ arrows)
