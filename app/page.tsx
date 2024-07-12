'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import Profile from "./_lib/Profile";
import { StrictMode, useEffect, useState } from "react";
import { SessionContext } from "./_lib/SessionContext";
import useUser from "./_lib/useUser";
import Header from "./_lib/Header";
import Menu from "./_lib/Menu";
import { useRouter } from "next/navigation";

export default function Home() {
  const user = useUser();
  const router = useRouter()

  function onLoginClick() {
    router.push('/login');
  }

  function onRegisterClick() {
    router.push('/register')
  }

  return (
    <StrictMode>
      <Header user={user} line1={{ text: 'pr-groups', fontSize: '1.5rem', bold: true }} margin='0' line2={{ text: '', fontSize: '1.2rem', bold: false }} />
      <Menu />
      <div className={styles.buttons}>
        <p>
          <a onClick={onRegisterClick}>Register</a>
        </p>
        <p>
          <a onClick={onLoginClick}>Login</a>
        </p>
      </div>
    </StrictMode>
  );
}
