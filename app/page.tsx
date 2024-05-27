'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import Profile from "./_lib/Profile";
import { useEffect, useState } from "react";
import { SessionContext } from "./_lib/SessionContext";
import useUser from "./_lib/useUser";
import Header from "./_lib/Header";
import Menu from "./_lib/Menu";

export default function Home() {
  const user = useUser();

  return (
    <>
      <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.5rem', bold: true }} margin='0' line2={{ text: '', fontSize: '1.2rem', bold: false }} />
      <Menu />
      <div className={styles.buttons}>
        <p>
          <Link href='/register'>Register</Link>
        </p>
        <p>
          <Link href='/login'>Login</Link>
        </p>
      </div>
    </>
  );
}
