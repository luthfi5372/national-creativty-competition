export type Announcement = {
  id: string;
  title: string;
  date: string;
  type: string;
  content: string;
  mediaUrl?: string | null; // COMPLIANT WITH USER GUIDE
};
