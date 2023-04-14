import { type Notes } from "@prisma/client";
import { getCookie, setCookie } from 'typescript-cookie'

export const saveNotesLocal = (notes: any) => {
  if (typeof window !== 'undefined') localStorage.setItem(`notes`, JSON.stringify(notes)); // an array of notes
}

export const getNotesLocal = () => {
  if (typeof window !== 'undefined') return (JSON.parse(localStorage.getItem('notes') || '[]') as Notes[])
  else return []
}

export const setLocalInitialized = (value: boolean) => {
  setCookie('defaultInitialized', value)
}

export const getLocalInitialized = () => {
  return (getCookie('defaultInitialized') === 'true')
}