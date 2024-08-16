import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "pr-groups",
  description: "Light groups and activities management system",
};

export const viewport: Viewport = {
  width: 'device-width',
  // initialScale: 1
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  // return (
  //   <html lang="de">
  //     <body className={inter.className}>
  //       <div className='d1'>
  //         <div className='d5'>
  //           <div className='d6'>
  //           </div>
  //           <div id='d4' className='d4'>
  //             d4
  //           </div>
  //         </div>
  //         <div className='d2'>
  //         </div>
  //         <div className='d3'>
  //           {children}
  //         </div>
  //       </div>
  //     </body>
  //   </html>
  // );

  return (
    <html lang="de">
      <body className={inter.className}>
        <div className='d1'>
          {children}
        </div>
      </body>
    </html>
  );
}
