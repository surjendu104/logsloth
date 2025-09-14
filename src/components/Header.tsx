import { type JSX } from 'react';
import { LuGithub } from 'react-icons/lu';
import classes from './Header.module.css';

const Header = (): JSX.Element => {
  return (
    <div className={classes.head}>
      <div className={classes.name}>Log River</div>
      <div className={classes.right}>
        <a href="">Home</a>
        <a href="">Dashboard</a>
        <a href="">
          <LuGithub />
        </a>
      </div>
    </div>
  );
};

export default Header;
