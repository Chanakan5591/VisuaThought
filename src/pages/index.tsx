import Head from "next/head";
import Header from "~/components/Header";
import { Card, Row, Textarea } from "@nextui-org/react";

import { api } from "~/utils/api";
import GrabbableObject from "~/components/GrabbableObject";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect, useRef } from "react";
import { saveNotesLocal, getNotesLocal, getLocalInitialized, setLocalInitialized } from "~/localstorage/noteStore";
import type { Notes } from "@prisma/client";
import { useSpring, animated } from "@react-spring/web";
import NavButton from "~/components/NavButton";
//import Paint from "~/components/Painting";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";
import { createId } from "@paralleldrive/cuid2";
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { visit } from 'unist-util-visit'
import { remove } from 'unist-util-remove'
import remark2rehype from 'remark-rehype'
import stringify from 'rehype-stringify'
import { Toaster, toast } from "react-hot-toast";

interface DispNote extends Notes {
  title?: string,
  mdBody: string
}

const remarkProcessor = unified()
  .use(remarkParse)
  .use(remark2rehype)
  .use(stringify)

const Home = () => {
  const { isSignedIn, user, isLoaded: isClerkLoaded } = useUser()

  const [notesState, setNotes] = useState<DispNote[]>([])
  const [localStateNotes, setLocalNotes] = useState<Notes[]>([])
  const [editCard, setEditCard] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [lastOpened, setLastOpened] = useState(false)
  const [shouldRenderNotes, setRenderNotes] = useState(false)
  const [shouldRun, setShouldRun] = useState(true)
  const [mouseClick, setMouseClick] = useState(false)
  const [headerCreateClicked, setCreateClicked] = useState(false)
  const [createValue, setCreateValue] = useState('')
  const [prevUserState, setPrevUserState] = useState(false)
  const [shouldUpdateLocal, setShouldUpdateLocal] = useState(true)
  const [userToInitialize, SetUserInitialized] = useState(false)
  const [editNoteInitial, setEditInitial] = useState('')
  const [clickedId, setClickedId] = useState('')
  const [mergedStateNote, setMergedNote] = useState<Notes[]>([])
  const mainRef = useRef<HTMLDivElement>(null)
  const { mutate: storeNote } = api.notes.storeNote.useMutation({
    onError: (err) => {
      const errorMsg = err.data?.zodError?.fieldErrors.content
      if (errorMsg && errorMsg[0]) {
        toast.error(errorMsg[0])
      } else {
        switch(err?.data?.code) {
          case 'TOO_MANY_REQUESTS': {
            toast.error('You are being ratelimited')
          } break;
          case 'INTERNAL_SERVER_ERROR': {
            toast.error('An error occured while trying to save notes')
          } break;
          case 'UNAUTHORIZED': {
            toast.error('You need to be logged in to store notes on the cloud')
          } break;
          case 'TIMEOUT': {
            toast.error('Timed out while connecting to the server')
          } break;
        }
      }
    }
  })

  const { mutate: updateUserMetadata } = api.notes.updateUserInitialized.useMutation({
    onError: (err) => {
      console.log(err)
      const errorMsg = err.data?.zodError?.fieldErrors.content

      if (errorMsg && errorMsg[0]) {
        toast.error(errorMsg[0])
      } else {
        switch(err?.data?.code) {
          case 'TOO_MANY_REQUESTS': {
            toast.error('You are being ratelimited')
          } break;
          case 'INTERNAL_SERVER_ERROR': {
            toast.error('An error occured while trying to save user information')
          } break;
          case 'TIMEOUT': {
            toast.error('Timed out while connecting to the server')
          } break;
        }
      }
    }
  })

  const { mutate: deleteNote } = api.notes.deleteNote.useMutation({
    onError: (err) => {
      console.log(err)
      const errorMsg = err.data?.zodError?.fieldErrors.content

      if (errorMsg && errorMsg[0]) {
        toast.error(errorMsg[0])
      } else {
        switch(err?.data?.code) {
          case 'TOO_MANY_REQUESTS': {
            toast.error('You are being ratelimited')
          } break;
          case 'INTERNAL_SERVER_ERROR': {
            toast.error('An error occured while trying to save user information')
          } break;
          case 'TIMEOUT': {
            toast.error('Timed out while connecting to the server')
          } break;
        }
      }
    }
  })

  const setHeaderClicked = (value: boolean) => {
    setCreateClicked(value)
  }

  const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    let target = event.target as HTMLElement
    let targetModal = event.target as HTMLElement

    while (target !== null && target instanceof Element && !target.classList.contains("card")) {
      target = target.parentNode as HTMLElement
    }

    while (targetModal !== null && targetModal instanceof Element && !targetModal.classList.contains("card-modal")) {
      targetModal = targetModal.parentNode as HTMLElement
    }

    if ((event.target !== mainRef.current && !target) || (targetModal instanceof Element && targetModal)) {
      return;
    }

    const scrollX = window.scrollX || window.pageXOffset // fix: both of this returns 0 all the times
    const scrollY = window.scrollY || window.pageYOffset // fix: both of this returns 0 all the times

    setMouseClick(true)
    setLastOpened(editCard)
    setEditCard(false)
    setModalPosition({ x: event.clientX + scrollX, y: event.clientY + scrollY });
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLElement>) => {
    let target = event.target as HTMLElement
    let targetModal = event.target as HTMLElement

    while (target !== null && target instanceof Element && !target.classList.contains("card")) {
      target = target.parentNode as HTMLElement
    }

    while (targetModal !== null && targetModal instanceof Element && !targetModal.classList.contains("card-modal")) {
      targetModal = targetModal.parentNode as HTMLElement
    }

    if ((event.target !== mainRef.current && !target) || (targetModal instanceof Element && targetModal)) {
      return;
    }
    setMouseClick(false)
    const deltaX = Math.abs(event.clientX - modalPosition.x);
    const deltaY = Math.abs(event.clientY - modalPosition.y);
    // change all these delta thing to be use for selection later
    if (lastOpened) {
      setEditCard(false)
      setLastOpened(false)
    } else if (deltaX < 5 && deltaY < 5) {
      const t = target
      const id = t.id

      if (event.target !== mainRef.current && id) {
        const note = mergedStateNote.find(n => n.id === id)
        if(note?.content)
          setEditInitial(note?.content)
        setClickedId(target.id)
      }
      if (event.target === mainRef.current)
        setEditInitial('')
      setEditCard(true)
    } else {
      setModalPosition({ x: 0, y: 0 });
      setEditCard(false)
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      setEditCard(false)
      if (!createValue) return

      const notes: Notes[] = getNotesLocal()
      if (clickedId) {
        const updatedNotes = notes.map((note) => {
          if (note.id === clickedId) {
            const n = {
              ...note,
              content: createValue,
              positionX: modalPosition.x,
              positionY: modalPosition.y,
              updatedAt: new Date()
            }
            if (user) {
              storeNote({
                notes: n
              })

            }
            return n
          } else return note
        })

        saveNotesLocal(updatedNotes)
        setLocalNotes(updatedNotes)
        setClickedId('')
      } else {
        const newId = createId()
        const note = {
          id: newId,
          content: createValue,
          positionX: modalPosition.x,
          positionY: modalPosition.y,
          createdAt: new Date(),
          updatedAt: null,
          isDefault: false,
          authorId: user ? user.id : '0'
        }
        if (user) {
          storeNote({
            notes: note
          })
        }
        notes.push(note)
        saveNotesLocal(notes)
        setLocalNotes(notes)
      }

      setCreateValue('')
    }
  }

  const removeNote = () => {
    if(clickedId) {
      const notes: Notes[] = getNotesLocal()

      const updatedNotes = notes.filter(n => n.id !== clickedId)
      setEditCard(false)

      if(isSignedIn) {
        deleteNote({
          noteId: clickedId
        })
      }

      saveNotesLocal(updatedNotes)
      setLocalNotes(updatedNotes)

      toast.success('Note have been deleted')

      setClickedId('')
      
    } else {
      setEditCard(false)
      toast.success('Note have been deleted')
    }
  }

  type RemoteNotes = UseTRPCQueryResult<Notes[], unknown>;

  let remoteNotes: RemoteNotes
  if (isSignedIn) {
    remoteNotes = api.notes.getNotes.useQuery();
  } else {
    remoteNotes = api.notes.getDefaultNotes.useQuery();
  }

  useEffect(() => {
    if (shouldRun && isClerkLoaded && remoteNotes.data) {
      setRenderNotes(true)
      setShouldRun(false)
    }
  }, [isClerkLoaded, remoteNotes.data, shouldRun])

  useEffect(() => {
    if (headerCreateClicked) setEditCard(false)
  }, [headerCreateClicked])

  const noteSpring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: editCard ? 1 : 0, scale: editCard ? 1 : 0.9, left: modalPosition.x, top: modalPosition.y },
    config: { tension: 200, friction: 20 },
  })

  useEffect(() => {
    if (shouldUpdateLocal) {
      setShouldUpdateLocal(false)
      setLocalNotes(getNotesLocal())
    }
  }, [shouldUpdateLocal])

  useEffect(() => {
    if (!remoteNotes.data || !isClerkLoaded) return
    const localNotes: Notes[] = localStateNotes

    const existingNotes = new Map(localNotes.map((note: Notes) => [note.id, note]))
    let mergedNotes: Notes[]

    if(isSignedIn || !getLocalInitialized()) {
      if (remoteNotes.data) {
        remoteNotes.data?.forEach((remoteNote: Notes) => {
          const existingNote = existingNotes.get(remoteNote.id)
          if (!existingNote || (remoteNote.updatedAt ?? remoteNote.createdAt) > (existingNote.updatedAt ?? existingNote.createdAt)) {
            existingNotes.set(remoteNote.id, remoteNote)
          }
        })
      }

      if(!isSignedIn) {
        saveNotesLocal(existingNotes)
        setLocalInitialized(true)
      }
    }

    localNotes.forEach((localNote: Notes) => {
      const existingNote = existingNotes.get(localNote.id)
      if (!existingNote || (localNote.updatedAt ?? localNote.createdAt) > (existingNote.createdAt ?? existingNote.createdAt)) {
        existingNotes.set(localNote.id, localNote)
      }
    })

    mergedNotes = [...existingNotes.values()]
    if (isSignedIn) {
      if (!prevUserState) {
        localNotes.forEach((note) => {
          if (note.authorId === '0') {
            if (note.isDefault) {
              if (user.publicMetadata.hasOwnProperty('userInitialized') && user.publicMetadata.userInitialized as boolean) return
              SetUserInitialized(true)
            }
            // mutate to server then save to mergednotes
            const nid = createId()
            const defToUserNote = {
              ...note,
              id: nid,
              authorId: user.id
            }

            storeNote({
              notes: defToUserNote
            })

            mergedNotes.push(defToUserNote)
          }
        })
        setPrevUserState(true)
      }
      mergedNotes = mergedNotes.filter(note => note.authorId !== '0')
      setShouldUpdateLocal(true)
      if (userToInitialize) {
        SetUserInitialized(false)
        updateUserMetadata({
          initialized: true
        })
      }
    } else {
      if (prevUserState) setPrevUserState(false)
      mergedNotes = mergedNotes.filter(note => note.authorId === '0') // user might have logged out so clear any of the users notes
    }

    setMergedNote(mergedNotes)
    saveNotesLocal(mergedNotes)

    const dispNote = mergedNotes.map(n => {
      const note = { ...n } as DispNote
      const ast = remarkProcessor.parse(note.content)
      let aTitle: string | undefined = undefined
      visit(ast, 'heading', (node) => {
        if (!aTitle) {
          const child = node.children[0]
          if (child && child.type === 'text') aTitle = child.value
        }
      })

      remove(ast, { type: 'heading', depth: 1 })
      const htmlAst = remarkProcessor.runSync(ast)
      const html = remarkProcessor.stringify(htmlAst)
      note.title = aTitle
      note.content = html
      note.mdBody = n.content
      return note
    })

    setNotes(dispNote)
  }, [remoteNotes?.data, isSignedIn, localStateNotes, storeNote, prevUserState, isClerkLoaded, user?.id, updateUserMetadata, user?.publicMetadata, userToInitialize])

  return (
    <>
      <Head>
        <title>VisuaThought</title>
        <meta name="description" content="A mind-mapping and note-taking application with fun included" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster />
      <Header mouseClickedMain={mouseClick} createClicked={setHeaderClicked} />
      <main ref={mainRef} className="flex h-full min-h-screen flex-col bg overflow-scroll" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        {shouldRenderNotes &&
          notesState.map(note => {
            //            const formattedDate = new Date(note.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long' });

            return (
              <GrabbableObject onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} title={note.title} isDefault={note.isDefault} mdBody={note.mdBody} body={note.content} startXPos={note.positionX} startYPos={note.positionY} key={note.id} id={note.id} createdAt={note.createdAt} />)
          })}

        {editCard &&
          <animated.div style={noteSpring} className={`card-modal absolute`} >
            <Card variant='shadow' style={{ display: 'inline-block', width: 'auto', border: '1px solid #0006' }}>
              <Card.Body>
                <Textarea initialValue={editNoteInitial} onKeyDown={handleKeyDown} onChange={(e) => setCreateValue(e.target.value)} placeholder='Jot down your mind!' />
              </Card.Body>
              <Card.Divider />
              <Card.Body css={{ py: "$6", height: '100%' }}>
                <Row>
                  <NavButton onClick={removeNote} className='mr-2 bg-red-300'>Remove</NavButton>
                  <NavButton className='flex justify-center items-center mr-2'>P</NavButton>
                  <div className='inline-block relative px-[9px] py-[5px] border border-[#0006] rounded-md'>
                    <label>
                      <input type='checkbox' />
                    </label>
                  </div>
                </Row>
              </Card.Body>
            </Card>

          </animated.div>
        }
      </main>
    </>
  );
};

export default Home;
