'use client'

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import Profile from "./_lib/Profile";
import { StrictMode, useEffect, useRef, useState } from "react";
import { SessionContext } from "./_lib/SessionContext";
import useUser from "./_lib/useUser";
import Header from "./_lib/Header";
import Menu from "./_lib/Menu";
import { useRouter } from "next/navigation";
import Input2 from "./_lib/pr-client-utils/Input2";
import FormComp from "./_lib/pr-client-utils/FormComp";
import Button from "./_lib/Button";

export default function Home() {
  // const user = useUser();
  const router = useRouter()
  const [pageWidth, setPageWidth] = useState(100);
  const mainDivRef = useRef<HTMLDivElement>(null);
  const [registering, setRegistering] = useState(false);
  const [user, setUser] = useState('');
  const [passwd, setPasswd] = useState('');
  const [passwdRepeat, setPasswdRepeat] = useState('');
  const [cookiesAccepted, setCookiesAccepted] = useState(false);

  function onLoginClick() {
    router.push('/login');
  }

  function onRegisterClick() {
    // setRegistering(true)
    router.push('/register')
  }

  useEffect(() => {
    const mainDiv = mainDivRef.current;
    if (mainDiv == null) {
      console.error('mainDivRef.current null');
      return;
    }
    const w = window.innerWidth > 0 ? window.innerWidth : screen.width;
    setPageWidth(w);
    const resizeObserver = new ResizeObserver((entries, observer) => {
      const w = window.innerWidth > 0 ? window.innerWidth : screen.width;
      setPageWidth(w);
    })

    resizeObserver.observe(mainDiv);

    return () => {
      resizeObserver.unobserve(mainDiv)
    }

  }, [])

  const descMembers = 'Ermögliche den Mitgliedern deiner Gruppe eine einfache Anmeldung zu Aktivitäten oder Ausflügen.'
  const descAllActivities = 'Behalte einen guten Überblick über die Aktivitäten der Gruppen, die du betreust, in deinem Desktop-Browser.'

  return (
    <StrictMode>
      <Menu setCookiesAccepted={setCookiesAccepted} />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>pr-groups</h1>
          <div className={styles.buttons}>
            <Button className={styles.register} onClick={onRegisterClick}>Konto erstellen</Button>
            <Button className={styles.login} onClick={onLoginClick}>Anmelden</Button>
          </div>
        </div>
        <div ref={mainDivRef} className={styles.main}>
          {
            registering &&
            <FormComp >
              <h1>Konto erstellen</h1>
              <Input2 label='User' type='text' text={user} setText={setUser} />
              <Input2 type='password' label='Passwort' text={passwd} setText={setPasswd} />
              <Input2 type='password' label='Passwort wiederholen' text={passwdRepeat} setText={setPasswdRepeat} />
              <button className={styles.registerButton} onClick={onRegisterClick}>Weiter</button>
            </FormComp>

          }
          <div className={styles.row}>
            <h2>Gruppenaktivitäten super-easy organisiert!</h2>
          </div>
          <div className={styles.row}>
            <Image src='/group-friends-jumping-top-hill.jpg' alt='Gruppe' width={576} height={384} className={styles.coverImg} />
            <Image src='/43702940_9078334.jpg' alt='Friends' width={600} height={400} className={styles.coverImg} />
            {
              pageWidth < 800 && <p>{descMembers}</p>
            }
            <div className={styles.box}>
              <div className={styles.border}>
                <div className={styles.largeImg}>
                  {/* <Image src='/screenshot-member.png' alt='Screenshot Mitgliederansicht' width={380} height={670} /> */}
                  <Image src='/screenshot-member.png' alt='Screenshot Mitgliederansicht' width={190} height={335} />
                </div>
              </div>
              {pageWidth >= 800 && <p>{descMembers}</p>}
            </div>
            {
              pageWidth < 800 && <p>{descAllActivities}</p>
            }
            <div className={styles.box}>
              <div className={styles.border}>
                <div className={styles.largeImg}>
                  {/* <Image className={styles.screenShot} src='/screenshot-all-activities.png' alt='Screenshot all-activities' width={1865} height={893} /> */}
                  <Image className={styles.screenShot} src='/screenshot-all-activities.png' alt='Screenshot all-activities' width={932} height={446} />
                  {pageWidth >= 800 && <p className={styles.descAllActivities}>{descAllActivities}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StrictMode>
  );
}
