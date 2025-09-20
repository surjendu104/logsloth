import { type JSX } from 'react';
import classes from './Header.module.css';
import { BsArrowUpRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const Header = (): JSX.Element => {
  return (
    <div className={classes.head}>
      <Link className={classes.name} to={'/'}>Log Sloth</Link>
      <div className={classes.right}>
        <a href="/">Home</a>
        <a
          href="https://github.com/surjendu104/logsloth"
          className={classes.github}
        >
          <span>Github</span> <BsArrowUpRight />
        </a>
      </div>
    </div>
  );
};

export default Header;
