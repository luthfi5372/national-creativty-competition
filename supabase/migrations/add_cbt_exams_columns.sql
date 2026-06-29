-- Migration: Add shuffle_questions and description columns to cbt_exams
-- Run this in your Supabase SQL Editor to sync your database schema.

ALTER TABLE public.cbt_exams 
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT true;

ALTER TABLE public.cbt_exams 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
