import { useUser } from '@clerk/nextjs'
import { Card, Grid, Row, Text } from '@nextui-org/react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import React from 'react'
import useSound from 'use-sound'
import { getNotesLocal, saveNotesLocal } from '~/localstorage/noteStore'
import { api } from '~/utils/api'
import { createId } from '@paralleldrive/cuid2'

interface Props {
  title: string,
  body: string,
  startXPos: number,
  startYPos: number,
  id: string
}

const GrabbableObject = (props: Props) => {
  const user = useUser()
  const [{ x, y }, sApi] = useSpring(() => ({ x: props.startXPos, y: props.startYPos }))
  const [startX, setStartX] = useState(props.startXPos)
  const [startY, setStartY] = useState(props.startYPos)
  const [isDown, setDown] = useState(false)
  const [placeFX] = useSound('sounds/card-place.mp3')
  const { mutate } = api.notes.storeNote.useMutation({
    onSuccess: () => {
      null // placeholder for now
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
        const notes = getNotesLocal()
        const currInLocalNoteIdx = notes.findIndex(note => note.id === props.id)
        let currInLocalNote = notes.find(note => note.id === props.id)

        currInLocalNote.positionX = x.get()
        currInLocalNote.positionY = y.get()
        notes[currInLocalNoteIdx] = currInLocalNote

        if (user.user) {
          let n = {
            id: props.id,
            title: props.title,
            content: props.body,
            positionX: x.get(),
            positionY: y.get(),
            authorId: user.user.id

          }

          if (currInLocalNote.authorId == 0) {
            n.id = createId()
            mutate({
              id: n.id,
              notes: n
            })

            notes[currInLocalNoteIdx] = n
          } else {
            mutate({
              id: props.id,
              notes: n
            })
          }
        }
        saveNotesLocal(notes)

      }
    }
  })



  return (
    <animated.div className='relative' {...bind()} style={{ x, y, touchAction: 'none', cursor: 'pointer', userSelect: 'none', overflow: 'visible', maxWidth: '400px' }}>
      <Card variant={isDown ? 'shadow' : 'bordered'} style={{ display: 'inline-block', width: 'auto' }}>
        <Card.Header>
          <Row justify='space-between'>
            <Text b>{props.title}</Text>

            <button className='connector bg-transparent border-2 border-solid rounded-full w-4 h-4 cursor-cell'></button>
          </Row>
        </Card.Header>
        <Card.Divider />
        <Card.Body css={{ py: "$10", height: '100%' }}>
          <Text>
            {props.body}
          </Text>
        </Card.Body>
      </Card>
    </animated.div>
  )
}

export default GrabbableObject;
