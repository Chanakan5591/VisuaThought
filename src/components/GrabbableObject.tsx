import { Card, Grid, Text } from '@nextui-org/react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import { useRef, useState, useEffect } from 'react'
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

  const bind = useDrag(({ down, movement: [mx, my] }) => {
    setDown(down)
    if (down) {
      api.start({ x: mx + startX, y: my + startY, immediate: down })
    } else {
      placeFX()
      setStartX(x.get())
      setStartY(y.get())
    }
  })

  return (
    <animated.div className='relative' {...bind()} style={{ x, y, touchAction: 'none', cursor: 'pointer' }}>
      <Card variant={isDown ? 'shadow' : 'bordered'}>
        <Card.Header>
          <Text b>{props.title}</Text>
        </Card.Header>
        <Card.Divider />
        <Card.Body css={{ py: "$10" }}>
          <Text>
            {props.body}
          </Text>
        </Card.Body>
      </Card>
    </animated.div>
  )
}

export default GrabbableObject;
