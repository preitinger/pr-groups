import clientPromise from "@/app/_lib/user-management-server/mongodb"
import { GroupDoc } from "@/app/api/documents"
import { Metadata, ResolvingMetadata } from "next"
import { Inter } from "next/font/google"


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  
    {/*
      <div className='d5'>
             <div className='d6'>
             </div>
             <div id='d4' className='d4'>
               d4
             </div>
           </div>
           <div className='d2'>
           </div>
           <div className='d3'>
             {children}
           </div>
  */}

  return (
    <>
      <div className='d5'>
        <div className='d6'>
        </div>
        <div id='d4' className='d4'>
        </div>
      </div>
      <div className='d2'>
      </div>
      <div className='d3'>
        {children}
      </div>
    </>
  );
}

