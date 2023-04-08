import Link from "next/link";
import styles from '../styles/NavButton.module.css'

interface Props {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const NavButton = (props: Props) => {
  return (
    <div className={styles.buttonwrap}>
      {props.href ?
        <Link className={styles.button} href={props.href}>{props.children}</Link>
        :
        <button className={styles.button} onClick={props.onClick}>{props.children}</button>
      }
    </div>
  );
};

export default NavButton;
