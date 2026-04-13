"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";

// ============================================================
// LOCAL DATABASE HELPERS
// Data disimpan di local-db.json untuk mode development lokal.
// Saat siap deploy ke Vercel, ganti fungsi ini dengan Supabase Auth.
// ============================================================

const DB_PATH = path.join(process.cwd(), "local-db.json");

type User = {
  id: string;
  email: string;
  password: string; // NOTE: plaintext untuk development lokal saja
  fullName: string;
  school: string;
  createdAt: string;
};

type DB = {
  users: User[];
};

function readDB(): DB {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { users: [] };
  }
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ============================================================
// SERVER ACTIONS
// ============================================================

export type AuthResult = {
  success: boolean;
  error?: string;
};

/** Mendaftarkan user baru ke local-db.json */
export async function registerLocalUser(formData: FormData): Promise<AuthResult> {
  const fullName = formData.get("fullName")?.toString().trim();
  const school = formData.get("school")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!fullName || !school || !email || !password) {
    return { success: false, error: "Semua kolom wajib diisi." };
  }

  if (password.length < 6) {
    return { success: false, error: "Kata sandi minimal 6 karakter." };
  }

  const db = readDB();
  const existing = db.users.find((u) => u.email === email);

  if (existing) {
    return { success: false, error: "Email sudah terdaftar. Silakan login." };
  }

  const newUser: User = {
    id: generateId(),
    email,
    password, // plaintext — development only
    fullName,
    school,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDB(db);

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("local_session", JSON.stringify({ id: newUser.id, email: newUser.email, fullName: newUser.fullName }), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    sameSite: "lax",
  });

  return { success: true };
}

/** Login user dari local-db.json */
export async function loginLocalUser(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { success: false, error: "Email dan kata sandi wajib diisi." };
  }

  const db = readDB();
  const user = db.users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, error: "Email atau kata sandi salah." };
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("local_session", JSON.stringify({ id: user.id, email: user.email, fullName: user.fullName }), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });

  return { success: true };
}

/** Logout user */
export async function logoutLocalUser() {
  const cookieStore = await cookies();
  cookieStore.delete("local_session");
  redirect("/login");
}

/** Mendapatkan user yang sedang login dari cookie */
export async function getLocalSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("local_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; email: string; fullName: string };
  } catch {
    return null;
  }
}
