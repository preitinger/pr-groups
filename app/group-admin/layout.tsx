export default function Layout({ children }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <>
            <div className='d3'>
                {children}
            </div>
        </>
    )
}