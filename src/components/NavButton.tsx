import Link from "next/link";
import styles from '../styles/NavButton.module.css'

interface Props {
  href: string;
  children: React.ReactNode;
}

const NavButton = (props: Props) => {
  return (
    <div className={styles.buttonwrap}>
      <Link className={styles.button} href={props.href}>{props.children}</Link>
    </div>
  );
};

export default NavButton;
