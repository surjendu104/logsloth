import { type JSX } from 'react';
import classes from './Header.module.css';
import { BsArrowUpRight } from 'react-icons/bs';

const Header = (): JSX.Element => {
  return (
    <div className={classes.head}>
      <div className={classes.name}>Log Sloth</div>
      <div className={classes.right}>
        <a href="/">Home</a>
        <a
          href="https://github.com/surjendu104/logsloth"
          className={classes.github}
        >
          <span>github</span> <BsArrowUpRight />
        </a>
      </div>
    </div>
  );
};

export default Header;
