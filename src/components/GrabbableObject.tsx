import { useUser } from '@clerk/nextjs'
import { Card, Row, Text } from '@nextui-org/react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { useState } from 'react'
import React from 'react'
import useSound from 'use-sound'
import { getNotesLocal, saveNotesLocal } from '~/localstorage/noteStore'
import { api } from '~/utils/api'
import { createId } from '@paralleldrive/cuid2'
import type { Notes } from '@prisma/client'
import { toast } from 'react-hot-toast'

interface Props {
  title?: string,
  body: string,
  mdBody: string,
  startXPos: number,
  startYPos: number,
  id: string,
  createdAt: Date,
  isDefault: boolean,
  onMouseDown: (event: React.MouseEvent<HTMLElement>) => void,
  onMouseUp: (event: React.MouseEvent<HTMLElement>) => void
}

const GrabbableObject = (props: Props) => {
  const user = useUser()
  const [{ x, y }, sApi] = useSpring(() => ({ x: props.startXPos, y: props.startYPos }))
  const [startX, setStartX] = useState(props.startXPos)
  const [startY, setStartY] = useState(props.startYPos)
  const [isDown, setDown] = useState(false)
  const [placeFX] = useSound('sounds/card-place.mp3')
  const { mutate } = api.notes.storeNote.useMutation({
    onError: (err) => {
      switch(err?.data?.code) {
        case 'TOO_MANY_REQUESTS': {
          toast.error('You are being ratelimited')
        } break;
        case 'INTERNAL_SERVER_ERROR': {
          toast.error('An error occured while trying to save notes')
        } break;
        case 'UNAUTHORIZED': {
          toast.error('You need to be logged in to store notes on the cloud')
        }
      }
    }
  })

  const bind = useDrag(({ event, down, movement: [mx, my] }) => {
    const ignoreButton = (event.target as Element).closest('.connector')


    if (!ignoreButton) {

      setDown(down)
      if (down) {
        const newX = Math.max(0, mx + startX)
        const newY = Math.max(0, my + startY)
        sApi.start({ x: newX, y: newY, immediate: down })
      } else {
        placeFX()
        setStartX(x.get())
        setStartY(y.get())
        const notes: Notes[] = getNotesLocal()
        const currInLocalNoteIdx = notes.findIndex(note => note.id === props.id)
        const currInLocalNote = notes.find(note => note.id === props.id) as Notes

        currInLocalNote.positionX = x.get()
        currInLocalNote.positionY = y.get()
        notes[currInLocalNoteIdx] = currInLocalNote

        if (user.user) {
          const n = {
            id: props.id,
            content: props.mdBody,
            positionX: x.get(),
            positionY: y.get(),
            authorId: user.user.id,
            createdAt: props.createdAt,
            updatedAt: null,
            isDefault: props.isDefault
          }

          if (currInLocalNote.authorId === '0') {
            n.id = createId()
            mutate({
              notes: n
            })

            notes[currInLocalNoteIdx] = n
          } else {
            mutate({
              notes: n
            })
          }
        }
        saveNotesLocal(notes)

      }
    }
  })


  return (
    <animated.div id={props.id} onMouseDown={props.onMouseDown} onMouseUp={props.onMouseUp} className='card max-w-[400px] absolute' {...bind()} style={{ x, y, touchAction: 'none', cursor: 'pointer', userSelect: 'none', overflow: 'visible' }}>
      <Card variant={isDown ? 'shadow' : 'bordered'} style={{ width: 'auto' }}>
        <Card.Header>
          <Row justify='space-between' className='items-center'>
            <Text b>{props.title ? props.title : new Date(props.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long' })}</Text>
            <button className='ml-4 connector bg-transparent border-2 border-solid rounded-full w-4 h-4 cursor-cell'></button>
          </Row>
        </Card.Header>
        <Card.Divider />
        <Card.Body css={{ py: "$10", height: '100%' }}>
          <div dangerouslySetInnerHTML={{ __html: props.body }}></div>
        </Card.Body>
      </Card>
    </animated.div>
  )
}

export default GrabbableObject;
