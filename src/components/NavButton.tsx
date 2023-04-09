import Link from "next/link";
import styles from '../styles/NavButton.module.css'
import { HTMLAttributes } from "react";

interface Props {
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean
}

const NavButton = (props: Props) => {
  return (
    <div className={styles.buttonwrap}>
      {props.href ?
        <Link className={styles.button} href={props.href}>{props.children}</Link>
        :
        <button style={props.style} disabled={props.disabled} className={`${styles.button} ${props.className} ${props.disabled ? 'cursor-not-allowed' : ''}`} onClick={props.onClick}>{props.children}</button>
      }
    </div>
  );
};

export default NavButton;
