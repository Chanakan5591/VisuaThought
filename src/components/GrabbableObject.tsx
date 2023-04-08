import { Card, Grid, Row, Text } from '@nextui-org/react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import React from 'react'
import useSound from 'use-sound'

interface Props {
  title: string,
  body: string
}

const GrabbableObject = (props: Props) => {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [isDown, setDown] = useState(false)
  const [placeFX] = useSound('sounds/card-place.mp3')

  const bind = useDrag(({ event, down, movement: [mx, my] }) => {
    const ignoreButton = (event.target as Element).closest('.connector')

    if(!ignoreButton) {

    setDown(down)
      if (down) {
        const newX = Math.max(0, mx + startX)
        const newY = Math.max(0, my + startY)
        api.start({ x: newX, y: newY, immediate: down })
      } else {
        placeFX()
        setStartX(x.get())
        setStartY(y.get())
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
