import { UserButton, useUser } from "@clerk/nextjs";
import NavButton from "./NavButton";
import { useEffect, useState } from "react";
import { Card } from "@nextui-org/react";
import { useSpring, animated } from "@react-spring/web";

interface Props {
  mouseClickedMain: boolean,
  createClicked: (value: boolean) => void
}

const Header = (props: Props) => {
  const user = useUser()
  const [newDialog, setNewDialog] = useState(false)

  const setDialog = () => {
    setNewDialog(!newDialog)
  }

  useEffect(() => {
    if (newDialog) {
      props.createClicked(true)
    } else props.createClicked(false)
  }, [newDialog, props])

  useEffect(() => {
    if (props.mouseClickedMain) setNewDialog(false)
  }, [props.mouseClickedMain])

  const modalSpring = useSpring({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: newDialog ? 1 : 0, scale: newDialog ? 1 : 0.9 },
    config: { tension: 200, friction: 20 }
  })


  return (
    <header className='fixed w-full p-2 z-20 flex mx-auto'>
      <nav className='w-full justify-between flex items-center'>
        <div className='flex items-center'>
          <h2 className='font-semibold tracking-lighter text-lg mr-2'>VisuaThought</h2>
          <NavButton onClick={setDialog}>New</NavButton>
          {newDialog &&
            <animated.div style={modalSpring} className='new-modal absolute top-9 left-32'>
              <Card variant='shadow' style={{ display: 'inline-block', width: 'auto', border: '1px solid #0006' }}>
                <Card.Body css={{ py: "$10", height: '100%' }}>
                  <NavButton disabled className='mb-2'>New Spaces</NavButton>
                </Card.Body>
                <Card.Divider />
              </Card>

            </animated.div>
          }

        </div>
        <div className='flex items-center'>
          {!user.user ?
            <NavButton href='/sign-in'>Sign In</NavButton>
            :
            <UserButton appearance={{
              elements: {
                userButtonAvatarBox: 'h-10 w-10'
              }
            }} />
          }
        </div>
      </nav>

    </header>

  );
};

export default Header;
