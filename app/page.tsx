'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import Profile from "./_lib/Profile";
import { useEffect, useState } from "react";
import { SessionContext } from "./_lib/SessionContext";
import useUser from "./_lib/useUser";

export default function Home() {
  const user = useUser();

  return (
    <div className={styles.container}>
      <Profile user={user} />
      <div className={styles.buttons}>
        <Link href='/register' className={styles.registerButton}>Register</Link>
        <Link href='/login' className={styles.loginButton}>Login</Link>
      </div>
    </div>
  );
}
