import { type NextPage } from "next";
import Head from "next/head";
import Header from "~/components/Header";
import { Card, Input, Row } from "@nextui-org/react";

import { api } from "~/utils/api";
import GrabbableObject from "~/components/GrabbableObject";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { saveNotesLocal, getNotesLocal } from "~/localstorage/noteStore";
import type { Notes } from "@prisma/client";
import { useSpring, animated } from "@react-spring/web";
import NavButton from "~/components/NavButton";
//import Paint from "~/components/Painting";
import type { UseTRPCQueryResult } from "@trpc/react-query/shared";


const Home: NextPage = () => {
  const user = useUser()
  const [notes, setNotes] = useState<Notes[]>([])
  const [newCard, setNewCard] = useState(false)
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [lastOpened, setLastOpened] = useState(false)
  const [shouldRenderNotes, setRenderNotes] = useState(false)
  const [shouldRun, setShouldRun] = useState(true)


  const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    setLastOpened(newCard)
    setNewCard(false)
    setModalPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    const deltaX = Math.abs(event.clientX - modalPosition.x);
    const deltaY = Math.abs(event.clientY - modalPosition.y);
    // change all these delta thing to be use for selection later
    if (lastOpened) {
      setNewCard(false)
      setLastOpened(false)
    } else if (deltaX < 5 && deltaY < 5) {
      setNewCard(true)
    } else {
      setModalPosition({ x: 0, y: 0 });
      setNewCard(false)
    }
  };
  type RemoteNotes = UseTRPCQueryResult<Notes[], unknown>;

  let remoteNotes: RemoteNotes
  if (user.user) {
    remoteNotes = api.notes.getNotes.useQuery({ userId: user.user.id });
  } else {
    remoteNotes = api.notes.getDefaultNotes.useQuery();
  }

  useEffect(() => {
    if (shouldRun && user.isLoaded && remoteNotes.data) {
      setRenderNotes(true)
      setShouldRun(false)
    }
  }, [user.isLoaded, remoteNotes.data, shouldRun])

  const noteSpring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: newCard ? 1 : 0, scale: newCard ? 1 : 0.9, left: modalPosition.x, top: modalPosition.y },
    config: { tension: 200, friction: 20 },
  })


  useEffect(() => {
    if (!remoteNotes.data) return
    const localNotes: Notes[] = getNotesLocal()
    let mergedNotes = [...localNotes]

    const existingIds = new Set(localNotes.map(note => note.id))

    if (remoteNotes.data) {
      remoteNotes.data?.forEach((remoteNote: Notes) => {
        if (!existingIds.has(remoteNote.id)) {
          mergedNotes.push(remoteNote);
          existingIds.add(remoteNote.id)
        }
      })

      if (user.user) {
        mergedNotes = mergedNotes.filter(note => note.authorId !== '0')
      }
    }

    setNotes(mergedNotes)
    saveNotesLocal(mergedNotes)
  }, [remoteNotes?.data, user.user])

  return (
    <>
      <Head>
        <title>VisuaThought</title>
        <meta name="description" content="A mind-mapping and note-taking application with fun included" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="flex h-full min-h-screen flex-col bg overflow-auto" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        {shouldRenderNotes &&
          notes.map(note => {
            return (
              <GrabbableObject title={note.title} body={note.content} startXPos={note.positionX} startYPos={note.positionY} key={note.id} id={note.id} createdAt={note.createdAt} />
            )
          })}

        {newCard &&
          <animated.div style={noteSpring} className={`card-modal absolute`} >
            <Card variant='shadow' style={{ display: 'inline-block', width: 'auto', border: '1px solid #0006' }}>
              <Card.Body>
                <Input placeholder='Jot down your mind!' />
              </Card.Body>
              <Card.Divider />
              <Card.Body css={{ py: "$6", height: '100%' }}>
                <Row>
                  <NavButton className='mr-2'>Remove</NavButton>
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
