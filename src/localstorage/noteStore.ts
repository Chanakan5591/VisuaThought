import { type Notes } from "@prisma/client";

export const saveNotesLocal = (notes: any) => {
  if (typeof window !== 'undefined') localStorage.setItem(`notes`, JSON.stringify(notes)); // an array of notes
}

export const getNotesLocal = () => {
  if (typeof window !== 'undefined') return (JSON.parse(localStorage.getItem('notes') || '[]') as Notes[])
  else return []
}
