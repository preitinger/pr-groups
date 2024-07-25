
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
      <div className='memberOuter'>
        <div className='memberInner'>
          <div className='d5'>
            <div className='d6'>
            </div>
            <div id='d4' className='d4'>
            </div>
          </div>
          <div className='d2'>
          </div>
          {children}
        </div>
      </div>
      {/* <div className='d3'>
        {children}
      </div> */}

    </>
  );
}

