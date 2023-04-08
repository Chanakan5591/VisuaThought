import { SignIn } from "@clerk/nextjs";
import type { NextComponentType } from "next";
import Link from "next/link";
import NavButton from "./NavButton";

const Header = () => {
  return (
    <header className='fixed w-full p-2 z-20 flex mx-auto'>
      <nav className='w-full justify-between flex'>
        <div className='flex items-center'>
          <h2 className='font-semibold tracking-lighter text-lg'>Left Section</h2>
        </div>
        <div className='flex items-center'>
          <NavButton href='/auth'>Authenticate</NavButton>
        </div>
      </nav>
    </header>

  );
};

export default Header;
