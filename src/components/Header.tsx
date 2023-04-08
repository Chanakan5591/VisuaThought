import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import type { NextComponentType } from "next";
import Link from "next/link";
import NavButton from "./NavButton";
import { useEffect, useState } from "react";

const Header = (props: Props) => {
  const user = useUser()

  return (
    <header className='fixed w-full p-2 z-20 flex mx-auto'>
      <nav className='w-full justify-between flex items-center'>
        <div className='flex items-center'>
          <h2 className='font-semibold tracking-lighter text-lg mr-2'>VisuaThought</h2>
          <NavButton href='/'>New</NavButton>
        </div>
        <div className='flex items-center'>
          {!user.user ?
            <NavButton href='/sign-in'>Sign In</NavButton>
            :
            <UserButton />
          }
        </div>
      </nav>

    </header>

  );
};

export default Header;
